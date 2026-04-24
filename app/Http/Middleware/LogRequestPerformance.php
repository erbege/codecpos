<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogRequestPerformance
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);

        $response = $next($request);

        $duration = microtime(true) - $start;
        $ms = round($duration * 1000, 2);

        // Log if response takes more than 1 second (1000ms)
        if ($ms > 1000) {
            Log::info("⏱️ SLOW RESPONSE: {$request->method()} {$request->fullUrl()} - {$ms}ms");
        }

        return $response;
    }
}
