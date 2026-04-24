<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Models\Shift;
use App\Exports\SalesReportExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the reporting dashboard.
     */
    public function index(Request $request): Response
    {
        $this->authorize('reports.view');

        $filters = $this->getFilters($request);
        $outletId = $filters['outlet_id'];
        $dateFrom = $filters['date_from'];
        $dateTo = $filters['date_to'];

        // Sales Summary
        $salesSummary = Sale::where('status', 'completed')
            ->when($outletId, fn($q) => $q->where('outlet_id', $outletId))
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->selectRaw('COUNT(*) as total_orders, SUM(total) as gross_sales, SUM(discount) as total_discount, SUM(tax) as total_tax')
            ->first();

        // Stock Summary
        $totalStockValue = Product::whereHas('outletSettings', function ($q) use ($outletId) {
            if ($outletId) $q->where('outlet_id', $outletId);
        })->get()->sum(function ($p) {
            return $p->stock * ($p->cost_price ?? 0);
        });

        $lowStockCount = Product::where('stock', '<=', DB::raw('min_stock'))->count();

        // Chart Data: Sales per day
        $chartData = Sale::where('status', 'completed')
            ->when($outletId, fn($q) => $q->where('outlet_id', $outletId))
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->selectRaw('DATE(created_at) as date, SUM(total) as amount')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Reports/Index', [
            'summary' => [
                'sales' => $salesSummary,
                'inventory' => [
                    'totalValue' => $totalStockValue,
                    'lowStockCount' => $lowStockCount
                ]
            ],
            'chartData' => $chartData,
            'filters' => $filters,
            'outlets' => Outlet::all()
        ]);
    }

    /**
     * Sales detailed report.
     */
    public function sales(Request $request): Response
    {
        $this->authorize('reports.view');
        $filters = $this->getFilters($request);
        $outletId = $filters['outlet_id'];
        $dateFrom = $filters['date_from'];
        $dateTo = $filters['date_to'];

        // 1. Sales by Product
        $salesByProduct = SaleItem::whereHas('sale', function ($q) use ($outletId, $dateFrom, $dateTo) {
            $q->where('status', 'completed')
                ->when($outletId, fn($sq) => $sq->where('outlet_id', $outletId))
                ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59']);
        })
            ->select('product_name', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as total_amount'))
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->get();

        // 2. Sales by Category
        $salesByCategory = SaleItem::whereHas('sale', function ($q) use ($outletId, $dateFrom, $dateTo) {
            $q->where('status', 'completed')
                ->when($outletId, fn($sq) => $sq->where('outlet_id', $outletId))
                ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59']);
        })
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name as category_name', DB::raw('SUM(sale_items.qty) as total_qty'), DB::raw('SUM(sale_items.subtotal) as total_amount'))
            ->groupBy('categories.name')
            ->get();

        // 3. Sales by Payment Method
        $salesByPayment = Sale::where('status', 'completed')
            ->when($outletId, fn($q) => $q->where('outlet_id', $outletId))
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as total_amount'))
            ->groupBy('payment_method')
            ->get();

        // 4. Daily Sales Trend for Chart
        $dailyTrend = Sale::where('status', 'completed')
            ->when($outletId, fn($q) => $q->where('outlet_id', $outletId))
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->selectRaw('DATE(created_at) as date, SUM(total) as amount')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // 5. Growth Calculation (Current vs Previous Period)
        $duration = (strtotime($dateTo) - strtotime($dateFrom)) / 86400;
        $prevDateTo = date('Y-m-d', strtotime($dateFrom . ' -1 day'));
        $prevDateFrom = date('Y-m-d', strtotime($prevDateTo . " -{$duration} days"));

        $currentTotal = Sale::where('status', 'completed')
            ->when($outletId, fn($q) => $q->where('outlet_id', $outletId))
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->sum('total');

        $prevTotal = Sale::where('status', 'completed')
            ->when($outletId, fn($q) => $q->where('outlet_id', $outletId))
            ->whereBetween('created_at', [$prevDateFrom, $prevDateTo . ' 23:59:59'])
            ->sum('total');

        $growth = 0;
        if ($prevTotal > 0) {
            $growth = round((($currentTotal - $prevTotal) / $prevTotal) * 100, 2);
        } elseif ($currentTotal > 0) {
            $growth = 100;
        }

        return Inertia::render('Reports/Sales', [
            'data' => [
                'byProduct' => $salesByProduct,
                'byCategory' => $salesByCategory,
                'byPayment' => $salesByPayment,
                'dailyTrend' => $dailyTrend,
                'summary' => [
                    'total_sales' => (float)$currentTotal,
                    'prev_total_sales' => (float)$prevTotal,
                    'growth' => (float)$growth,
                    'is_up' => $currentTotal >= $prevTotal
                ]
            ],
            'filters' => $filters,
            'outlets' => Outlet::all()
        ]);
    }

    /**
     * Inventory detailed report.
     */
    public function inventory(Request $request): Response
    {
        $this->authorize('reports.view');
        $filters = $this->getFilters($request);
        $outletId = $filters['outlet_id'];

        // Current Stock with Pagination
        // OPTIMIZED: Eager load all outlet settings at once instead of per-product query
        $currentStock = Product::with([
            'category',
            'outletSettings' => function ($q) use ($outletId) {
                if ($outletId) $q->where('outlet_id', $outletId);
                $q->whereNull('product_variant_id');
            }
        ])
            ->whereHas('outletSettings', function ($q) use ($outletId) {
                if ($outletId) $q->where('outlet_id', $outletId);
                $q->where('is_active', true);
            })
            ->select('products.*')
            ->orderBy('name')
            ->paginate(50)
            ->through(function ($p) use ($outletId) {
                // Use already-loaded outletSettings from eager loading
                $setting = $p->outletSettings->first();

                return [
                    'id' => $p->id,
                    'sku' => $p->sku,
                    'name' => $p->name,
                    'category' => $p->category->name ?? 'N/A',
                    'stock' => $setting ? $setting->stock : 0,
                    'min_stock' => $setting ? $setting->min_stock : $p->min_stock,
                    'value' => ($setting ? $setting->stock : 0) * ($p->cost_price ?? 0)
                ];
            });

        // Stock Movement History
        $movements = StockMovement::with(['product', 'user'])
            ->when($outletId, fn($q) => $q->where('outlet_id', $outletId))
            ->whereBetween('created_at', [$filters['date_from'], $filters['date_to'] . ' 23:59:59'])
            ->orderByDesc('created_at')
            ->paginate(50);

        return Inertia::render('Reports/Inventory', [
            'stock' => $currentStock,
            'movements' => $movements,
            'filters' => $filters,
            'outlets' => Outlet::all()
        ]);
    }

    /**
     * Financial detailed report (Gross Profit Focus).
     */
    public function financial(Request $request): Response
    {
        $this->authorize('reports.view');
        $filters = $this->getFilters($request);
        $outletId = $filters['outlet_id'];
        $dateFrom = $filters['date_from'];
        $dateTo = $filters['date_to'];

        // 1. Gross Profit Calculation
        // Profit = Sales Revenue - Cost of Goods Sold (COGS)
        $salesItems = SaleItem::whereHas('sale', function ($q) use ($outletId, $dateFrom, $dateTo) {
            $q->where('status', 'completed')
                ->when($outletId, fn($sq) => $sq->where('outlet_id', $outletId))
                ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59']);
        })
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->selectRaw('SUM(sale_items.subtotal) as total_revenue, SUM(sale_items.qty * products.cost_price) as total_cogs')
            ->first();

        $revenue = $salesItems->total_revenue ?? 0;
        $cogs = $salesItems->total_cogs ?? 0;
        $grossProfit = $revenue - $cogs;

        return Inertia::render('Reports/Financial', [
            'data' => [
                'revenue' => (float)$revenue,
                'cogs' => (float)$cogs,
                'grossProfit' => (float)$grossProfit,
                'margin' => $revenue > 0 ? round(($grossProfit / $revenue) * 100, 2) : 0
            ],
            'filters' => $filters,
            'outlets' => Outlet::all()
        ]);
    }

    /**
     * Operational detailed report.
     */
    public function operational(Request $request): Response
    {
        $this->authorize('reports.view');
        $filters = $this->getFilters($request);
        $outletId = $filters['outlet_id'];
        $dateFrom = $filters['date_from'];
        $dateTo = $filters['date_to'];

        // 1. Operational Summary
        $summary = Sale::when($outletId, fn($q) => $q->where('outlet_id', $outletId))
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->selectRaw('
                COUNT(*) as total_transactions,
                SUM(CASE WHEN status = "completed" THEN total ELSE 0 END) as net_sales,
                SUM(tax) as total_tax,
                SUM(discount) as total_discount,
                SUM(CASE WHEN status = "void" THEN 1 ELSE 0 END) as void_count,
                AVG(CASE WHEN status = "completed" THEN total ELSE NULL END) as avg_transaction_value
            ')
            ->first();

        // 2. Sales by Status
        $byStatus = Sale::when($outletId, fn($q) => $q->where('outlet_id', $outletId))
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as amount'))
            ->groupBy('status')
            ->get();

        // 3. Daily Operational Breakdown
        $dailyData = Sale::when($outletId, fn($q) => $q->where('outlet_id', $outletId))
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->selectRaw('
                DATE(created_at) as date, 
                COUNT(*) as transactions, 
                SUM(tax) as tax, 
                SUM(discount) as discount,
                SUM(CASE WHEN status = "completed" THEN total ELSE 0 END) as sales
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Reports/Operational', [
            'data' => [
                'summary' => $summary,
                'byStatus' => $byStatus,
                'daily' => $dailyData,
            ],
            'filters' => $filters,
            'outlets' => Outlet::all()
        ]);
    }

    /**
     * Export Sales Report to Excel.
     */
    public function exportSalesExcel(Request $request)
    {
        $this->authorize('reports.export');
        $filters = $this->getFilters($request);
        $outletId = $filters['outlet_id'];

        $data = SaleItem::whereHas('sale', function ($q) use ($filters, $outletId) {
            $q->where('status', 'completed')
                ->when($outletId, fn($sq) => $sq->where('outlet_id', $outletId))
                ->whereBetween('created_at', [$filters['date_from'], $filters['date_to'] . ' 23:59:59']);
        })
            ->select('product_name', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as total_amount'))
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->get();

        return Excel::download(new SalesReportExport($data), 'laporan_penjualan_' . now()->format('YmdHis') . '.xlsx');
    }

    /**
     * Export Sales Report to PDF.
     */
    public function exportSalesPdf(Request $request)
    {
        $this->authorize('reports.export');
        $filters = $this->getFilters($request);
        $outletId = $filters['outlet_id'];
        $outlet = $outletId ? Outlet::find($outletId) : null;

        $data = SaleItem::whereHas('sale', function ($q) use ($filters, $outletId) {
            $q->where('status', 'completed')
                ->when($outletId, fn($sq) => $sq->where('outlet_id', $outletId))
                ->whereBetween('created_at', [$filters['date_from'], $filters['date_to'] . ' 23:59:59']);
        })
            ->select('product_name', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as total_amount'))
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->get();

        $pdf = Pdf::loadView('reports.sales_pdf', [
            'data' => $data,
            'date_from' => $filters['date_from'],
            'date_to' => $filters['date_to'],
            'outlet' => $outlet
        ]);

        return $pdf->download('laporan_penjualan_' . now()->format('YmdHis') . '.pdf');
    }

    /**
     * Display shift change history report.
     */
    public function shifts(Request $request): Response
    {
        $this->authorize('reports.view');
        $filters = $this->getFilters($request);
        $outletId = $filters['outlet_id'];

        $shifts = Shift::with(['user', 'outlet'])
            ->when($outletId, fn($q) => $q->where('outlet_id', $outletId))
            ->whereBetween('start_time', [$filters['date_from'], $filters['date_to'] . ' 23:59:59'])
            ->orderByDesc('start_time')
            ->get()
            ->map(function ($shift) {
                // Ensure expected cash is calculated
                $shift->expected_ending_cash = $shift->expected_ending_cash_attribute;
                $shift->discrepancy = $shift->status === 'closed'
                    ? (float)$shift->actual_ending_cash - (float)$shift->expected_ending_cash
                    : 0;
                return $shift;
            });

        return Inertia::render('Reports/Shifts', [
            'shifts' => $shifts,
            'filters' => $filters,
            'outlets' => Outlet::all()
        ]);
    }

    /**
     * Compare products across outlets.
     */
    public function comparison(Request $request): Response
    {
        $this->authorize('reports.view');

        $outlets = Outlet::all();
        $filters = [
            'view' => $request->get('view', 'side-by-side'),
            'outlet_a_id' => $request->get('outlet_a_id'),
            'outlet_b_id' => $request->get('outlet_b_id'),
        ];

        $comparisonData = $this->getComparisonData($filters, $outlets);

        return Inertia::render('Reports/Comparison', [
            'outlets' => $outlets,
            'data' => $comparisonData,
            'filters' => $filters
        ]);
    }

    /**
     * Export Comparison Report to Excel.
     */
    public function exportComparisonExcel(Request $request)
    {
        $this->authorize('reports.export');
        $outlets = Outlet::all();
        $filters = [
            'view' => $request->get('view', 'side-by-side'),
            'outlet_a_id' => $request->get('outlet_a_id'),
            'outlet_b_id' => $request->get('outlet_b_id'),
        ];

        $comparisonData = $this->getComparisonData($filters, $outlets);
        $outletA = $filters['outlet_a_id'] ? Outlet::find($filters['outlet_a_id']) : null;
        $outletB = $filters['outlet_b_id'] ? Outlet::find($filters['outlet_b_id']) : null;

        return Excel::download(new \App\Exports\ComparisonExport($comparisonData, $outlets, $filters, $outletA, $outletB), 'perbandingan_produk_' . now()->format('YmdHis') . '.xlsx');
    }

    /**
     * Export Comparison Report to PDF.
     */
    public function exportComparisonPdf(Request $request)
    {
        $this->authorize('reports.export');
        $outlets = Outlet::all();
        $filters = [
            'view' => $request->get('view', 'side-by-side'),
            'outlet_a_id' => $request->get('outlet_a_id'),
            'outlet_b_id' => $request->get('outlet_b_id'),
        ];

        $comparisonData = $this->getComparisonData($filters, $outlets);
        $outletA = $filters['outlet_a_id'] ? Outlet::find($filters['outlet_a_id']) : null;
        $outletB = $filters['outlet_b_id'] ? Outlet::find($filters['outlet_b_id']) : null;

        $pdf = Pdf::loadView('reports.comparison_pdf', [
            'data' => $comparisonData,
            'outlets' => $outlets,
            'filters' => $filters,
            'outletA' => $outletA,
            'outletB' => $outletB
        ])->setPaper('a4', 'landscape');

        return $pdf->download('perbandingan_produk_' . now()->format('YmdHis') . '.pdf');
    }

    private function getComparisonData($filters, $outlets)
    {
        $viewMode = $filters['view'];
        $outletAId = $filters['outlet_a_id'];
        $outletBId = $filters['outlet_b_id'];

        $comparisonData = [
            'only_in_a' => [],
            'only_in_b' => [],
            'mismatch' => [],
            'matrix' => [],
        ];

        // 1. Matrix View (All Outlets)
        if ($viewMode === 'matrix') {
            $products = Product::with(['variants', 'outletSettings'])->get();
            foreach ($products as $product) {
                $baseItems = [];
                if ($product->has_variants) {
                    foreach ($product->variants as $variant) {
                        $baseItems[] = [
                            'sku' => $variant->sku,
                            'name' => "{$product->name} - {$variant->name}",
                            'id' => $product->id,
                            'variant_id' => $variant->id,
                        ];
                    }
                } else {
                    $baseItems[] = [
                        'sku' => $product->sku,
                        'name' => $product->name,
                        'id' => $product->id,
                        'variant_id' => null,
                    ];
                }

                foreach ($baseItems as $item) {
                    $itemOutlets = [];
                    foreach ($outlets as $outlet) {
                        $setting = $product->outletSettings
                            ->where('outlet_id', $outlet->id)
                            ->where('product_variant_id', $item['variant_id'])
                            ->first();

                        $itemOutlets[$outlet->id] = [
                            'active' => $setting ? $setting->is_active : false,
                            'stock' => $setting ? $setting->stock : 0,
                            'price' => $setting ? (float)$setting->price : 0,
                        ];
                    }
                    $item['outlet_data'] = $itemOutlets;
                    $comparisonData['matrix'][] = $item;
                }
            }
        }

        // 2. Side-by-Side View (Targeted Comparison)
        if ($outletAId && $outletBId) {
            // Find all products that are active in at least one of the outlets
            $products = Product::with(['variants', 'outletSettings' => function ($q) use ($outletAId, $outletBId) {
                $q->whereIn('outlet_id', [$outletAId, $outletBId]);
            }])
                ->whereHas('outletSettings', function ($q) use ($outletAId, $outletBId) {
                    $q->whereIn('outlet_id', [$outletAId, $outletBId])->where('is_active', true);
                })
                ->get();

            foreach ($products as $product) {
                $itemsToCompare = [];
                if ($product->has_variants) {
                    foreach ($product->variants as $variant) {
                        $itemsToCompare[] = [
                            'id' => $product->id,
                            'variant_id' => $variant->id,
                            'name' => "{$product->name} - {$variant->name}",
                            'sku' => $variant->sku,
                        ];
                    }
                } else {
                    $itemsToCompare[] = [
                        'id' => $product->id,
                        'variant_id' => null,
                        'name' => $product->name,
                        'sku' => $product->sku,
                    ];
                }

                foreach ($itemsToCompare as $item) {
                    $settingA = $product->outletSettings
                        ->where('outlet_id', $outletAId)
                        ->where('product_variant_id', $item['variant_id'])
                        ->first();

                    $settingB = $product->outletSettings
                        ->where('outlet_id', $outletBId)
                        ->where('product_variant_id', $item['variant_id'])
                        ->first();

                    $isActiveA = $settingA && $settingA->is_active;
                    $isActiveB = $settingB && $settingB->is_active;

                    if ($isActiveA && !$isActiveB) {
                        $comparisonData['only_in_a'][] = [
                            'sku' => $item['sku'],
                            'name' => $item['name'],
                            'stock' => (int)$settingA->stock,
                            'price' => (float)$settingA->price,
                        ];
                    } elseif (!$isActiveA && $isActiveB) {
                        $comparisonData['only_in_b'][] = [
                            'sku' => $item['sku'],
                            'name' => $item['name'],
                            'stock' => (int)$settingB->stock,
                            'price' => (float)$settingB->price,
                        ];
                    } elseif ($isActiveA && $isActiveB) {
                        $diffPrice = (float)$settingA->price != (float)$settingB->price;
                        $diffStock = (int)$settingA->stock != (int)$settingB->stock;

                        if ($diffPrice || $diffStock) {
                            $comparisonData['mismatch'][] = [
                                'sku' => $item['sku'],
                                'name' => $item['name'],
                                'a' => [
                                    'stock' => (int)$settingA->stock,
                                    'price' => (float)$settingA->price,
                                ],
                                'b' => [
                                    'stock' => (int)$settingB->stock,
                                    'price' => (float)$settingB->price,
                                ],
                                'diff_price' => $diffPrice,
                                'diff_stock' => $diffStock,
                            ];
                        }
                    }
                }
            }
        }

        return $comparisonData;
    }

    private function getFilters(Request $request)
    {
        return [
            'date_from' => $request->get('date_from', now()->startOfMonth()->format('Y-m-d')),
            'date_to' => $request->get('date_to', now()->format('Y-m-d')),
            'outlet_id' => $request->get('outlet_id', Auth::user()->outlet_id ?? null)
        ];
    }
}
