<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display a listing of the settings.
     */
    public function index(): Response
    {
        // Admin only feature
        $this->authorize('dashboard.view'); // You may want a specific 'settings.manage' permission

        $settings = Setting::getMany([
            'tax_enabled',
            'tax_percentage',
            'shop_name',
            'shop_address',
            'shop_phone',
            'shop_email',
            'shop_npwp',
            'shop_footer_notes',
            'base_starting_cash',
        ]);

        return Inertia::render('Settings/Index', [
            'settings' => [
                'tax_enabled' => filter_var($settings['tax_enabled'] ?? 'false', FILTER_VALIDATE_BOOLEAN),
                'tax_percentage' => (float)($settings['tax_percentage'] ?? 11),
                'shop_name' => $settings['shop_name'] ?? 'CodecPOS',
                'shop_address' => $settings['shop_address'] ?? '',
                'shop_phone' => $settings['shop_phone'] ?? '',
                'shop_email' => $settings['shop_email'] ?? '',
                'shop_npwp' => $settings['shop_npwp'] ?? '',
                'shop_footer_notes' => $settings['shop_footer_notes'] ?? 'Terima kasih telah berbelanja!',
                'base_starting_cash' => (float)($settings['base_starting_cash'] ?? 0),
            ]
        ]);
    }

    /**
     * Store or update settings.
     */
    public function store(Request $request)
    {
        $this->authorize('dashboard.view');

        $validated = $request->validate([
            'tax_enabled' => 'required|boolean',
            'tax_percentage' => 'required_if:tax_enabled,true|numeric|min:0|max:100',
            'shop_name' => 'required|string|max:255',
            'shop_address' => 'nullable|string',
            'shop_phone' => 'nullable|string',
            'shop_email' => 'nullable|email',
            'shop_npwp' => 'nullable|string',
            'shop_footer_notes' => 'nullable|string',
            'base_starting_cash' => 'required|numeric|min:0',
        ]);

        Setting::set('tax_enabled', $validated['tax_enabled'] ? 'true' : 'false');
        Setting::set('tax_percentage', $validated['tax_percentage'] ?? 0);
        Setting::set('shop_name', $validated['shop_name']);
        Setting::set('shop_address', $validated['shop_address'] ?? '');
        Setting::set('shop_phone', $validated['shop_phone'] ?? '');
        Setting::set('shop_email', $validated['shop_email'] ?? '');
        Setting::set('shop_npwp', $validated['shop_npwp'] ?? '');
        Setting::set('shop_footer_notes', $validated['shop_footer_notes'] ?? '');
        Setting::set('base_starting_cash', $validated['base_starting_cash']);

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
