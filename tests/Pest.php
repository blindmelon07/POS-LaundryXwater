<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

// Helper: create a user and assign a role with all permissions
function adminUser(): User
{
    $permissions = [
        'view dashboard', 'use pos', 'view sales', 'delete sales',
        'manage products', 'manage expenses', 'manage inventory',
        'view reports', 'manage users', 'manage roles',
    ];

    foreach ($permissions as $p) {
        Permission::firstOrCreate(['name' => $p]);
    }

    $role = Role::firstOrCreate(['name' => 'admin']);
    $role->syncPermissions($permissions);

    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

function cashierUser(): User
{
    $permissions = ['view dashboard', 'use pos', 'view sales', 'manage expenses', 'view reports'];

    foreach ($permissions as $p) {
        Permission::firstOrCreate(['name' => $p]);
    }

    $role = Role::firstOrCreate(['name' => 'cashier']);
    $role->syncPermissions($permissions);

    $user = User::factory()->create();
    $user->assignRole('cashier');

    return $user;
}
