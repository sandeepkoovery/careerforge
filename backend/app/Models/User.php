<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_pro',
        'is_admin',
        'trial_ends_at',
        'last_login_ip',
        'last_login_city',
        'last_login_region',
        'last_login_country',
        'last_login_country_code',
        'last_login_at',
        'last_device',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'plan_type',
        'is_trial',
        'is_trial_expired',
        'trial_days_left',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_pro' => 'boolean',
            'is_admin' => 'boolean',
            'trial_ends_at' => 'datetime',
            'last_login_at' => 'datetime',
        ];
    }

    public function getPlanTypeAttribute(): string
    {
        if ($this->is_admin) {
            return 'admin';
        }
        if ($this->is_pro) {
            return 'pro';
        }
        if ($this->trial_ends_at && $this->trial_ends_at->isFuture()) {
            return 'trial';
        }
        if ($this->trial_ends_at && $this->trial_ends_at->isPast()) {
            return 'expired';
        }
        return 'free';
    }

    public function getIsTrialAttribute(): bool
    {
        return ! $this->is_pro && $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function getIsTrialExpiredAttribute(): bool
    {
        return ! $this->is_pro && $this->trial_ends_at && $this->trial_ends_at->isPast();
    }

    public function getTrialDaysLeftAttribute(): int
    {
        if (! $this->trial_ends_at || $this->trial_ends_at->isPast()) {
            return 0;
        }
        return max(0, (int) ceil(now()->floatDiffInDays($this->trial_ends_at)));
    }

    public function resumes()
    {
        return $this->hasMany(Resume::class);
    }

    public function analyses()
    {
        return $this->hasMany(Analysis::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function loginActivities()
    {
        return $this->hasMany(LoginActivity::class);
    }

    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class);
    }
}