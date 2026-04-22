<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $this->authorize('users.read');

        $users = User::with(['outlet', 'roles'])->orderBy('name')->get();
        $outlets = Outlet::where('is_active', true)->orderBy('name')->get();
        $roles = Role::all();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'outlets' => $outlets,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('users.create');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', Password::defaults()],
            'pin' => 'required|numeric|digits:6',
            'outlet_id' => 'nullable|exists:outlets,id',
            'role' => 'required|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'pin' => Hash::make($validated['pin']),
            'outlet_id' => $validated['outlet_id'],
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('users.index')
            ->with('success', 'User baru berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('users.update');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,'.$user->id,
            'password' => ['nullable', Password::defaults()],
            'pin' => 'required|numeric|digits:6',
            'outlet_id' => 'nullable|exists:outlets,id',
            'role' => 'required|exists:roles,name',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'outlet_id' => $validated['outlet_id'],
        ]);

        if (!empty($validated['password'])) {
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);
        }

        $user->update([
            'pin' => Hash::make($validated['pin']),
        ]);

        $user->syncRoles($validated['role']);

        return redirect()->route('users.index')
            ->with('success', 'Data user berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $this->authorize('users.delete');

        if (auth()->id() === $user->id) {
            return back()->with('error', 'Anda tidak dapat menghapus diri sendiri.');
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User berhasil dihapus.');
    }
}
