<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $outletId = $user->outlet_id;
        
        // Today's stats
        $todaySales = Sale::where('outlet_id', $outletId)
            ->whereDate('created_at', today())
            ->where('status', 'completed')
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(total), 0) as total')
            ->first();

        $totalProducts = Product::where('is_active', true)->count();
        $lowStockProducts = Product::where('is_active', true)
            ->whereHas('outletSettings', function($query) use ($outletId) {
                $query->where('outlet_id', $outletId)->whereColumn('stock', '<=', 'min_stock');
            })
            ->count();

        // Recent sales
        $recentSales = Sale::with('user', 'customer')
            ->where('outlet_id', $outletId)
            ->where('status', 'completed')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        // Weekly sales for chart (Last 7 days)
        $rawWeeklySales = Sale::where('outlet_id', $outletId)
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(created_at) as date, SUM(total) as total, COUNT(*) as count')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $weeklySales = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $weeklySales[] = [
                'date' => $date,
                'total' => $rawWeeklySales->has($date) ? (float)$rawWeeklySales->get($date)->total : 0,
                'count' => $rawWeeklySales->has($date) ? (int)$rawWeeklySales->get($date)->count : 0,
            ];
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'todaySalesCount' => $todaySales->count ?? 0,
                'todaySalesTotal' => $todaySales->total ?? 0,
                'totalProducts' => $totalProducts,
                'lowStockProducts' => $lowStockProducts,
            ],
            'recentSales' => $recentSales,
            'weeklySales' => $weeklySales,
        ]);
    }

    public function portal(): Response
    {
        $quote = $this->getRandomQuote();

        return Inertia::render('Portal', [
            'quote' => $quote
        ]);
    }

    private function getRandomQuote(): array
    {
        $fallbacks = [
            ['text' => 'Kualitas lebih penting daripada kuantitas. Satu home run jauh lebih baik daripada dua double.', 'author' => 'Steve Jobs'],
            ['text' => 'Bisnis yang hebat tidak dibangun oleh satu orang, mereka dibangun oleh tim.', 'author' => 'Steve Jobs'],
            ['text' => 'Kepuasan pelanggan adalah aset paling berharga dalam bisnis Anda.', 'author' => 'Anonim'],
            ['text' => 'Inovasi adalah hal yang membedakan antara pemimpin dan pengikut.', 'author' => 'Steve Jobs'],
            ['text' => 'Jangan menunggu kesempatan, ciptakanlah.', 'author' => 'Anonim'],
            ['text' => 'Fokuslah pada pelayanan, maka keuntungan akan mengikuti.', 'author' => 'Anonim'],
            ['text' => 'Keberhasilan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan.', 'author' => 'Colin Powell'],
            ['text' => 'Cara terbaik untuk memprediksi masa depan adalah dengan menciptakannya.', 'author' => 'Peter Drucker'],
        ];

        try {
            $response = \Illuminate\Support\Facades\Http::timeout(3)->get('https://zenquotes.io/api/random');
            
            if ($response->successful()) {
                $data = $response->json();
                if (!empty($data) && isset($data[0]['q'])) {
                    return [
                        'text' => $data[0]['q'],
                        'author' => $data[0]['a']
                    ];
                }
            }
        } catch (\Exception $e) {
            // Log error if needed, but fail silently for UX
        }

        return $fallbacks[array_rand($fallbacks)];
    }
}
