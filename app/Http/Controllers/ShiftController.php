<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use App\Models\Setting;
use App\Models\User;
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
        $enableShiftManagement = filter_var(\App\Models\Setting::get('enable_shift_management', 'true'), FILTER_VALIDATE_BOOLEAN);
        
        if (!$enableShiftManagement) {
            return redirect()->route('pos')->with('info', 'Manajemen shift saat ini dinonaktifkan.');
        }

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

        // Cari apakah ada shift aktif lain di outlet ini (milik rekan kerja)
        $outletActiveShift = Shift::with(['user'])
            ->where('outlet_id', $outletId)
            ->where('status', 'open')
            ->where('user_id', '!=', Auth::id())
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
            'outletActiveShift' => $outletActiveShift,
            'historyShifts' => $historyShifts,
            'suggestedStartingCash' => (float)$suggestedStartingCash,
            'currentOutlet' => \App\Models\Outlet::find($outletId),
            'allOpenShifts' => Shift::with('outlet')->where('user_id', Auth::id())->where('status', 'open')->get(),
            'users' => User::select('id', 'name', 'email')->orderBy('name')->get(),
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

        $activeShift = Shift::where('outlet_id', $outletId)
            ->where('status', 'open')
            ->first();

        if ($activeShift) {
            if ($activeShift->user_id === Auth::id()) {
                return back()->with('error', 'Anda sudah memiliki shift yang aktif di outlet ini.');
            } else {
                return back()->with('error', 'Gagal! Masih ada shift aktif milik ' . ($activeShift->user->name ?? 'User Lain') . ' yang belum ditutup.');
            }
        }

        Shift::create([
            'user_id' => Auth::id(),
            'outlet_id' => $outletId,
            'start_time' => now(),
            'starting_cash' => $request->starting_cash,
            'status' => 'open',
        ]);

        return redirect()->route('pos')->with('success', 'Shift berhasil dimulai! Selamat bertugas.');
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

    /**
     * Tutup Shift milik user lain (Handover Paksa).
     * Memerlukan PIN kasir tersebut atau wewenang Admin.
     */
    public function forceEnd(Request $request)
    {
        $this->authorize('sales.create');

        $user = Auth::user();
        $isAdmin = $user->hasRole('admin') || $user->hasRole('super-admin') || $user->hasRole('owner');

        $request->validate([
            'shift_id' => 'required|exists:shifts,id',
            'actual_ending_cash' => 'required|numeric|min:0',
            'pin' => $isAdmin ? 'nullable|string' : 'required|string|digits:6',
            'notes' => 'nullable|string'
        ]);

        $shift = Shift::findOrFail($request->shift_id);
        
        if ($shift->status !== 'open') {
            return back()->with('error', 'Shift ini sudah ditutup sebelumnya.');
        }

        // Verifikasi Otoritas: Harus Admin atau punya PIN yang benar
        $user = Auth::user();
        $isAdmin = $user->hasRole('admin') || $user->hasRole('super-admin') || $user->hasRole('owner');

        if (!$isAdmin) {
            $previousUser = $shift->user;
            if (!\Illuminate\Support\Facades\Hash::check($request->pin, $previousUser->pin)) {
                return back()->with('error', 'PIN Kasir ' . $previousUser->name . ' salah.');
            }
        }

        $shift->update([
            'end_time' => now(),
            'actual_ending_cash' => $request->actual_ending_cash,
            'status' => 'closed',
            'notes' => '[FORCE CLOSED BY ' . $user->name . '] ' . $request->notes,
        ]);

        return back()->with('success', 'Shift kasir sebelumnya berhasil ditutup.');
    }
}
