<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions
        $permissions = [
            // Dashboard
            'dashboard.view',

            // Users
            'users.read',
            'users.create',
            'users.update',
            'users.delete',

            // Roles
            'roles.manage',

            // Products
            'products.read',
            'products.create',
            'products.update',
            'products.delete',

            // Categories
            'categories.read',
            'categories.create',
            'categories.update',
            'categories.delete',

            // Sales / POS
            'sales.create',
            'sales.read',
            'sales.void',
            'sales.refund',

            // Stock
            'stock.read',
            'stock.adjust',

            // Customers
            'customers.read',
            'customers.create',
            'customers.update',
            'customers.delete',

            // Reports
            'reports.view',
            'reports.export',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo(Permission::all());

        $kasir = Role::create(['name' => 'kasir']);
        $kasir->givePermissionTo([
            'dashboard.view',
            'sales.create',
            'sales.read',
            'products.read',
            'categories.read',
            'customers.read',
            'customers.create',
            'stock.read',
        ]);

        $owner = Role::create(['name' => 'owner']);
        $owner->givePermissionTo([
            'dashboard.view',
            'products.read',
            'categories.read',
            'sales.read',
            'stock.read',
            'customers.read',
            'reports.view',
            'reports.export',
        ]);

        $inventoryStaff = Role::create(['name' => 'inventory_staff']);
        $inventoryStaff->givePermissionTo([
            'dashboard.view',
            'products.read',
            'products.create',
            'products.update',
            'products.delete',
            'categories.read',
            'categories.create',
            'categories.update',
            'categories.delete',
            'stock.read',
            'stock.adjust',
        ]);

        $manager = Role::create(['name' => 'manager']);
        $manager->givePermissionTo([
            'dashboard.view',
            'products.read',
            'categories.read',
            'sales.read',
            'sales.void',
            'sales.refund',
            'stock.read',
            'customers.read',
            'reports.view',
            'reports.export',
        ]);
    }
}
