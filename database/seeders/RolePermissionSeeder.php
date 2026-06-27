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
            'manage users',
            'manage roles',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions($permissions);

        $cashier = Role::firstOrCreate(['name' => 'cashier']);
        $cashier->syncPermissions([
            'view dashboard',
            'use pos',
            'view sales',
            'manage expenses',
            'view reports',
        ]);

        $adminUser = User::where('email', 'admin@pos.com')->first();
        if ($adminUser) {
            $adminUser->syncRoles(['admin']);
        }

        $cashierUser = User::where('email', 'cashier@pos.com')->first();
        if ($cashierUser) {
            $cashierUser->syncRoles(['cashier']);
        }
    }
}
