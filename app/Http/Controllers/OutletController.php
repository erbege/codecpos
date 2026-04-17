<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OutletController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $this->authorize('dashboard.view'); // Use dashboard view as base permission for now

        $outlets = Outlet::orderBy('name')->get();

        return Inertia::render('Outlets/Index', [
            'outlets' => $outlets,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('dashboard.view');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'required|boolean',
        ]);

        Outlet::create($validated);

        return redirect()->route('outlets.index')
            ->with('success', 'Cabang baru berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Outlet $outlet)
    {
        $this->authorize('dashboard.view');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'required|boolean',
        ]);

        $outlet->update($validated);

        return redirect()->route('outlets.index')
            ->with('success', 'Data cabang berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Outlet $outlet)
    {
        $this->authorize('dashboard.view');

        // Check if outlet has users or sales
        if ($outlet->users()->exists() || $outlet->sales()->exists()) {
            return back()->with('error', 'Cabang tidak bisa dihapus karena memiliki data transaksi atau user terkait.');
        }

        $outlet->delete();

        return redirect()->route('outlets.index')
            ->with('success', 'Cabang berhasil dihapus.');
    }
}
