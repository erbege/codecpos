<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Shift extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'outlet_id',
        'start_time',
        'end_time',
        'starting_cash',
        'actual_ending_cash',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'starting_cash' => 'decimal:2',
        'actual_ending_cash' => 'decimal:2',
    ];

    /**
     * Get the user that owns the shift.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    /**
     * Get the sales associated with the shift.
     * Assuming a sale gets tagged with the shift, but currently Sales belong to User and we'll filter by time, 
     * OR we can add shift_id to sales table. For now, we fetch by time if shift_id doesn't exist.
     */
    public function getExpectedEndingCashAttribute()
    {
        // OPTIMIZED: Cache the result for 5 minutes to avoid repeated queries
        // Invalidate on shift update or when new sales are created
        $cacheKey = "shift_{$this->id}_expected_ending_cash";

        return Cache::remember($cacheKey, 300, function () {
            return $this->calculateExpectedCash();
        });
    }

    /**
     * Calculate the expected ending cash amount for this shift
     * 
     * Logic: Expected Ending Cash = Starting Cash + Total Cash Sales During Shift
     */
    public function calculateExpectedCash()
    {
        $salesQuery = Sale::where('user_id', $this->user_id)
            ->where('payment_method', 'cash')
            ->where('status', 'completed')
            ->where('created_at', '>=', $this->start_time);

        if ($this->end_time) {
            $salesQuery->where('created_at', '<=', $this->end_time);
        }

        $cashSalesTotal = $salesQuery->sum('total');

        return $this->starting_cash + $cashSalesTotal;
    }

    /**
     * Clear the cached expected ending cash when shift is updated
     */
    protected static function booted()
    {
        static::updated(function ($shift) {
            Cache::forget("shift_{$shift->id}_expected_ending_cash");
        });
    }
}
