<?php

$ch = curl_init('http://127.0.0.1:8000/api/admin/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'admin@smartcvmaker.com',
    'password' => 'admin12345',
]));

$resp = curl_exec($ch);
curl_close($ch);

$data = json_decode($resp, true);
echo "ADMIN LOGIN RESPONSE:" . PHP_EOL;
echo "User: " . ($data['user']['name'] ?? 'none') . PHP_EOL;
echo "Admin: " . (($data['user']['is_admin'] ?? false) ? 'YES' : 'NO') . PHP_EOL;
echo "Token: " . substr($data['token'] ?? '', 0, 15) . '...' . PHP_EOL;

if (isset($data['token'])) {
    $ch2 = curl_init('http://127.0.0.1:8000/api/admin/users');
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Authorization: Bearer ' . $data['token'],
    ]);
    $resp2 = curl_exec($ch2);
    curl_close($ch2);
    $data2 = json_decode($resp2, true);
    echo "USERS & GEO METRICS:" . PHP_EOL;
    print_r($data2['metrics'] ?? []);
    echo "TOP COUNTRIES:" . PHP_EOL;
    foreach (($data2['country_stats'] ?? []) as $cs) {
        echo "- " . $cs['country'] . " (" . $cs['country_code'] . "): " . $cs['count'] . " logins" . PHP_EOL;
    }
}

// Test non-admin rejection
$ch3 = curl_init('http://127.0.0.1:8000/api/admin/login');
curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch3, CURLOPT_POST, true);
curl_setopt($ch3, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
curl_setopt($ch3, CURLOPT_POSTFIELDS, json_encode(['email' => 'priya@example.com', 'password' => 'password123']));
$resp3 = curl_exec($ch3);
$code3 = curl_getinfo($ch3, CURLINFO_HTTP_CODE);
curl_close($ch3);
echo "NON-ADMIN TEST HTTP CODE: " . $code3 . PHP_EOL;
echo "NON-ADMIN RESPONSE: " . $resp3 . PHP_EOL;

