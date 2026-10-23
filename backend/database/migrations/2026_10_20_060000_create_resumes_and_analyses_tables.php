<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resumes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->default('Untitled Resume');
            $table->string('template', 40)->default('modern');
            $table->string('accent', 20)->default('#7c3aed');
            $table->string('font', 40)->default('inter');
            $table->longText('data');
            $table->unsignedTinyInteger('ats_score')->nullable();
            $table->timestamps();
        });

        Schema::create('analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 30)->index();
            $table->string('title')->nullable();
            $table->unsignedTinyInteger('score')->nullable();
            $table->longText('payload');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analyses');
        Schema::dropIfExists('resumes');
    }
};
