<?php

return [
    'cache_strategy' => env('PDF_CACHE_STRATEGY', 'local'), // local | cdn
    'cache_ttl' => (int) env('PDF_CACHE_TTL', 2592000),

    // not yet implemented
    // used only for `cdn`
    // 'cdn_base_url' => env('PDF_CDN_BASE_URL'), // e.g. https://cdn.example.com
];
