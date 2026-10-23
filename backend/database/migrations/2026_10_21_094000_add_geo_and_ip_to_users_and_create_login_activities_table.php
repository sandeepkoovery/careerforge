<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('last_login_ip', 45)->nullable()->after('trial_ends_at');
            $table->string('last_login_city', 100)->nullable()->after('last_login_ip');
            $table->string('last_login_region', 100)->nullable()->after('last_login_city');
            $table->string('last_login_country', 100)->nullable()->after('last_login_region');
            $table->string('last_login_country_code', 10)->nullable()->after('last_login_country');
            $table->timestamp('last_login_at')->nullable()->after('last_login_country_code');
            $table->string('last_device', 120)->nullable()->after('last_login_at');
        });

        Schema::create('login_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_email', 150)->nullable();
            $table->string('ip_address', 45);
            $table->string('city', 100)->nullable();
            $table->string('region', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('country_code', 10)->nullable();
            $table->string('isp', 150)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('device', 120)->nullable();
            $table->string('status', 30)->default('success');
            $table->boolean('is_admin_login')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_activities');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'last_login_ip',
                'last_login_city',
                'last_login_region',
                'last_login_country',
                'last_login_country_code',
                'last_login_at',
                'last_device',
            ]);
        });
    }
};
