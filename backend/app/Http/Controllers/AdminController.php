<?php

namespace App\Http\Controllers;

use App\Models\LoginActivity;
use App\Models\Payment;
use App\Models\Resume;
use App\Models\Setting;
use App\Models\User;
use App\Services\GeoService;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private function checkAdmin(Request $request)
    {
        if (! $request->user() || ! $request->user()->is_admin) {
            abort(403, 'Unauthorized. Admin privileges required.');
        }
    }

    public function index(Request $request)
    {
        $this->checkAdmin($request);

        $users = User::withCount('resumes')
            ->latest('id')
            ->get();

        $totalUsers = $users->count();
        $proUsers = $users->where('is_pro', true)->count();
        $trialUsers = $users->filter(fn ($u) => $u->is_trial)->count();
        $expiredUsers = $users->filter(fn ($u) => $u->is_trial_expired)->count();
        $totalResumes = Resume::count();
        $totalRevenue = Payment::where('status', 'captured')->sum('amount');

        $recentPayments = Payment::with('user:id,name,email')
            ->latest('id')
            ->take(20)
            ->get();

        $recentActivities = LoginActivity::with('user:id,name,email')
            ->latest('id')
            ->take(50)
            ->get();

        $countryStats = LoginActivity::selectRaw('country, country_code, count(*) as count')
            ->whereNotNull('country')
            ->groupBy('country', 'country_code')
            ->orderByDesc('count')
            ->take(10)
            ->get();

        $clientGeo = GeoService::resolve($request);

        return response()->json([
            'client_ip' => $clientGeo['display_ip'],
            'client_geo' => $clientGeo,
            'users' => $users,
            'metrics' => [
                'total_users' => $totalUsers,
                'pro_users' => $proUsers,
                'trial_users' => $trialUsers,
                'expired_users' => $expiredUsers,
                'total_resumes' => $totalResumes,
                'total_revenue' => (float) $totalRevenue,
                'total_logins' => LoginActivity::count(),
            ],
            'settings' => [
                'pro_monthly_price' => (float) Setting::get('pro_monthly_price', 799.00),
                'pro_annual_price' => (float) Setting::get('pro_annual_price', 5999.00),
                'trial_days' => (int) Setting::get('trial_days', 30),
                'currency' => Setting::get('currency', 'INR'),
            ],
            'recent_payments' => $recentPayments,
            'recent_activities' => $recentActivities,
            'country_stats' => $countryStats,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $this->checkAdmin($request);
        $request->validate([
            'pro_monthly_price' => 'required|numeric|min:1',
            'pro_annual_price' => 'nullable|numeric|min:1',
            'trial_days' => 'nullable|integer|min:1|max:365',
        ]);

        $monthly = (float) $request->input('pro_monthly_price');
        Setting::set('pro_monthly_price', $monthly);

        if ($request->has('pro_annual_price')) {
            Setting::set('pro_annual_price', (float) $request->input('pro_annual_price'));
        }

        if ($request->has('trial_days')) {
            Setting::set('trial_days', (int) $request->input('trial_days'));
        }

        return response()->json([
            'message' => "Razorpay Pro Pricing successfully updated to ₹{$monthly}/month!",
            'settings' => [
                'pro_monthly_price' => (float) Setting::get('pro_monthly_price', 799.00),
                'pro_annual_price' => (float) Setting::get('pro_annual_price', 5999.00),
                'trial_days' => (int) Setting::get('trial_days', 30),
                'currency' => Setting::get('currency', 'INR'),
            ],
        ]);
    }

    public function lookupIp(Request $request)
    {
        $this->checkAdmin($request);
        $request->validate(['ip' => 'nullable|string']);

        $ip = $request->input('ip') ?: $request->ip();
        $geo = GeoService::lookup($ip);
        return response()->json(['geo' => $geo]);
    }

    public function upgrade(Request $request, int $id)
    {
        $this->checkAdmin($request);

        $user = User::findOrFail($id);
        $user->is_pro = true;
        $user->save();

        return response()->json([
            'message' => "Successfully upgraded {$user->name} to Pro!",
            'user' => $user->fresh()->loadCount('resumes'),
        ]);
    }

    public function downgrade(Request $request, int $id)
    {
        $this->checkAdmin($request);

        $user = User::findOrFail($id);
        $user->is_pro = false;
        $user->save();

        return response()->json([
            'message' => "Successfully downgraded {$user->name} to Free plan.",
            'user' => $user->fresh()->loadCount('resumes'),
        ]);
    }

    public function extendTrial(Request $request, int $id)
    {
        $this->checkAdmin($request);

        $user = User::findOrFail($id);
        $base = ($user->trial_ends_at && $user->trial_ends_at->isFuture()) ? $user->trial_ends_at : now();
        $user->trial_ends_at = $base->addDays(30);
        $user->is_pro = false;
        $user->save();

        return response()->json([
            'message' => "Extended 30-day trial for {$user->name} until {$user->trial_ends_at->format('M d, Y')}.",
            'user' => $user->fresh()->loadCount('resumes'),
        ]);
    }

    public function toggleAdmin(Request $request, int $id)
    {
        $this->checkAdmin($request);

        $user = User::findOrFail($id);
        if ($user->id === $request->user()->id && $user->is_admin) {
            return response()->json(['message' => 'You cannot revoke your own admin access.'], 422);
        }

        $user->is_admin = ! $user->is_admin;
        $user->save();

        $action = $user->is_admin ? 'granted admin access' : 'revoked admin access';
        return response()->json([
            'message' => "Successfully {$action} for {$user->name}.",
            'user' => $user->fresh()->loadCount('resumes'),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $this->checkAdmin($request);

        $user = User::findOrFail($id);
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own admin account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => "User {$user->name} deleted."]);
    }
}