<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ShiftController extends Controller
{
    /**
     * Get the active outlet ID for the current session/user.
     */
    private function getActiveOutletId(): ?int
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('admin') || $user->hasRole('super-admin') || $user->hasRole('owner');
        
        if ($isAdmin) {
            return session('active_pos_outlet_id') ?: $user->outlet_id;
        }

        return (int) $user->outlet_id;
    }

    /**
     * Tampilkan halaman pengelolaan Shift Kasir.
     */
    public function index()
    {
        $this->authorize('sales.create');

        $user = Auth::user();
        $isAdmin = $user->hasRole('admin') || $user->hasRole('super-admin') || $user->hasRole('owner');
        $outletId = $this->getActiveOutletId();

        // If Admin hasn't selected an outlet and is trying to access shift, send them to POS selection
        if ($isAdmin && !$outletId) {
            return redirect()->route('pos')->with('info', 'Silakan pilih outlet terlebih dahulu.');
        }

        $activeShift = Shift::with(['user', 'outlet'])
            ->where('user_id', Auth::id())
            ->where('outlet_id', $outletId)
            ->where('status', 'open')
            ->first();

        // Riwayat shift 10 terakhir untuk outlet ini
        $historyShifts = Shift::with(['user', 'outlet'])
            ->where('user_id', Auth::id())
            ->where('outlet_id', $outletId)
            ->where('status', 'closed')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get();

        if ($activeShift) {
            $activeShift->append('expected_ending_cash');
        }

        // Calculate suggested starting cash (Carry-over logic for this outlet)
        $baseStartingCash = (float)Setting::get('base_starting_cash', 0);
        $lastShift = Shift::where('outlet_id', $outletId)
            ->where('status', 'closed')
            ->orderBy('id', 'desc')
            ->first();

        $suggestedStartingCash = $lastShift ? $lastShift->actual_ending_cash : $baseStartingCash;

        return Inertia::render('Shifts/Index', [
            'activeShift' => $activeShift,
            'historyShifts' => $historyShifts,
            'suggestedStartingCash' => (float)$suggestedStartingCash,
            'currentOutlet' => \App\Models\Outlet::find($outletId),
            'allOpenShifts' => Shift::with('outlet')->where('user_id', Auth::id())->where('status', 'open')->get(),
        ]);
    }

    /**
     * Buka Shift dengan modal kas awal.
     */
    public function start(Request $request)
    {
        $this->authorize('sales.create');

        $request->validate([
            'starting_cash' => 'required|numeric|min:0',
        ]);

        $outletId = $this->getActiveOutletId();
        
        if (!$outletId) {
            return back()->with('error', 'Outlet belum dipilih.');
        }

        $activeShift = Shift::where('user_id', Auth::id())
            ->where('outlet_id', $outletId)
            ->where('status', 'open')
            ->first();

        if ($activeShift) {
            return back()->with('error', 'Anda sudah memiliki shift yang aktif di outlet ini.');
        }

        Shift::create([
            'user_id' => Auth::id(),
            'outlet_id' => $outletId,
            'start_time' => now(),
            'starting_cash' => $request->starting_cash,
            'status' => 'open',
        ]);

        return back()->with('success', 'Shift berhasil dimulai! Anda dapat mulai bertransaksi.');
    }

    /**
     * Tutup Shift aktif dengan modal akhir riil.
     */
    public function end(Request $request)
    {
        $this->authorize('sales.create');

        $request->validate([
            'actual_ending_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        $outletId = $this->getActiveOutletId();

        $activeShift = Shift::where('user_id', Auth::id())
            ->where('outlet_id', $outletId)
            ->where('status', 'open')
            ->first();

        if (!$activeShift) {
            return back()->with('error', 'Tidak ada shift aktif yang ditemukan untuk outlet ini.');
        }

        $activeShift->update([
            'end_time' => now(),
            'actual_ending_cash' => $request->actual_ending_cash,
            'status' => 'closed',
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Shift telah ditutup.');
    }
}
