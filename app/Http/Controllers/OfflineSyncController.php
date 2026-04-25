<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Services\SaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OfflineSyncController extends Controller
{
    public function __construct(
        protected SaleService $saleService,
    ) {}

    /**
     * Simple health-check endpoint for network status detection.
     * Returns 200 OK with minimal payload.
     */
    public function ping(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'time' => now()->toISOString(),
        ]);
    }

    /**
     * Sync a single pending offline transaction.
     * Accepts the same payload as the normal checkout.
     */
    public function syncTransaction(StoreSaleRequest $request): JsonResponse
    {
        $user = \Illuminate\Support\Facades\Auth::user();
        $isAdmin = $user->hasRole('admin') || $user->hasRole('super-admin') || $user->hasRole('owner');
        $outletId = $isAdmin
            ? (session('active_pos_outlet_id') ?: $user->outlet_id)
            : (int) $user->outlet_id;

        if (!$outletId) {
            return response()->json([
                'success' => false,
                'error' => 'Outlet belum dipilih.',
            ], 422);
        }

        $enableShiftManagement = filter_var(\App\Models\Setting::get('enable_shift_management', 'true'), FILTER_VALIDATE_BOOLEAN);

        $activeShift = \App\Models\Shift::where('user_id', $user->id)
            ->where('outlet_id', $outletId)
            ->where('status', 'open')
            ->first();

        if ($enableShiftManagement && !$activeShift) {
            return response()->json([
                'success' => false,
                'error' => 'Shift belum dibuka untuk outlet ini.',
            ], 422);
        }

        try {
            $data = $request->validated();
            $data['outlet_id'] = $outletId;

            $sale = $this->saleService->createSale($data);

            Log::info('Offline transaction synced successfully', [
                'invoice' => $sale->invoice_number,
                'pending_id' => $request->input('pending_id'),
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => true,
                'invoice_number' => $sale->invoice_number,
                'sale' => $sale->load('items.product', 'items.productVariant', 'user', 'customer'),
            ]);
        } catch (\Exception $e) {
            Log::warning('Offline transaction sync failed', [
                'pending_id' => $request->input('pending_id'),
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }
}
