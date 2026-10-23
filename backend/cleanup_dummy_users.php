<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$dummyEmails = [
    'zmcclavertye@soundcloud.com',
    'ypottiec@privacy.gov.au',
    'wburlandj@uiuc.edu',
    'vkoschek17@cba.net.au',
    'twidmore12@bravesites.com',
    'tbruntjen@citomotor.com',
];

$deleted = User::whereIn('email', $dummyEmails)->delete();
echo "Deleted {$deleted} dummy demo users. Remaining real users: " . User::count() . PHP_EOL;

foreach (User::all() as $u) {
    echo "- #{$u->id}: {$u->name} ({$u->email}) - Pro: " . ($u->is_pro ? 'Yes' : 'No') . " - Trial: " . ($u->is_trial ? 'Yes' : 'No') . " - Expired: " . ($u->is_trial_expired ? 'Yes' : 'No') . " - Admin: " . ($u->is_admin ? 'Yes' : 'No') . PHP_EOL;
}
