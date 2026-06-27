<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view dashboard',
            'use pos',
            'view sales',
            'delete sales',
            'manage products',
            'manage expenses',
            'manage inventory',
            'view reports',
            'view deliveries',
            'manage deliveries',
            'manage loading',
            'manage users',
            'manage roles',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Admin — full access
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions($permissions);

        // Cashier — POS, sales, expenses, deliveries (create/delete), reports
        $cashier = Role::firstOrCreate(['name' => 'cashier']);
        $cashier->syncPermissions([
            'view dashboard',
            'use pos',
            'view sales',
            'manage expenses',
            'view reports',
            'view deliveries',
            'manage deliveries',
        ]);

        // Rider — view and update delivery status
        $rider = Role::firstOrCreate(['name' => 'rider']);
        $rider->syncPermissions([
            'view dashboard',
            'view deliveries',
        ]);

        // Loader — views deliveries + logs product in/out
        $loader = Role::firstOrCreate(['name' => 'loader']);
        $loader->syncPermissions([
            'view dashboard',
            'view deliveries',
            'manage loading',
        ]);

        // Assign default accounts
        $adminUser = User::where('email', 'admin@pos.com')->first();
        if ($adminUser) $adminUser->syncRoles(['admin']);

        $cashierUser = User::where('email', 'cashier@pos.com')->first();
        if ($cashierUser) $cashierUser->syncRoles(['cashier']);

        $riderUser = User::where('email', 'rider@pos.com')->first();
        if ($riderUser) $riderUser->syncRoles(['rider']);

        $loaderUser = User::where('email', 'loader@pos.com')->first();
        if ($loaderUser) $loaderUser->syncRoles(['loader']);
    }
}
