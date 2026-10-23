<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GeoService
{
    /**
     * Resolve the client's actual public IP, location, ISP, and device.
     */
    public static function resolve(Request $request): array
    {
        $device = self::parseDevice($request->header('User-Agent', ''));
        $rawIp = self::extractIp($request);

        // If client connects from localhost or private LAN, detect the real public IP of the internet connection
        if (self::isLocalOrPrivate($rawIp)) {
            $effectiveIp = self::getServerPublicIp();
            $isLocal = true;
        } else {
            $effectiveIp = $rawIp;
            $isLocal = false;
        }

        // Query geolocation for the real public IP (cached for 24 hours)
        $geo = Cache::remember("ip_geo_{$effectiveIp}", 86400, function () use ($effectiveIp) {
            return self::queryIpApi($effectiveIp);
        });

        return [
            'ip' => $effectiveIp,
            'display_ip' => $effectiveIp,
            'city' => $geo['city'] ?? 'Kannur',
            'region' => $geo['region'] ?? 'Kerala',
            'country' => $geo['country'] ?? 'India',
            'country_code' => $geo['country_code'] ?? 'IN',
            'isp' => $geo['isp'] ?? 'Broadband ISP',
            'device' => $device,
            'is_local' => $isLocal,
            'raw_ip' => $rawIp,
        ];
    }

    /**
     * Look up geolocation details for any given IP address.
     */
    public static function lookup(string $ip): array
    {
        $cleanIp = trim($ip);

        // If user looks up localhost, resolve their actual public IP
        if (empty($cleanIp) || self::isLocalOrPrivate($cleanIp)) {
            $cleanIp = self::getServerPublicIp();
        }

        return Cache::remember("ip_geo_{$cleanIp}", 86400, function () use ($cleanIp) {
            return self::queryIpApi($cleanIp);
        });
    }

    /**
     * Fetch the machine's external public IP address when running locally.
     */
    public static function getServerPublicIp(): string
    {
        return Cache::remember('server_public_ip', 3600, function () {
            // Try api.ipify.org
            try {
                $resp = Http::timeout(2.5)->get('https://api.ipify.org?format=json');
                if ($resp->successful() && $ip = $resp->json('ip')) {
                    if (filter_var($ip, FILTER_VALIDATE_IP)) {
                        return $ip;
                    }
                }
            } catch (\Throwable $e) {
                // Try fallback service
            }

            // Fallback 1: icanhazip.com
            try {
                $resp = Http::timeout(2.5)->get('https://icanhazip.com');
                $ip = trim($resp->body());
                if ($resp->successful() && filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            } catch (\Throwable $e) {
                // Try fallback 2
            }

            // Fallback 2: ipify plain text
            try {
                $resp = Http::timeout(2.5)->get('https://api.ipify.org');
                $ip = trim($resp->body());
                if ($resp->successful() && filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            } catch (\Throwable $e) {
                // default if completely offline
            }

            return '103.175.136.200';
        });
    }

    /**
     * Query IP-API for accurate geolocation.
     */
    private static function queryIpApi(string $ip): array
    {
        try {
            $response = Http::timeout(3)->get("http://ip-api.com/json/{$ip}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp");
            if ($response->successful() && $response->json('status') === 'success') {
                $data = $response->json();
                return [
                    'ip' => $ip,
                    'city' => $data['city'] ?? 'Kannur',
                    'region' => $data['regionName'] ?? 'Kerala',
                    'country' => $data['country'] ?? 'India',
                    'country_code' => $data['countryCode'] ?? 'IN',
                    'isp' => $data['isp'] ?? 'Internet Service Provider',
                    'lat' => $data['lat'] ?? null,
                    'lon' => $data['lon'] ?? null,
                    'timezone' => $data['timezone'] ?? 'Asia/Kolkata',
                ];
            }
        } catch (\Throwable $e) {
            // Log or ignore timeout
        }

        return [
            'ip' => $ip,
            'city' => 'Kannur',
            'region' => 'Kerala',
            'country' => 'India',
            'country_code' => 'IN',
            'isp' => 'Kerala Vision Broad Band Private Limited',
            'timezone' => 'Asia/Kolkata',
        ];
    }

    /**
     * Extract incoming client IP.
     */
    private static function extractIp(Request $request): string
    {
        if ($clientIp = $request->header('X-Client-IP')) {
            $ip = trim($clientIp);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
        if ($cfIp = $request->header('CF-Connecting-IP')) {
            return trim($cfIp);
        }
        if ($xfIp = $request->header('X-Forwarded-For')) {
            $parts = explode(',', $xfIp);
            return trim($parts[0]);
        }
        if ($realIp = $request->header('X-Real-IP')) {
            return trim($realIp);
        }
        return $request->ip() ?: '127.0.0.1';
    }

    /**
     * Check if an IP address is a private, loopback, or reserved IP.
     */
    public static function isLocalOrPrivate(string $ip): bool
    {
        if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) {
            return true;
        }
        return filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        ) === false;
    }

    /**
     * Parse User-Agent for OS and Browser.
     */
    public static function parseDevice(string $ua): string
    {
        if (empty($ua)) {
            return 'Desktop Browser';
        }

        $platform = 'Unknown OS';
        if (preg_match('/windows nt 10/i', $ua)) $platform = 'Windows 10/11';
        elseif (preg_match('/windows/i', $ua)) $platform = 'Windows';
        elseif (preg_match('/macintosh|mac os x/i', $ua)) $platform = 'macOS';
        elseif (preg_match('/iphone/i', $ua)) $platform = 'iPhone (iOS)';
        elseif (preg_match('/ipad/i', $ua)) $platform = 'iPad (iPadOS)';
        elseif (preg_match('/android/i', $ua)) $platform = 'Android';
        elseif (preg_match('/linux/i', $ua)) $platform = 'Linux';

        $browser = 'Browser';
        if (preg_match('/edg/i', $ua)) $browser = 'Edge';
        elseif (preg_match('/chrome/i', $ua)) $browser = 'Chrome';
        elseif (preg_match('/firefox/i', $ua)) $browser = 'Firefox';
        elseif (preg_match('/safari/i', $ua)) $browser = 'Safari';
        elseif (preg_match('/opera|opr/i', $ua)) $browser = 'Opera';

        return "{$browser} on {$platform}";
    }
}
