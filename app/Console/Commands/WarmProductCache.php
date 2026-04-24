<?php

namespace App\Console\Commands;

use App\Services\ProductService;
use Illuminate\Console\Command;

class WarmProductCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:warm-products';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Warm up product cache for all active outlets';

    /**
     * Execute the console command.
     */
    public function handle(ProductService $productService)
    {
        $this->info('🔥 Starting product cache warming...');
        
        $start = microtime(true);
        $productService->warmProductsCache();
        $end = microtime(true);
        
        $time = round($end - $start, 2);
        
        $this->info("✅ Product cache warmed successfully in {$time} seconds.");
        return Command::SUCCESS;
    }
}
