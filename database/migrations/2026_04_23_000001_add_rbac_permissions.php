<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Migration: Add granular RBAC permissions for Settings, Outlets,
 * Suppliers, Purchases, and Shifts modules.
 *
 * Also fixes role assignments for:
 *  - owner: gains sales.create (POS access)
 *  - kasir: gains sales.refund (can create returns, needs approval)
 *  - inventory_staff & manager: gains granular supplier/purchase/shift permissions
 */
return new class extends Migration
{
    public function up(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ─────────────────────────────────────────────────────────────────────
        // 1. Add new permissions
        // ─────────────────────────────────────────────────────────────────────
        $newPermissions = [
            // Settings / Pengaturan Toko
            'settings.manage',

            // Outlets / Cabang (granular)
            'outlets.read',
            'outlets.create',
            'outlets.update',
            'outlets.delete',

            // Suppliers / Pemasok (granular — replaces stock.* proxy)
            'suppliers.read',
            'suppliers.create',
            'suppliers.update',
            'suppliers.delete',

            // Purchases / Barang Masuk (granular — replaces stock.* proxy)
            'purchases.read',
            'purchases.create',

            // Shifts (operational management)
            'shifts.manage',      // View all shifts history, manage shift operations
            'shifts.force_close', // Force-close shift milik user lain
        ];

        foreach ($newPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // ─────────────────────────────────────────────────────────────────────
        // 2. ADMIN — already has all permissions, just sync the new ones
        // ─────────────────────────────────────────────────────────────────────
        $admin = Role::findByName('admin');
        if ($admin) {
            $admin->givePermissionTo($newPermissions);
        }

        // ─────────────────────────────────────────────────────────────────────
        // 3. OWNER — add sales.create (POS access) + relevant view permissions
        // ─────────────────────────────────────────────────────────────────────
        $owner = Role::findByName('owner');
        if ($owner) {
            $owner->givePermissionTo([
                'sales.create',        // ← NEW: owner can access POS
                'outlets.read',        // ← NEW: owner can view all branches
                'purchases.read',      // ← NEW: owner can view purchase history
                'shifts.manage',       // ← NEW: owner can view shift history
            ]);
        }

        // ─────────────────────────────────────────────────────────────────────
        // 4. KASIR — add sales.refund (can create returns)
        // ─────────────────────────────────────────────────────────────────────
        $kasir = Role::findByName('kasir');
        if ($kasir) {
            $kasir->givePermissionTo([
                'sales.refund', // ← NEW: kasir can create returns
            ]);
        }

        // ─────────────────────────────────────────────────────────────────────
        // 5. INVENTORY_STAFF — add granular supplier/purchase permissions
        // ─────────────────────────────────────────────────────────────────────
        $inventoryStaff = Role::findByName('inventory_staff');
        if ($inventoryStaff) {
            $inventoryStaff->givePermissionTo([
                'suppliers.read',
                'suppliers.create',
                'suppliers.update',
                'suppliers.delete',
                'purchases.read',
                'purchases.create',
            ]);
        }

        // ─────────────────────────────────────────────────────────────────────
        // 6. MANAGER — add relevant supervisory permissions
        // ─────────────────────────────────────────────────────────────────────
        $manager = Role::findByName('manager');
        if ($manager) {
            $manager->givePermissionTo([
                'outlets.read',        // ← NEW: manager can view branches
                'suppliers.read',      // ← NEW: manager can view suppliers
                'purchases.read',      // ← NEW: manager can view purchase orders
                'shifts.manage',       // ← NEW: manager can manage shifts
                'shifts.force_close',  // ← NEW: manager can force-close shifts
            ]);
        }

        // ─────────────────────────────────────────────────────────────────────
        // 7. Reset cache again after changes
        // ─────────────────────────────────────────────────────────────────────
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function down(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissionsToRemove = [
            'settings.manage',
            'outlets.read',
            'outlets.create',
            'outlets.update',
            'outlets.delete',
            'suppliers.read',
            'suppliers.create',
            'suppliers.update',
            'suppliers.delete',
            'purchases.read',
            'purchases.create',
            'shifts.manage',
            'shifts.force_close',
        ];

        // Revoke from all roles before deleting
        foreach (Role::all() as $role) {
            $role->revokePermissionTo($permissionsToRemove);
        }

        // Also revoke specific additions to existing roles from up()
        $kasir = Role::findByName('kasir');
        if ($kasir) {
            $kasir->revokePermissionTo('sales.refund');
        }

        $owner = Role::findByName('owner');
        if ($owner) {
            $owner->revokePermissionTo('sales.create');
        }

        // Delete the new permissions
        Permission::whereIn('name', $permissionsToRemove)->delete();

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }
};
