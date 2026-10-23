<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_email',
        'ip_address',
        'city',
        'region',
        'country',
        'country_code',
        'isp',
        'user_agent',
        'device',
        'status',
        'is_admin_login',
    ];

    protected $casts = [
        'is_admin_login' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
