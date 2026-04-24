<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Add RBAC permissions for the Promotions module.
 * Assign to admin and owner roles.
 */
return new class extends Migration
{
    public function up(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'promotions.read',
            'promotions.create',
            'promotions.update',
            'promotions.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Admin gets all promotion permissions
        $admin = Role::findByName('admin');
        if ($admin) {
            $admin->givePermissionTo($permissions);
        }

        // Owner gets all promotion permissions
        $owner = Role::findByName('owner');
        if ($owner) {
            $owner->givePermissionTo($permissions);
        }

        // Manager gets read-only
        $manager = Role::findByName('manager');
        if ($manager) {
            $manager->givePermissionTo(['promotions.read']);
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function down(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'promotions.read',
            'promotions.create',
            'promotions.update',
            'promotions.delete',
        ];

        foreach (Role::all() as $role) {
            $role->revokePermissionTo($permissions);
        }

        Permission::whereIn('name', $permissions)->delete();

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }
};
