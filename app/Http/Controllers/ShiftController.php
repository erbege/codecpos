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
     * Tampilkan halaman pengelolaan Shift Kasir.
     */
    public function index()
    {
        $this->authorize('sales.create'); // Hanya yang bisa jualan (Kasir) yang butuh shift

        $activeShift = Shift::where('user_id', Auth::id())
            ->where('status', 'open')
            ->first();

        // Riwayat shift 10 terakhir
        $historyShifts = Shift::where('user_id', Auth::id())
            ->where('status', 'closed')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get();

        if ($activeShift) {
            $activeShift->append('expected_ending_cash');
        }

        // Calculate suggested starting cash (Carry-over logic)
        $baseStartingCash = (float)Setting::get('base_starting_cash', 0);
        $lastShift = Shift::where('outlet_id', Auth::user()->outlet_id)
            ->where('status', 'closed')
            ->orderBy('id', 'desc')
            ->first();

        $suggestedStartingCash = $lastShift ? $lastShift->actual_ending_cash : $baseStartingCash;

        return Inertia::render('Shifts/Index', [
            'activeShift' => $activeShift,
            'historyShifts' => $historyShifts,
            'suggestedStartingCash' => (float)$suggestedStartingCash,
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

        $activeShift = Shift::where('user_id', Auth::id())->where('status', 'open')->first();
        if ($activeShift) {
            return back()->with('error', 'Anda sudah memiliki shift yang aktif.');
        }

        Shift::create([
            'user_id' => Auth::id(),
            'outlet_id' => Auth::user()->outlet_id,
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

        $activeShift = Shift::where('user_id', Auth::id())->where('status', 'open')->first();
        if (!$activeShift) {
            return back()->with('error', 'Tidak ada shift aktif yang ditemukan.');
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
