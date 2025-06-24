<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
 // 🚫 Temporarily disable foreign key checks
 DB::statement('SET FOREIGN_KEY_CHECKS=0;');

 // 🔁 Truncate dependent tables first
 DB::table('schedules')->truncate();
 DB::table('vaccine_categories')->truncate();

        User::create([
            'fname' => 'System',
            'lname' => 'Admin',
            'email' => 'admin@example.com',
            'phone' => '0712345678',
            'password' => Hash::make('password'), // Use a strong password in real app!
            'role' => 'admin',
        ]);

        User::create([
            'fname' => 'Health',
            'lname' => 'Officer',
            'email' => 'hofficer@example.com',
            'phone' => '0712345679',
            'password' => Hash::make('password'),
            'role' => 'health_officer',
        ]);

        User::create([
            'fname' => 'Service',
            'lname' => 'Provider',
            'email' => 'provider@example.com',
            'phone' => '0712345680',
            'password' => Hash::make('password'),
            'role' => 'service_provider',
        ]);

        User::create([
            'fname' => 'Patient',
            'lname' => 'User',
            'email' => 'patient@example.com',
            'phone' => '0712345681',
            'password' => Hash::make('password'),
            'role' => 'patient',
        ]);

        // You can also use factories for more realistic data
        // User::factory(10)->create();
    }
}