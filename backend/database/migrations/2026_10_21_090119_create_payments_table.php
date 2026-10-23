<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('razorpay_payment_id')->nullable()->index();
            $table->string('razorpay_order_id')->nullable()->index();
            $table->string('razorpay_signature')->nullable();
            $table->decimal('amount', 10, 2)->default(799.00);
            $table->string('currency', 10)->default('INR');
            $table->string('plan', 50)->default('pro_monthly');
            $table->string('status', 30)->default('captured');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};