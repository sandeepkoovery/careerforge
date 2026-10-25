<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\ToolsController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => ['app' => 'Smartcvmaker API', 'ok' => true]);

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('admin-login', [AuthController::class, 'adminLogin'])->middleware('throttle:10,1');
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// Direct admin login route for /api/admin/login
Route::post('admin/login', [AuthController::class, 'adminLogin'])->middleware('throttle:10,1');

// Public pricing info
Route::get('pricing', [PaymentController::class, 'getPricing']);

// AI tools: open to everyone (rate limited). History is saved when a token is present.
Route::prefix('ai')->middleware('throttle:40,1')->group(function () {
    Route::get('status', [ToolsController::class, 'status']);
    Route::post('ats', [ToolsController::class, 'ats']);
    Route::post('job-match', [ToolsController::class, 'jobMatch']);
    Route::post('cover-letter', [ToolsController::class, 'coverLetter']);
    Route::post('linkedin', [ToolsController::class, 'linkedin']);
    Route::post('suggest', [ToolsController::class, 'suggest']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::put('user/profile', [AuthController::class, 'updateProfile']);
    Route::post('user/upgrade', [AuthController::class, 'upgrade']);

    // Razorpay Payments
    Route::post('payment/razorpay/create-order', [PaymentController::class, 'createOrder']);
    Route::post('payment/razorpay/verify', [PaymentController::class, 'verify']);

    // Admin Panel Endpoints
    Route::prefix('admin')->group(function () {
        Route::get('users', [AdminController::class, 'index']);
        Route::post('users/{id}/upgrade', [AdminController::class, 'upgrade']);
        Route::post('users/{id}/downgrade', [AdminController::class, 'downgrade']);
        Route::post('users/{id}/extend-trial', [AdminController::class, 'extendTrial']);
        Route::post('users/{id}/toggle-admin', [AdminController::class, 'toggleAdmin']);
        Route::delete('users/{id}', [AdminController::class, 'destroy']);
        Route::post('ip-lookup', [AdminController::class, 'lookupIp']);
        Route::post('settings', [AdminController::class, 'updateSettings']);
    });

    Route::post('resumes/import', [ResumeController::class, 'import']);
    Route::post('resumes/{id}/duplicate', [ResumeController::class, 'duplicate']);
    Route::get('resumes', [ResumeController::class, 'index']);
    Route::post('resumes', [ResumeController::class, 'store']);
    Route::get('resumes/{id}', [ResumeController::class, 'show']);
    Route::put('resumes/{id}', [ResumeController::class, 'update']);
    Route::delete('resumes/{id}', [ResumeController::class, 'destroy']);

    Route::get('history', [ToolsController::class, 'history']);
    Route::delete('history/{id}', [ToolsController::class, 'deleteHistory']);
});