<?php

namespace App\Http\Controllers;

use App\Models\LoginActivity;
use App\Models\User;
use App\Services\GeoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:users,email',
            'password' => 'required|string|min:8|max:100',
        ]);

        $geo = GeoService::resolve($request);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'trial_ends_at' => now()->addDays(30),
            'is_pro' => false,
            'is_admin' => User::count() === 0, // Make the very first registered user an Admin automatically
            'last_login_ip' => $geo['display_ip'],
            'last_login_city' => $geo['city'],
            'last_login_region' => $geo['region'],
            'last_login_country' => $geo['country'],
            'last_login_country_code' => $geo['country_code'],
            'last_login_at' => now(),
            'last_device' => $geo['device'],
        ]);

        LoginActivity::create([
            'user_id' => $user->id,
            'user_email' => $user->email,
            'ip_address' => $geo['display_ip'],
            'city' => $geo['city'],
            'region' => $geo['region'],
            'country' => $geo['country'],
            'country_code' => $geo['country_code'],
            'isp' => $geo['isp'],
            'user_agent' => $request->header('User-Agent'),
            'device' => $geo['device'],
            'status' => 'success',
            'is_admin_login' => (bool) $user->is_admin,
        ]);

        return response()->json([
            'user' => $user->fresh(),
            'token' => $user->createToken('spa')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            // Track failed login attempt if user exists or IP
            $geo = GeoService::resolve($request);
            LoginActivity::create([
                'user_id' => $user?->id,
                'user_email' => $data['email'],
                'ip_address' => $geo['display_ip'],
                'city' => $geo['city'],
                'region' => $geo['region'],
                'country' => $geo['country'],
                'country_code' => $geo['country_code'],
                'isp' => $geo['isp'],
                'user_agent' => $request->header('User-Agent'),
                'device' => $geo['device'],
                'status' => 'failed_credentials',
                'is_admin_login' => false,
            ]);

            throw ValidationException::withMessages(['email' => 'These credentials do not match our records.']);
        }

        // Track successful login
        $geo = GeoService::resolve($request);
        $user->update([
            'last_login_ip' => $geo['display_ip'],
            'last_login_city' => $geo['city'],
            'last_login_region' => $geo['region'],
            'last_login_country' => $geo['country'],
            'last_login_country_code' => $geo['country_code'],
            'last_login_at' => now(),
            'last_device' => $geo['device'],
        ]);

        LoginActivity::create([
            'user_id' => $user->id,
            'user_email' => $user->email,
            'ip_address' => $geo['display_ip'],
            'city' => $geo['city'],
            'region' => $geo['region'],
            'country' => $geo['country'],
            'country_code' => $geo['country_code'],
            'isp' => $geo['isp'],
            'user_agent' => $request->header('User-Agent'),
            'device' => $geo['device'],
            'status' => 'success',
            'is_admin_login' => (bool) $user->is_admin,
        ]);

        return response()->json([
            'user' => $user->fresh(),
            'token' => $user->createToken('spa')->plainTextToken,
        ]);
    }

    public function adminLogin(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();
        $geo = GeoService::resolve($request);

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            LoginActivity::create([
                'user_id' => $user?->id,
                'user_email' => $data['email'],
                'ip_address' => $geo['display_ip'],
                'city' => $geo['city'],
                'region' => $geo['region'],
                'country' => $geo['country'],
                'country_code' => $geo['country_code'],
                'isp' => $geo['isp'],
                'user_agent' => $request->header('User-Agent'),
                'device' => $geo['device'],
                'status' => 'admin_failed_credentials',
                'is_admin_login' => true,
            ]);

            throw ValidationException::withMessages(['email' => 'Invalid administrator email or password.']);
        }

        if (! $user->is_admin) {
            LoginActivity::create([
                'user_id' => $user->id,
                'user_email' => $user->email,
                'ip_address' => $geo['display_ip'],
                'city' => $geo['city'],
                'region' => $geo['region'],
                'country' => $geo['country'],
                'country_code' => $geo['country_code'],
                'isp' => $geo['isp'],
                'user_agent' => $request->header('User-Agent'),
                'device' => $geo['device'],
                'status' => 'admin_unauthorized_attempt',
                'is_admin_login' => true,
            ]);

            return response()->json([
                'message' => 'Access Denied: This account does not possess administrator privileges.',
            ], 403);
        }

        // Update Geo and Login
        $user->update([
            'last_login_ip' => $geo['display_ip'],
            'last_login_city' => $geo['city'],
            'last_login_region' => $geo['region'],
            'last_login_country' => $geo['country'],
            'last_login_country_code' => $geo['country_code'],
            'last_login_at' => now(),
            'last_device' => $geo['device'],
        ]);

        LoginActivity::create([
            'user_id' => $user->id,
            'user_email' => $user->email,
            'ip_address' => $geo['display_ip'],
            'city' => $geo['city'],
            'region' => $geo['region'],
            'country' => $geo['country'],
            'country_code' => $geo['country_code'],
            'isp' => $geo['isp'],
            'user_agent' => $request->header('User-Agent'),
            'device' => $geo['device'],
            'status' => 'success',
            'is_admin_login' => true,
        ]);

        return response()->json([
            'message' => 'Admin authentication successful.',
            'user' => $user->fresh(),
            'token' => $user->createToken('admin-spa')->plainTextToken,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()->fresh()]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function upgrade(Request $request)
    {
        $user = $request->user();
        $isPro = $request->has('is_pro') ? (bool) $request->input('is_pro') : true;
        $user->is_pro = $isPro;
        $user->save();

        return response()->json([
            'message' => $isPro ? 'Account successfully upgraded to Pro! All 35 templates unlocked.' : 'Account plan reset to Free.',
            'user' => $user->fresh(),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:users,email,' . $user->id,
            'current_password' => 'nullable|string',
            'new_password' => 'nullable|string|min:8|max:100',
        ]);

        $user->name = trim($data['name']);
        $user->email = trim($data['email']);

        // Check if updating password
        if (!empty($data['new_password'])) {
            if (empty($data['current_password'])) {
                throw ValidationException::withMessages([
                    'current_password' => 'Please enter your current password to confirm the change.',
                ]);
            }

            if (!Hash::check($data['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => 'Current password is incorrect.',
                ]);
            }

            $user->password = Hash::make($data['new_password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user' => $user->fresh(),
        ]);
    }
}