<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\LoginActivity;
use Illuminate\Support\Facades\Hash;

$demoUsers = [
    [
        'name' => 'Zsazsa McCleverty',
        'email' => 'zmcclavertye@soundcloud.com',
        'role' => 'Maintainer',
        'plan' => 'Enterprise',
        'billing' => 'Auto Debit',
        'status' => 'Active',
        'is_pro' => true,
        'is_admin' => false,
        'avatar_color' => '#28c76f',
        'initials' => 'ZM',
        'ip' => '103.175.136.200',
        'city' => 'Kannur',
        'country' => 'India',
        'country_code' => 'IN',
    ],
    [
        'name' => 'Yoko Pottie',
        'email' => 'ypottiec@privacy.gov.au',
        'role' => 'Subscriber',
        'plan' => 'Basic',
        'billing' => 'Auto Debit',
        'status' => 'Inactive',
        'is_pro' => false,
        'is_admin' => false,
        'avatar_color' => '#00cfe8',
        'initials' => 'YP',
        'ip' => '103.246.40.12',
        'city' => 'Mumbai',
        'country' => 'India',
        'country_code' => 'IN',
    ],
    [
        'name' => 'Wesley Burland',
        'email' => 'wburlandj@uiuc.edu',
        'role' => 'Editor',
        'plan' => 'Team',
        'billing' => 'Auto Debit',
        'status' => 'Inactive',
        'is_pro' => false,
        'is_admin' => false,
        'avatar_color' => '#7367f0',
        'initials' => 'WB',
        'ip' => '49.207.200.5',
        'city' => 'Bengaluru',
        'country' => 'India',
        'country_code' => 'IN',
    ],
    [
        'name' => 'Vladamir Koschek',
        'email' => 'vkoschek17@cba.net.au',
        'role' => 'Author',
        'plan' => 'Team',
        'billing' => 'Manual - Paypal',
        'status' => 'Active',
        'is_pro' => true,
        'is_admin' => false,
        'avatar_color' => '#ff9f43',
        'initials' => 'VK',
        'ip' => '182.73.224.15',
        'city' => 'Pune',
        'country' => 'India',
        'country_code' => 'IN',
    ],
    [
        'name' => 'Tyne Widmore',
        'email' => 'twidmore12@bravesites.com',
        'role' => 'Subscriber',
        'plan' => 'Team',
        'billing' => 'Manual - Cash',
        'status' => 'Pending',
        'is_pro' => false,
        'is_admin' => false,
        'avatar_color' => '#00cfe8',
        'initials' => 'TW',
        'ip' => '103.111.160.10',
        'city' => 'New Delhi',
        'country' => 'India',
        'country_code' => 'IN',
    ],
    [
        'name' => 'Travus Bruntjen',
        'email' => 'tbruntjen@citomotor.com',
        'role' => 'Admin',
        'plan' => 'Enterprise',
        'billing' => 'Manual - Cash',
        'status' => 'Active',
        'is_pro' => true,
        'is_admin' => true,
        'avatar_color' => '#ea5455',
        'initials' => 'TB',
        'ip' => '103.175.136.200',
        'city' => 'Kannur',
        'country' => 'India',
        'country_code' => 'IN',
    ],
];

foreach ($demoUsers as $item) {
    $u = User::firstOrNew(['email' => $item['email']]);
    $u->name = $item['name'];
    if (!$u->exists) {
        $u->password = Hash::make('password123');
    }
    $u->is_pro = $item['is_pro'];
    $u->is_admin = $item['is_admin'];
    $u->trial_ends_at = $item['status'] === 'Active' ? now()->addDays(28) : ($item['status'] === 'Pending' ? now()->subDays(2) : null);
    $u->last_login_ip = $item['ip'];
    $u->last_login_city = $item['city'];
    $u->last_login_region = 'Kerala';
    $u->last_login_country = $item['country'];
    $u->last_login_country_code = $item['country_code'];
    $u->last_login_at = now()->subMinutes(rand(10, 400));
    $u->last_device = 'Chrome on Windows 11';
    $u->save();
}

echo "Vuexy users seeded successfully! Total users now: " . User::count() . PHP_EOL;
