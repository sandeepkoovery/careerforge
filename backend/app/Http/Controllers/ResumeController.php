<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Services\AtsAnalyzer;
use App\Services\ResumeImporter;
use App\Services\ResumeText;
use App\Services\TextExtractor;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ResumeController extends Controller
{
    public const FREE_TEMPLATES = ['modern', 'classic', 'minimal'];
    public const ALL_TEMPLATES = [
        'modern', 'classic', 'minimal', 'executive', 'creative', 'tech',
        'metro', 'compact', 'academic', 'elegant', 'infographic', 'corporate',
        'nordic', 'silicon', 'cascade', 'zenith', 'nova', 'matrix',
        'horizon', 'prestige', 'artisan', 'catalyst', 'vanguard', 'prime',
        'frontier', 'odyssey', 'sovereign', 'monarch', 'alpine', 'titan',
        'element', 'atlas', 'orbit', 'pinnacle', 'quantum',
    ];

    public function index(Request $request)
    {
        return response()->json(['resumes' => $request->user()->resumes()->latest('updated_at')->get()]);
    }

    public function store(Request $request)
    {
        $v = $request->validate([
            'title' => 'nullable|string|max:120',
            'template' => ['nullable', Rule::in(self::ALL_TEMPLATES)],
            'accent' => 'nullable|string|max:20',
            'font' => 'nullable|string|max:40',
            'data' => 'nullable|array',
        ]);

        $template = $v['template'] ?? 'modern';
        if (!in_array($template, self::FREE_TEMPLATES, true) && !$request->user()->is_pro) {
            return response()->json([
                'message' => 'The "'.$template.'" template is a Pro feature. Upgrade to Pro to unlock all templates.',
                'pro_required' => true,
            ], 403);
        }

        $resume = $request->user()->resumes()->create([
            'title' => $v['title'] ?? 'Untitled Resume',
            'template' => $template,
            'accent' => $v['accent'] ?? '#6366f1',
            'font' => $v['font'] ?? 'inter',
            'data' => $v['data'] ?? ResumeText::blank($request->user()->name),
        ]);

        return response()->json(['resume' => $resume], 201);
    }

    public function show(Request $request, int $id)
    {
        return response()->json(['resume' => $request->user()->resumes()->findOrFail($id)]);
    }

    public function update(Request $request, int $id, AtsAnalyzer $ats)
    {
        $resume = $request->user()->resumes()->findOrFail($id);
        $v = $request->validate([
            'title' => 'sometimes|string|max:120',
            'template' => ['sometimes', Rule::in(self::ALL_TEMPLATES)],
            'accent' => 'sometimes|string|max:20',
            'font' => 'sometimes|string|max:40',
            'data' => 'sometimes|array',
        ]);

        if (isset($v['template']) && !in_array($v['template'], self::FREE_TEMPLATES, true) && !$request->user()->is_pro) {
            return response()->json([
                'message' => 'The "'.$v['template'].'" template requires an upgrade to Pro.',
                'pro_required' => true,
            ], 403);
        }

        $resume->fill($v);
        if (isset($v['data'])) {
            $resume->ats_score = $ats->analyze(ResumeText::fromData($v['data']))['score'];
        }
        $resume->save();

        return response()->json(['resume' => $resume]);
    }

    public function destroy(Request $request, int $id)
    {
        $request->user()->resumes()->findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function duplicate(Request $request, int $id)
    {
        $src = $request->user()->resumes()->findOrFail($id);
        $copy = $src->replicate();
        $copy->title = $src->title.' (Copy)';
        $copy->save();

        return response()->json(['resume' => $copy], 201);
    }

    /** Create a resume by importing an uploaded PDF/DOCX/TXT. */
    public function import(Request $request, TextExtractor $extractor, ResumeImporter $importer, AtsAnalyzer $ats)
    {
        $request->validate(['file' => 'required|file|mimes:pdf,docx,txt|max:5120']);
        $text = $extractor->extract($request->file('file'));
        $data = $importer->import($text);

        $resume = $request->user()->resumes()->create([
            'title' => pathinfo($request->file('file')->getClientOriginalName(), PATHINFO_FILENAME) ?: 'Imported Resume',
            'template' => 'modern',
            'data' => $data,
            'ats_score' => $ats->analyze($text)['score'],
        ]);

        return response()->json(['resume' => $resume], 201);
    }
}
