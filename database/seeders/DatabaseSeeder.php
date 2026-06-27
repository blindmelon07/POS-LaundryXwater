<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@pos.com'], [
            'name' => 'Admin',
            'email' => 'admin@pos.com',
            'password' => Hash::make('admin1234'),
            'email_verified_at' => now(),
        ]);

        User::firstOrCreate(['email' => 'cashier@pos.com'], [
            'name' => 'Cashier',
            'email' => 'cashier@pos.com',
            'password' => Hash::make('cashier1234'),
            'email_verified_at' => now(),
        ]);

        $this->call([
            ProductSeeder::class,
            RolePermissionSeeder::class,
        ]);
    }
}
