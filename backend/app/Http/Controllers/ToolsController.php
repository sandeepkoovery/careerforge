<?php

namespace App\Http\Controllers;

use App\Models\Analysis;
use App\Models\Resume;
use App\Services\AtsAnalyzer;
use App\Services\CoverLetterGenerator;
use App\Services\JobMatcher;
use App\Services\LinkedInOptimizer;
use App\Services\Llm;
use App\Services\ResumeText;
use App\Services\Suggester;
use App\Services\TextExtractor;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Public-facing AI tools. Anyone can run them; signed-in users also get history.
 */
class ToolsController extends Controller
{
    public function status(Llm $llm)
    {
        return response()->json(['ai' => $llm->enabled() ? 'llm' : 'smart-engine']);
    }

    public function ats(Request $request, TextExtractor $extractor, AtsAnalyzer $ats)
    {
        $request->validate([
            'file' => 'nullable|file|mimes:pdf,docx,txt|max:5120',
            'text' => 'nullable|string|max:60000',
            'resume_id' => 'nullable|integer',
            'job_description' => 'nullable|string|max:20000',
        ]);
        [$text, $label] = $this->resumeInput($request, $extractor);
        $result = $ats->analyze($text, $request->input('job_description'));
        $this->remember($request, 'ats', $label, $result['score'], $result);

        if ($request->filled('resume_id') && $request->user('sanctum')) {
            Resume::where('user_id', $request->user('sanctum')->id)->where('id', $request->resume_id)->update(['ats_score' => $result['score']]);
        }

        return response()->json($result);
    }

    public function jobMatch(Request $request, TextExtractor $extractor, JobMatcher $matcher)
    {
        $request->validate([
            'file' => 'nullable|file|mimes:pdf,docx,txt|max:5120',
            'text' => 'nullable|string|max:60000',
            'resume_id' => 'nullable|integer',
            'job_description' => 'required|string|min:40|max:20000',
            'job_title' => 'nullable|string|max:150',
        ]);
        [$text, $label] = $this->resumeInput($request, $extractor);
        $result = $matcher->match($text, $request->input('job_description'));
        $this->remember($request, 'match', $request->input('job_title') ?: $label, $result['score'], $result);

        return response()->json($result);
    }

    public function coverLetter(Request $request, CoverLetterGenerator $gen)
    {
        $v = $request->validate([
            'resume_id' => 'required|integer',
            'company' => 'required|string|max:150',
            'job_title' => 'required|string|max:150',
            'manager' => 'nullable|string|max:100',
            'tone' => 'nullable|in:professional,enthusiastic,concise,creative',
            'job_description' => 'nullable|string|max:20000',
        ]);
        $user = $request->user('sanctum');
        abort_unless($user, 401, 'Sign in to generate a cover letter from your resume.');
        $resume = $user->resumes()->findOrFail($v['resume_id']);

        $result = $gen->generate($resume->data, $v);
        $this->remember($request, 'cover', "{$v['job_title']} @ {$v['company']}", null, $result);

        return response()->json($result);
    }

    public function linkedin(Request $request, LinkedInOptimizer $opt)
    {
        $v = $request->validate([
            'resume_id' => 'required|integer',
            'target_role' => 'nullable|string|max:150',
            'current_headline' => 'nullable|string|max:300',
            'current_about' => 'nullable|string|max:5000',
        ]);
        $user = $request->user('sanctum');
        abort_unless($user, 401, 'Sign in to optimise your LinkedIn profile from your resume.');
        $resume = $user->resumes()->findOrFail($v['resume_id']);

        $result = $opt->optimize($resume->data, $v);
        $this->remember($request, 'linkedin', $v['target_role'] ?? $resume->title, $result['score'], $result);

        return response()->json($result);
    }

    public function suggest(Request $request, Suggester $suggester)
    {
        $v = $request->validate([
            'type' => 'required|in:bullet,summary,skills',
            'text' => 'nullable|string|max:1000',
            'role' => 'nullable|string|max:150',
            'years' => 'nullable|integer|min:0|max:60',
            'skills' => 'nullable|array|max:60',
            'skills.*' => 'string|max:60',
            'experience' => 'nullable|array|max:5',
        ]);

        return response()->json($suggester->run($v['type'], $v));
    }

    public function history(Request $request)
    {
        $rows = Analysis::where('user_id', $request->user()->id)->latest()->limit(40)->get();

        return response()->json(['history' => $rows]);
    }

    public function deleteHistory(Request $request, int $id)
    {
        Analysis::where('user_id', $request->user()->id)->where('id', $id)->delete();

        return response()->json(['message' => 'Deleted']);
    }

    /** @return array{0:string,1:string} [text, label] */
    private function resumeInput(Request $request, TextExtractor $extractor): array
    {
        if ($request->hasFile('file')) {
            return [$extractor->extract($request->file('file')), $request->file('file')->getClientOriginalName()];
        }
        if ($request->filled('resume_id') && ($user = $request->user('sanctum'))) {
            $resume = $user->resumes()->findOrFail($request->input('resume_id'));

            return [ResumeText::fromData($resume->data), $resume->title];
        }
        if ($request->filled('text')) {
            return [$request->input('text'), 'Pasted text'];
        }
        throw ValidationException::withMessages(['file' => 'Upload a resume file, paste your resume text, or pick a saved resume.']);
    }

    private function remember(Request $request, string $type, ?string $title, ?int $score, array $payload): void
    {
        if ($user = $request->user('sanctum')) {
            $payload = array_diff_key($payload, ['text_preview' => 1]);
            Analysis::create(['user_id' => $user->id, 'type' => $type, 'title' => $title, 'score' => $score, 'payload' => $payload]);
        }
    }
}
