<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@codecpos.com',
            'password' => bcrypt('password'),
            'pin' => bcrypt('123456'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');

        $kasir = User::create([
            'name' => 'Kasir',
            'email' => 'kasir@codecpos.com',
            'password' => bcrypt('password'),
            'pin' => bcrypt('123456'),
            'email_verified_at' => now(),
        ]);
        $kasir->assignRole('kasir');

        $owner = User::create([
            'name' => 'Owner',
            'email' => 'owner@codecpos.com',
            'password' => bcrypt('password'),
            'pin' => bcrypt('123456'),
            'email_verified_at' => now(),
        ]);
        $owner->assignRole('owner');
    }
}
