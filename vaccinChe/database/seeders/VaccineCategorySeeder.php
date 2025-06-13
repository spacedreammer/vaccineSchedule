<?php

namespace Database\Seeders;

use App\Models\Vaccine_categories;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\VaccineCategory; // Import the VaccineCategory model

class VaccineCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data to prevent duplicates on re-seed
        Vaccine_categories::truncate();

        $categories = [
            ['name' => 'MMR', 'description' => 'Measles, Mumps, and Rubella vaccine.', 'is_active' => true],
            ['name' => 'DTP', 'description' => 'Diphtheria, Tetanus, and Pertussis (whooping cough) vaccine.', 'is_active' => true],
            ['name' => 'Polio', 'description' => 'Poliovirus vaccine (Oral Polio Vaccine or Inactivated Polio Vaccine).', 'is_active' => true],
            ['name' => 'Hepatitis B', 'description' => 'Vaccine for Hepatitis B virus.', 'is_active' => true],
            ['name' => 'Flu Vaccine', 'description' => 'Annual influenza vaccine.', 'is_active' => true],
            ['name' => 'HPV', 'description' => 'Human Papillomavirus vaccine.', 'is_active' => true],
        ];

        foreach ($categories as $category) {
            Vaccine_categories::create($category);
        }

        $this->command->info('Vaccine categories seeded!');
    }
}