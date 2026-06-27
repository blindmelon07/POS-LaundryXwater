<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

// Reset Spatie permission cache before every test so RefreshDatabase doesn't leave stale data
beforeEach(function () {
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
});

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

    $adminRole = Role::firstOrCreate(['name' => 'admin']);
    $adminRole->syncPermissions($permissions);

    // Ensure cashier role exists so UserController validation passes
    $cashierPerms = ['view dashboard', 'use pos', 'view sales', 'manage expenses', 'view reports'];
    foreach ($cashierPerms as $p) {
        Permission::firstOrCreate(['name' => $p]);
    }
    $cashierRole = Role::firstOrCreate(['name' => 'cashier']);
    $cashierRole->syncPermissions($cashierPerms);

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
