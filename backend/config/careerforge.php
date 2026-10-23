<?php

return [
    /*
    | Optional LLM provider (any OpenAI-compatible chat completions API).
    | Leave LLM_API_KEY empty to use the built-in rule-based engines.
    */
    'llm' => [
        'key' => env('LLM_API_KEY'),
        'base_url' => rtrim(env('LLM_BASE_URL', 'https://api.openai.com/v1'), '/'),
        'model' => env('LLM_MODEL', 'gpt-4o-mini'),
        'timeout' => 45,
    ],
];
