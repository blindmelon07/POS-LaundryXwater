<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // ── User Accounts ─────────────────────────────────────────────────────
        User::firstOrCreate(['email' => 'admin@pos.com'], [
            'name'               => 'Admin',
            'password'           => Hash::make('admin1234'),
            'email_verified_at'  => now(),
        ]);

        User::firstOrCreate(['email' => 'cashier@pos.com'], [
            'name'               => 'Cashier',
            'password'           => Hash::make('cashier1234'),
            'email_verified_at'  => now(),
        ]);

        User::firstOrCreate(['email' => 'rider@pos.com'], [
            'name'               => 'Rider',
            'password'           => Hash::make('rider1234'),
            'email_verified_at'  => now(),
        ]);

        User::firstOrCreate(['email' => 'loader@pos.com'], [
            'name'               => 'Loader',
            'password'           => Hash::make('loader1234'),
            'email_verified_at'  => now(),
        ]);

        // ── Core Seeders (always run) ─────────────────────────────────────────
        $this->call([
            RolePermissionSeeder::class,   // roles, permissions, assign to users
            ProductSeeder::class,          // products & prices with promo rules
            SettingsSeeder::class,         // Jaz Pure business settings
            EmployeeSeeder::class,         // default employees linked to user accounts
        ]);

        // ── Optional: Sample Data for Demo/Testing ────────────────────────────
        // Uncomment the line below to seed sample customers, sales, expenses, etc.
        // $this->call(SampleDataSeeder::class);
    }
}
