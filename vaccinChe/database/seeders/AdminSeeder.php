<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'fname' => 'admin',
            'fname' => 'System', 
            'lname' => 'Admin',
            'email' => 'admin@space.com',
            'password' => bcrypt('qwertyui'), 
            'role' => 'systemAdmin', 
            'phone' => '0752182334',
        ]);
    }
}
