<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Category;
use App\Services\ProductService;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductImport implements ToCollection, WithHeadingRow, WithValidation
{
    protected $productService;
    protected $results = [
        'success' => 0,
        'updated' => 0,
        'failed' => 0,
        'errors' => []
    ];

    public function __construct()
    {
        $this->productService = app(ProductService::class);
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            try {
                DB::transaction(function () use ($row) {
                    $categoryName = $row['kategori'] ?? 'Umum';
                    $category = Category::firstOrCreate(
                        ['name' => $categoryName],
                        ['slug' => Str::slug($categoryName), 'is_active' => true]
                    );

                    $barcode = $row['barcode'] ?? null;
                    // Handle scientific notation from Excel
                    if (is_numeric($barcode)) {
                        $barcode = number_format((float)$barcode, 0, '', '');
                    }

                    $productData = [
                        'category_id' => $category->id,
                        'name' => $row['nama_produk'],
                        'sku' => $row['sku'],
                        'barcode' => $barcode,
                        'price' => (float) ($row['harga_jual'] ?? 0),
                        'cost_price' => (float) ($row['harga_pokok'] ?? 0),
                        'stock' => (float) ($row['stok_saat_ini'] ?? 0),
                        'min_stock' => (float) ($row['min_stok'] ?? 0),
                        'is_active' => (bool) ($row['status_aktif_1_non_aktif_0'] ?? true),
                        'has_variants' => false,
                    ];

                    $existingProduct = Product::where('sku', $row['sku'])->first();

                    if ($existingProduct) {
                        $this->productService->updateProduct($existingProduct, $productData);
                        $this->results['updated']++;
                    } else {
                        $this->productService->createProduct($productData);
                        $this->results['success']++;
                    }
                });
            } catch (\Exception $e) {
                $this->results['failed']++;
                $this->results['errors'][] = "Baris " . ($index + 2) . ": " . $e->getMessage();
            }
        }
    }

    public function rules(): array
    {
        return [
            'sku' => 'required',
            'nama_produk' => 'required',
            'harga_jual' => 'required|numeric',
            'kategori' => 'nullable',
        ];
    }

    public function getResults(): array
    {
        return $this->results;
    }
}
