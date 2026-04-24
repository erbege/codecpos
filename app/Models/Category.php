<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * PHASE 2 OPTIMIZATION - Get all categories dari cache
     * 
     * Cache duration: 1 jam (3600 detik)
     * Invalidate: Saat category diupdate/dihapus
     * Impact: Eliminate repeat category queries
     */
    public static function getAllCached()
    {
        return Cache::remember('categories_all', 3600, function () {
            return static::where('is_active', true)
                ->orderBy('name')
                ->get();
        });
    }

    /**
     * Get single category cached
     */
    public static function getByIdCached($id)
    {
        return Cache::remember("category_{$id}", 3600, function () use ($id) {
            return static::find($id);
        });
    }

    /**
     * Invalidate cache saat category diupdate/dihapus
     */
    protected static function booted()
    {
        static::saved(function () {
            Cache::forget('categories_all');
        });

        static::deleted(function ($category) {
            Cache::forget('categories_all');
            Cache::forget("category_{$category->id}");
        });
    }
}
