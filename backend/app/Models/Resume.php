<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resume extends Model
{
    protected $fillable = ['user_id', 'title', 'template', 'accent', 'font', 'data', 'ats_score'];

    protected function casts(): array
    {
        return ['data' => 'array'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
