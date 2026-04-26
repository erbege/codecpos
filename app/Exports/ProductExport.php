<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class ProductExport extends DefaultValueBinder implements FromQuery, WithHeadings, WithMapping, WithColumnFormatting, WithCustomValueBinder
{
    use Exportable;

    protected $filters;
    protected $outletId;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->outletId = auth()->user()->outlet_id;
    }

    public function query()
    {
        return Product::query()
            ->with(['category', 'outletSettings' => function ($q) {
                $q->where('outlet_id', $this->outletId)->whereNull('product_variant_id');
            }])
            ->when($this->filters['category_id'] ?? null, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($this->filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->orderBy('name');
    }

    public function headings(): array
    {
        return [
            'SKU',
            'Barcode',
            'Nama Produk',
            'Kategori',
            'Harga Jual',
            'Harga Pokok',
            'Stok Saat Ini',
            'Min. Stok',
            'Status (Aktif: 1, Non-aktif: 0)',
        ];
    }

    /**
     * @param Product $product
     */
    public function map($product): array
    {
        $setting = $product->outletSettings->first();

        return [
            $product->sku,
            (string) $product->barcode,
            $product->name,
            $product->category?->name ?? '-',
            (float) ($setting->price ?? $product->price),
            (float) $product->cost_price,
            (int) ($setting->stock ?? 0),
            (int) ($setting->min_stock ?? $product->min_stock),
            $product->is_active ? 1 : 0,
        ];
    }

    public function columnFormats(): array
    {
        return [
            'B' => '@', // Barcode as Text
            'E' => '#,##0',
            'F' => '#,##0',
        ];
    }

    public function bindValue(Cell $cell, $value)
    {
        // Force barcode column (B) or any long numeric value to be string
        if ($cell->getColumn() === 'B' || (is_numeric($value) && strlen((string)$value) >= 12)) {
            $cell->setValueExplicit($value, DataType::TYPE_STRING);
            return true;
        }

        return parent::bindValue($cell, $value);
    }
}
