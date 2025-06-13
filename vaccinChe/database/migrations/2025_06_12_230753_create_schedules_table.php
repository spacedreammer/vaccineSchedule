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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('health_officer_id')->constrained('users')->onDelete('cascade'); // Creator/Manager
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('date');
            $table->time('time');
            $table->string('location');
            $table->integer('capacity')->default(1); // Max appointments for this slot
            $table->integer('booked_slots')->default(0); // Track current bookings
            $table->foreignId('vaccine_category_id')->nullable()->constrained('vaccine_categories')->onDelete('set null'); // Link to vaccine type
            $table->enum('status', ['active', 'full', 'cancelled'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
