<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Thin wrapper over an OpenAI-compatible API. Returns null when unconfigured or on failure
 * so callers can fall back to the rule-based engines.
 */
class Llm
{
    public function enabled(): bool
    {
        return filled(config('careerforge.llm.key'));
    }

    public function complete(string $system, string $user, float $temperature = 0.7): ?string
    {
        if (! $this->enabled()) {
            return null;
        }
        $cfg = config('careerforge.llm');

        try {
            $res = Http::withToken($cfg['key'])->timeout($cfg['timeout'])
                ->post($cfg['base_url'].'/chat/completions', [
                    'model' => $cfg['model'],
                    'temperature' => $temperature,
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => $user],
                    ],
                ]);
            if ($res->failed()) {
                Log::warning('LLM request failed', ['status' => $res->status(), 'body' => $res->body()]);

                return null;
            }

            return trim((string) $res->json('choices.0.message.content')) ?: null;
        } catch (\Throwable $e) {
            Log::warning('LLM exception: '.$e->getMessage());

            return null;
        }
    }

    /** Ask for JSON and decode it; null if unavailable or malformed. */
    public function json(string $system, string $user): ?array
    {
        $raw = $this->complete($system.' Respond with valid JSON only, no markdown fences.', $user, 0.6);
        if (! $raw) {
            return null;
        }
        $raw = preg_replace('/^```(?:json)?|```$/m', '', $raw);
        $decoded = json_decode(trim($raw), true);

        return is_array($decoded) ? $decoded : null;
    }
}
