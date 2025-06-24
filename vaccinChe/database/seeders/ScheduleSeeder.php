<?php

namespace Database\Seeders;

use App\Models\Schedule;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;     // Import the User model to find a health officer
use App\Models\Vaccine_categories;
use App\Models\VaccineCategory; // Import VaccineCategory to find categories
use Carbon\Carbon;       // For date/time manipulation

class ScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data to prevent duplicates on re-seed
        Schedule::truncate();

        // Find a health officer to assign as the creator of these schedules
        // IMPORTANT: Ensure you have a user with 'health_officer' role created by UserSeeder
        $healthOfficer = User::where('role', 'health_officer')->first();

        // Find some vaccine categories
        $mmrCategory = Vaccine_categories::where('name', 'MMR')->first();
        $dtpCategory = Vaccine_categories::where('name', 'DTP')->first();
        $polioCategory = Vaccine_categories::where('name', 'Polio')->first();

        if (!$healthOfficer) {
            $this->command->error('Health Officer not found. Please run UserSeeder first!');
            return;
        }
        if (!$mmrCategory || !$dtpCategory || !$polioCategory) {
            $this->command->error('Vaccine Categories not found. Please run VaccineCategorySeeder first!');
            return;
        }

        $schedules = [
            [
                'health_officer_id' => $healthOfficer->id,
                'title' => 'Morning Vaccination Session',
                'description' => 'General vaccination session for all ages.',
                'date' => Carbon::today()->addDays(7), // 1 week from now
                'time' => '09:00:00',
                'location' => 'Community Health Center A',
                'capacity' => 20,
                'booked_slots' => 0,
                'vaccine_category_id' => $mmrCategory->id, // Example: focused on MMR
                'status' => 'active',
            ],
            [
                'health_officer_id' => $healthOfficer->id,
                'title' => 'Afternoon Pediatric Session',
                'description' => 'Dedicated session for child vaccinations.',
                'date' => Carbon::today()->addDays(8), // 8 days from now
                'time' => '14:00:00',
                'location' => 'Childrens Clinic B',
                'capacity' => 15,
                'booked_slots' => 0,
                'vaccine_category_id' => $dtpCategory->id, // Example: focused on DTP
                'status' => 'active',
            ],
            [
                'health_officer_id' => $healthOfficer->id,
                'title' => 'Polio Drive Day 1',
                'description' => 'Special polio vaccination drive.',
                'date' => Carbon::today()->addDays(10), // 10 days from now
                'time' => '10:30:00',
                'location' => 'Local School Hall',
                'capacity' => 30,
                'booked_slots' => 0,
                'vaccine_category_id' => $polioCategory->id,
                'status' => 'active',
            ],
            // Add a full schedule for testing
            [
                'health_officer_id' => $healthOfficer->id,
                'title' => 'Full Test Session',
                'description' => 'A session that is already fully booked for testing purposes.',
                'date' => Carbon::today()->addDays(5), // 5 days from now
                'time' => '10:00:00',
                'location' => 'Test Clinic',
                'capacity' => 5,
                'booked_slots' => 5, // Fully booked
                'vaccine_category_id' => $mmrCategory->id,
                'status' => 'full', // Mark as full
            ],
        ];

        foreach ($schedules as $schedule) {
            Schedule::create($schedule);
        }

        $this->command->info('Schedules seeded!');
    }
}