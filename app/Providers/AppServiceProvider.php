<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL; // Tambahkan ini

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Paksa HTTPS jika di production (Cloudflare)
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        Vite::prefetch(concurrency: 3);
        
        // PHASE 5: Monitoring & Observability
        // Log slow queries (> 500ms in production, > 100ms in local)
        \Illuminate\Support\Facades\DB::listen(function ($query) {
            $threshold = config('app.env') === 'production' ? 500 : 100;
            
            if ($query->time > $threshold) {
                \Illuminate\Support\Facades\Log::warning('⚠️ SLOW QUERY DETECTED', [
                    'time' => $query->time . 'ms',
                    'sql' => $query->sql,
                    'bindings' => $query->bindings,
                    'url' => request()->fullUrl(),
                ]);
            }
        });
    }
}

