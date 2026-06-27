<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'business_name'    => 'Jaz Pure Water Refilling Station',
            'business_address' => '123 Purity St, Barangay Water, Cebu City',
            'business_phone'   => '09171234567',
            'business_email'   => 'jazpure@email.com',
            'receipt_footer'   => 'Thank you for choosing Jaz Pure! Stay hydrated!',
            'tax_rate'         => '0',
            'currency'         => '₱',
        ];

        foreach ($settings as $key => $value) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
