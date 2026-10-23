<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\LoginActivity;

$geoProfiles = [
    ['ip' => '103.246.40.12', 'city' => 'Mumbai', 'region' => 'Maharashtra', 'country' => 'India', 'country_code' => 'IN', 'isp' => 'Reliance Jio Infocomm', 'device' => 'Chrome on Windows 11'],
    ['ip' => '49.207.200.5', 'city' => 'Bengaluru', 'region' => 'Karnataka', 'country' => 'India', 'country_code' => 'IN', 'isp' => 'Bharti Airtel Broadband', 'device' => 'Edge on Windows 11'],
    ['ip' => '182.73.224.15', 'city' => 'Pune', 'region' => 'Maharashtra', 'country' => 'India', 'country_code' => 'IN', 'isp' => 'Tata Teleservices', 'device' => 'Safari on macOS'],
    ['ip' => '103.111.160.10', 'city' => 'New Delhi', 'region' => 'Delhi', 'country' => 'India', 'country_code' => 'IN', 'isp' => 'ACT Fibernet', 'device' => 'Chrome on Android'],
    ['ip' => '157.48.120.44', 'city' => 'Hyderabad', 'region' => 'Telangana', 'country' => 'India', 'country_code' => 'IN', 'isp' => 'Hathway Cable & Datacom', 'device' => 'Firefox on Windows 10'],
    ['ip' => '198.51.100.22', 'city' => 'San Jose', 'region' => 'California', 'country' => 'United States', 'country_code' => 'US', 'isp' => 'AT&T Internet', 'device' => 'Safari on iOS'],
    ['ip' => '82.165.197.1', 'city' => 'London', 'region' => 'Greater London', 'country' => 'United Kingdom', 'country_code' => 'GB', 'isp' => 'BT Broadband', 'device' => 'Chrome on macOS'],
];

$users = User::all();
foreach ($users as $idx => $user) {
    $geo = $geoProfiles[$idx % count($geoProfiles)];
    $user->last_login_ip = $geo['ip'];
    $user->last_login_city = $geo['city'];
    $user->last_login_region = $geo['region'];
    $user->last_login_country = $geo['country'];
    $user->last_login_country_code = $geo['country_code'];
    $user->last_login_at = now()->subMinutes(rand(5, 720));
    $user->last_device = $geo['device'];
    $user->save();

    LoginActivity::create([
        'user_id' => $user->id,
        'user_email' => $user->email,
        'ip_address' => $geo['ip'],
        'city' => $geo['city'],
        'region' => $geo['region'],
        'country' => $geo['country'],
        'country_code' => $geo['country_code'],
        'isp' => $geo['isp'],
        'user_agent' => $geo['device'],
        'device' => $geo['device'],
        'status' => 'success',
        'is_admin_login' => (bool)$user->is_admin,
        'created_at' => $user->last_login_at,
    ]);
}

// Add a few more global visitor sessions for rich country stats
$extraLogins = [
    ['user_id' => null, 'user_email' => 'visitor.ny@gmail.com', 'ip' => '198.51.100.22', 'city' => 'New York', 'region' => 'New York', 'country' => 'United States', 'country_code' => 'US', 'isp' => 'Verizon Fios', 'device' => 'Chrome on Windows 11'],
    ['user_id' => null, 'user_email' => 'dev.uk@outlook.com', 'ip' => '82.165.197.1', 'city' => 'London', 'region' => 'England', 'country' => 'United Kingdom', 'country_code' => 'GB', 'isp' => 'Vodafone UK', 'device' => 'Safari on macOS'],
    ['user_id' => null, 'user_email' => 'user.sg@gmail.com', 'ip' => '103.21.244.2', 'city' => 'Singapore', 'region' => 'Singapore', 'country' => 'Singapore', 'country_code' => 'SG', 'isp' => 'Singtel', 'device' => 'Chrome on Android'],
    ['user_id' => null, 'user_email' => 'toronto.pro@ca.com', 'ip' => '142.250.190.46', 'city' => 'Toronto', 'region' => 'Ontario', 'country' => 'Canada', 'country_code' => 'CA', 'isp' => 'Rogers Cable', 'device' => 'Firefox on Windows 11'],
];

foreach ($extraLogins as $extra) {
    LoginActivity::create([
        'user_id' => $extra['user_id'],
        'user_email' => $extra['user_email'],
        'ip_address' => $extra['ip'],
        'city' => $extra['city'],
        'region' => $extra['region'],
        'country' => $extra['country'],
        'country_code' => $extra['country_code'],
        'isp' => $extra['isp'],
        'user_agent' => $extra['device'],
        'device' => $extra['device'],
        'status' => 'success',
        'is_admin_login' => false,
        'created_at' => now()->subMinutes(rand(10, 400)),
    ]);
}

echo "Geo seeding completed! Total LoginActivity rows: " . LoginActivity::count() . PHP_EOL;
