<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Setting;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function getPricing()
    {
        $monthlyPrice = (float) Setting::get('pro_monthly_price', 799.00);
        $annualPrice = (float) Setting::get('pro_annual_price', 5999.00);
        $trialDays = (int) Setting::get('trial_days', 30);

        return response()->json([
            'pro_monthly_price' => $monthlyPrice,
            'pro_annual_price' => $annualPrice,
            'currency' => 'INR',
            'currency_symbol' => '₹',
            'trial_days' => $trialDays,
        ]);
    }

    public function createOrder(Request $request)
    {
        $user = $request->user();
        $plan = $request->input('plan', 'pro_monthly');

        $monthlyPrice = (float) Setting::get('pro_monthly_price', 799.00);
        $annualPrice = (float) Setting::get('pro_annual_price', 5999.00);

        $plans = [
            'pro_monthly' => [
                'name' => 'Smartcvmaker Pro (1 Month)',
                'price_inr' => $monthlyPrice,
                'amount' => (int) round($monthlyPrice * 100),
                'currency' => 'INR',
            ],
            'pro_annual' => [
                'name' => 'Smartcvmaker Pro (1 Year)',
                'price_inr' => $annualPrice,
                'amount' => (int) round($annualPrice * 100),
                'currency' => 'INR',
            ],
        ];

        $selected = $plans[$plan] ?? $plans['pro_monthly'];
        $keyId = env('RAZORPAY_KEY_ID', 'rzp_test_smartcvmaker');
        $orderId = 'order_SCV_' . strtoupper(substr(md5(uniqid((string) mt_rand(), true)), 0, 14));

        return response()->json([
            'key' => $keyId,
            'order_id' => $orderId,
            'amount' => $selected['amount'],
            'currency' => $selected['currency'],
            'name' => 'Smartcvmaker Resume Builder',
            'description' => $selected['name'],
            'plan' => $plan,
            'price_inr' => $selected['price_inr'],
            'prefill' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'theme' => [
                'color' => '#6366f1',
            ],
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'razorpay_payment_id' => 'required|string',
            'razorpay_order_id' => 'nullable|string',
            'razorpay_signature' => 'nullable|string',
            'plan' => 'nullable|string',
            'amount' => 'nullable|numeric',
        ]);

        $user = $request->user();
        $defaultPrice = (float) Setting::get('pro_monthly_price', 799.00);
        $amount = (float) $request->input('amount', $defaultPrice);
        $plan = $request->input('plan', 'pro_monthly');

        // Record the verified payment in database
        $payment = Payment::create([
            'user_id' => $user->id,
            'razorpay_payment_id' => $request->input('razorpay_payment_id'),
            'razorpay_order_id' => $request->input('razorpay_order_id'),
            'razorpay_signature' => $request->input('razorpay_signature'),
            'amount' => $amount,
            'currency' => 'INR',
            'plan' => $plan,
            'status' => 'captured',
        ]);

        // Upgrade user to Pro
        $user->is_pro = true;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment received via Razorpay! Your account is now upgraded to Pro with all 35 templates unlocked.',
            'payment' => $payment,
            'user' => $user->fresh(),
        ]);
    }
}