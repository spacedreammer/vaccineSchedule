<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('health_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('uploaded_by_user_id')->constrained('users')->onDelete('cascade'); // Admin/Health Officer
            $table->string('title');
            $table->text('content'); // Main body of the article/description
            $table->enum('type', ['article', 'video', 'infographic'])->default('article');
            $table->string('image_url')->nullable(); // For infographics or article thumbnails
            $table->string('video_url')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('health_contents');
    }
};
