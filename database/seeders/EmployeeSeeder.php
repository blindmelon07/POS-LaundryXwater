<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            [
                'email'       => 'cashier@pos.com',
                'name'        => 'Cashier',
                'position'    => 'Cashier',
                'base_salary' => 8000.00,
                'hire_date'   => now()->startOfYear()->toDateString(),
                'is_active'   => true,
            ],
            [
                'email'       => 'rider@pos.com',
                'name'        => 'Rider',
                'position'    => 'Delivery Rider',
                'base_salary' => 7000.00,
                'hire_date'   => now()->startOfYear()->toDateString(),
                'is_active'   => true,
            ],
            [
                'email'       => 'loader@pos.com',
                'name'        => 'Loader',
                'position'    => 'Loader',
                'base_salary' => 6500.00,
                'hire_date'   => now()->startOfYear()->toDateString(),
                'is_active'   => true,
            ],
        ];

        foreach ($defaults as $data) {
            $user = User::where('email', $data['email'])->first();
            if (!$user) continue;

            Employee::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name'        => $data['name'],
                    'position'    => $data['position'],
                    'base_salary' => $data['base_salary'],
                    'hire_date'   => $data['hire_date'],
                    'is_active'   => $data['is_active'],
                ]
            );
        }
    }
}
