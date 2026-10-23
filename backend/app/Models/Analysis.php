<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Analysis extends Model
{
    protected $table = 'analyses';

    protected $fillable = ['user_id', 'type', 'title', 'score', 'payload'];

    protected function casts(): array
    {
        return ['payload' => 'array'];
    }
}
