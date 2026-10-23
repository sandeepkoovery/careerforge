<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

try {
    $ipResp = Http::timeout(3)->get('https://api.ipify.org?format=json');
    $ip = $ipResp->json('ip');
    echo "Real Public IP detected: " . $ip . PHP_EOL;

    $geoResp = Http::timeout(3)->get("http://ip-api.com/json/{$ip}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp");
    echo "Geo details for {$ip}:" . PHP_EOL;
    print_r($geoResp->json());
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}
