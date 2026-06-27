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
    $adminPerms = [
        'view dashboard', 'use pos', 'view sales', 'delete sales',
        'manage products', 'manage expenses', 'manage inventory',
        'view reports', 'view deliveries', 'manage deliveries',
        'manage loading', 'manage employees',
        'manage users', 'manage roles',
    ];
    $cashierPerms = [
        'view dashboard', 'use pos', 'view sales',
        'manage expenses', 'view reports',
        'view deliveries', 'manage deliveries',
    ];
    $riderPerms  = ['view dashboard', 'view deliveries'];
    $loaderPerms = ['view dashboard', 'view deliveries', 'manage loading'];

    foreach (array_unique(array_merge($adminPerms, $cashierPerms, $riderPerms, $loaderPerms)) as $p) {
        Permission::firstOrCreate(['name' => $p]);
    }

    Role::firstOrCreate(['name' => 'admin'])->syncPermissions($adminPerms);
    Role::firstOrCreate(['name' => 'cashier'])->syncPermissions($cashierPerms);
    Role::firstOrCreate(['name' => 'rider'])->syncPermissions($riderPerms);
    Role::firstOrCreate(['name' => 'loader'])->syncPermissions($loaderPerms);

    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

function cashierUser(): User
{
    $permissions = [
        'view dashboard', 'use pos', 'view sales',
        'manage expenses', 'view reports',
        'view deliveries', 'manage deliveries',
    ];

    foreach ($permissions as $p) {
        Permission::firstOrCreate(['name' => $p]);
    }

    $role = Role::firstOrCreate(['name' => 'cashier']);
    $role->syncPermissions($permissions);

    $user = User::factory()->create();
    $user->assignRole('cashier');

    return $user;
}

function riderUser(): User
{
    $permissions = ['view dashboard', 'view deliveries'];

    foreach ($permissions as $p) {
        Permission::firstOrCreate(['name' => $p]);
    }

    $role = Role::firstOrCreate(['name' => 'rider']);
    $role->syncPermissions($permissions);

    $user = User::factory()->create();
    $user->assignRole('rider');

    return $user;
}

function loaderUser(): User
{
    $permissions = ['view dashboard', 'view deliveries'];

    foreach ($permissions as $p) {
        Permission::firstOrCreate(['name' => $p]);
    }

    $role = Role::firstOrCreate(['name' => 'loader']);
    $role->syncPermissions($permissions);

    $user = User::factory()->create();
    $user->assignRole('loader');

    return $user;
}
