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
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User who submitted feedback
            $table->foreignId('appointment_id')->constrained('appointments')->onDelete('cascade'); // Specific appointment feedback is for
            $table->foreignId('provider_id')->nullable()->constrained('users')->onDelete('set null'); // Provider who conducted the service
            $table->tinyInteger('rating')->unsigned(); // 1-5 rating
            $table->text('comment')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};
