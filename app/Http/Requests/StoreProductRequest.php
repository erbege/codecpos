<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('products.create');
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:50', 'unique:products,sku'],
            'barcode' => 'nullable|string|max:255|unique:products,barcode',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'margin' => 'required|numeric',
            'stock' => ['required', 'integer', 'min:0'],
            'min_stock' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:2048'],
            'is_active' => ['boolean'],
            'has_variants' => ['boolean'],
            'variants' => ['array', 'nullable'],
            'variants.*.name' => ['required_with:variants', 'string', 'max:255'],
            'variants.*.sku' => ['required_with:variants', 'string', 'max:50', 'distinct'],
            'variants.*.stock' => ['required_with:variants', 'integer', 'min:0'],
            'variants.*.price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.image' => ['nullable', 'image', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategori wajib dipilih.',
            'name.required' => 'Nama produk wajib diisi.',
            'sku.required' => 'SKU wajib diisi.',
            'sku.unique' => 'SKU sudah digunakan.',
            'barcode.unique' => 'Barcode sudah digunakan.',
            'price.required' => 'Harga jual wajib diisi.',
            'cost_price.required' => 'Harga beli wajib diisi.',
            'stock.required' => 'Stok wajib diisi.',
        ];
    }
}
