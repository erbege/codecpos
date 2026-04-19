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
        $totalStockValue = Product::whereHas('outletSettings', function($q) use ($outletId) {
            if ($outletId) $q->where('outlet_id', $outletId);
        })->get()->sum(function($p) {
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
        $salesByProduct = SaleItem::whereHas('sale', function($q) use ($outletId, $dateFrom, $dateTo) {
                $q->where('status', 'completed')
                  ->when($outletId, fn($sq) => $sq->where('outlet_id', $outletId))
                  ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59']);
            })
            ->select('product_name', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as total_amount'))
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->get();

        // 2. Sales by Category
        $salesByCategory = SaleItem::whereHas('sale', function($q) use ($outletId, $dateFrom, $dateTo) {
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

        // Current Stock
        $currentStock = Product::with('category')
            ->whereHas('outletSettings', function($q) use ($outletId) {
                if ($outletId) $q->where('outlet_id', $outletId);
            })
            ->get()
            ->map(function($p) {
                return [
                    'id' => $p->id,
                    'sku' => $p->sku,
                    'name' => $p->name,
                    'category' => $p->category->name ?? 'N/A',
                    'stock' => $p->stock,
                    'min_stock' => $p->min_stock,
                    'value' => $p->stock * ($p->cost_price ?? 0)
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
        $salesItems = SaleItem::whereHas('sale', function($q) use ($outletId, $dateFrom, $dateTo) {
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
     * Export Sales Report to Excel.
     */
    public function exportSalesExcel(Request $request)
    {
        $this->authorize('reports.export');
        $filters = $this->getFilters($request);
        $outletId = $filters['outlet_id'];
        
        $data = SaleItem::whereHas('sale', function($q) use ($filters, $outletId) {
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

        $data = SaleItem::whereHas('sale', function($q) use ($filters, $outletId) {
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

    private function getFilters(Request $request)
    {
        return [
            'date_from' => $request->get('date_from', now()->startOfMonth()->format('Y-m-d')),
            'date_to' => $request->get('date_to', now()->format('Y-m-d')),
            'outlet_id' => $request->get('outlet_id', Auth::user()->outlet_id ?? null)
        ];
    }
}
