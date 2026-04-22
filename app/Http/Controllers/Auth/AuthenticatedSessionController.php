<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'users' => $users,
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        if ($request->has('redirect_to')) {
            return redirect($request->redirect_to);
        }

        if (Auth::user()->hasRole('kasir')) {
            $enableShift = filter_var(\App\Models\Setting::get('enable_shift_management', 'true'), FILTER_VALIDATE_BOOLEAN);
            if (!$enableShift) {
                return redirect()->route('pos');
            }
            return redirect()->route('shifts.index');
        }

        return redirect()->intended(route('portal', absolute: false));
    }

    /**
     * Handle a shift handover authentication request.
     */
    public function handover(LoginRequest $request): RedirectResponse
    {
        // 1. Authenticate the new user
        $request->authenticate();

        // 2. The authenticate() method already called Auth::login()
        // We just need to ensure the session is properly regenerated for the new user
        $request->session()->regenerate();

        if ($request->has('redirect_to')) {
            return redirect($request->redirect_to);
        }

        $enableShift = filter_var(\App\Models\Setting::get('enable_shift_management', 'true'), FILTER_VALIDATE_BOOLEAN);
        if (!$enableShift) {
            return redirect()->route('pos');
        }

        return redirect()->route('shifts.index');
    }

    /**
     * Handle a seamless user switch from POS/other modules.
     * Ensures the old session is completely destroyed for security.
     */
    public function switchUser(LoginRequest $request): RedirectResponse
    {
        // Logout current user and clear session first for security
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Authenticate the new user
        $request->authenticate();
        $request->session()->regenerate();

        return redirect()->back();
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
