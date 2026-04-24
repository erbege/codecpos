<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Services\ProductService;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService,
    ) {}

    public function index(): Response
    {
        $this->authorize('products.read');

        $products = $this->productService->getProducts(request()->all());
        $categories = Category::getAllCached();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => request()->only(['search', 'category_id', 'is_active', 'low_stock']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('products.create');

        $categories = Category::getAllCached();

        return Inertia::render('Products/Create', [
            'categories' => $categories,
            'taxSettings' => [
                'tax_per_item' => filter_var(\App\Models\Setting::get('tax_per_item', 'false'), FILTER_VALIDATE_BOOLEAN),
                'tax_percentage' => (float)\App\Models\Setting::get('tax_percentage', 11),
            ]
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $this->productService->createProduct($request->validated());

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit(Product $product): Response
    {
        $this->authorize('products.update');

        $categories = Category::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Products/Edit', [
            'product' => $product->load('category', 'variants'),
            'categories' => $categories,
            'taxSettings' => [
                'tax_per_item' => filter_var(\App\Models\Setting::get('tax_per_item', 'false'), FILTER_VALIDATE_BOOLEAN),
                'tax_percentage' => (float)\App\Models\Setting::get('tax_percentage', 11),
            ]
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $this->productService->updateProduct($product, $request->validated());

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        $this->authorize('products.delete');

        $this->productService->deleteProduct($product);

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }
}
