<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePromotionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('promotions.create') || $this->user()->can('promotions.update');
    }

    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', 'unique:promotions,code'],
            'description' => ['nullable', 'string', 'max:1000'],

            'scope' => ['required', 'in:product,global'],
            'discount_type' => ['required', 'in:percentage,fixed'],
            'discount_value' => ['required', 'numeric', 'min:0.01'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],

            'min_purchase' => ['nullable', 'numeric', 'min:0'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],

            'max_usage' => ['nullable', 'integer', 'min:1'],
            'priority' => ['nullable', 'integer', 'min:0'],

            // Product items (required when scope=product)
            'items' => ['required_if:scope,product', 'array'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.product_variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.max_qty' => ['nullable', 'integer', 'min:1'],

            // Outlet selection
            'apply_all_outlets' => ['required', 'boolean'],
            'outlet_ids' => ['required_unless:apply_all_outlets,true', 'array'],
            'outlet_ids.*' => ['exists:outlets,id'],
        ];

        // For update, allow same code
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $promotion = $this->route('promotion');
            $promotionId = is_object($promotion) ? $promotion->id : $promotion;
            
            $rules['code'] = [
                'nullable', 
                'string', 
                'max:50', 
                \Illuminate\Validation\Rule::unique('promotions', 'code')->ignore($promotionId)
            ];
        }

        // Percentage cannot exceed 100
        if ($this->input('discount_type') === 'percentage') {
            $rules['discount_value'] = ['required', 'numeric', 'min:0.01', 'max:100'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama promo wajib diisi.',
            'scope.required' => 'Tipe scope promo wajib dipilih.',
            'discount_value.required' => 'Nilai diskon wajib diisi.',
            'discount_value.max' => 'Persentase diskon tidak boleh lebih dari 100%.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'end_date.required' => 'Tanggal berakhir wajib diisi.',
            'end_date.after' => 'Tanggal berakhir harus setelah tanggal mulai.',
            'items.required_if' => 'Minimal 1 produk harus dipilih untuk promo bertipe produk.',
            'outlet_ids.required_unless' => 'Pilih minimal 1 outlet jika tidak berlaku untuk semua outlet.',
        ];
    }
}
