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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // The patient/user

            // ADDED: Foreign key for schedule_id to link to schedules table
            $table->foreignId('schedule_id')->nullable()->constrained('schedules')->onDelete('set null'); // IMPORTANT: ADDED THIS LINE

            $table->foreignId('provider_id')->nullable()->constrained('users')->onDelete('set null'); // Assigned service provider (if any)

            $table->string('child_name')->nullable(); // Made nullable to match controller validation if needed
            $table->string('vaccine_type')->nullable(); // Made nullable to match controller validation if needed

            // Using preferred_date/preferred_time as per frontend and controller logic
            $table->date('preferred_date');
            $table->time('preferred_time');

            // REMOVED: Redundant appointment_date and appointment_time as preferred_date/time are used.
            // $table->date('appointment_date');
            // $table->time('appointment_time');

            $table->text('notes')->nullable();

            // Corrected status enum values to lowercase for consistency
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])->default('pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
