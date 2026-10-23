<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Insert default initial settings
        DB::table('settings')->insert([
            ['key' => 'pro_monthly_price', 'value' => '799', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'pro_annual_price', 'value' => '5999', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'trial_days', 'value' => '30', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'currency', 'value' => 'INR', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
