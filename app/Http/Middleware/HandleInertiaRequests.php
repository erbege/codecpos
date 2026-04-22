<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user()?->load('outlet'),
                'roles' => $request->user() ? $request->user()->getRoleNames() : [],
                'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name') : [],
            ],
            'app_settings' => [
                'shop_name' => \App\Models\Setting::get('shop_name', 'CodecPOS'),
                'shop_address' => \App\Models\Setting::get('shop_address', 'Alamat Toko Belum Diatur'),
                'shop_phone' => \App\Models\Setting::get('shop_phone', '-'),
                'shop_email' => \App\Models\Setting::get('shop_email', '-'),
                'shop_npwp' => \App\Models\Setting::get('shop_npwp', '-'),
                'shop_footer_notes' => \App\Models\Setting::get('shop_footer_notes', 'Terima kasih telah berbelanja!'),
                'enable_shift_management' => filter_var(\App\Models\Setting::get('enable_shift_management', 'true'), FILTER_VALIDATE_BOOLEAN),
                'pos_print_method' => \App\Models\Setting::get('pos_print_method', 'browser'),
                'pos_printer_connection' => \App\Models\Setting::get('pos_printer_connection', 'network_lan'),
                'pos_printer_ip' => \App\Models\Setting::get('pos_printer_ip', ''),
                'pos_printer_port' => \App\Models\Setting::get('pos_printer_port', '9100'),
                'pos_print_proxy_url' => \App\Models\Setting::get('pos_print_proxy_url', 'http://localhost:8080'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'last_sale_invoice' => fn () => $request->session()->get('last_sale_invoice'),
            ],
        ];
    }
}
