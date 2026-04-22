<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $this->authorize('roles.manage');

        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('roles.manage');

        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create(['name' => strtolower($validated['name'])]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Peran baru berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $this->authorize('roles.manage');

        if ($role->name === 'admin') {
            return back()->with('error', 'HAK AKSES ADMIN TERKUNCI. Izin untuk role admin tidak dapat diubah demi keamanan sistem.');
        }

        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update(['name' => strtolower($validated['name'])]);
        
        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Hak akses peran berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        $this->authorize('roles.manage');

        if ($role->name === 'admin') {
            return back()->with('error', 'Peran admin adalah sistem dan tidak dapat dihapus.');
        }

        // Check if role is in use
        if ($role->users()->count() > 0) {
            return back()->with('error', 'Peran ini tidak dapat dihapus karena masih digunakan oleh beberapa pengguna.');
        }

        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Peran berhasil dihapus.');
    }
}
