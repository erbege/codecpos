<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class OptimizeProductImage implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected string $imagePath
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $fullPath = Storage::disk('public')->path($this->imagePath);

        if (!file_exists($fullPath)) {
            return;
        }

        // Optimize image using Intervention Image
        // Resize to max 800px width/height while maintaining aspect ratio
        $image = Image::read($fullPath);
        
        $image->scale(width: 800, height: 800, upscale: false);
        
        // Save back with 80% quality
        $image->toJpeg(80)->save($fullPath);
    }
}
