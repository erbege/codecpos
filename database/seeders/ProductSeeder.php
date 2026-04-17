<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Sepeda', 'slug' => 'sepeda', 'description' => 'Sepeda utuh (MTB, Road, BMX, dll.)'],
            ['name' => 'Frame & Fork', 'slug' => 'frame-fork', 'description' => 'Rangka dan garpu sepeda'],
            ['name' => 'Ban & Velg', 'slug' => 'ban-velg', 'description' => 'Ban, ban dalam, dan velg sepeda'],
            ['name' => 'Drivetrain', 'slug' => 'drivetrain', 'description' => 'Rantai, gear, pedal, crank, dll.'],
            ['name' => 'Rem', 'slug' => 'rem', 'description' => 'Brake set, kampas rem, kabel rem'],
            ['name' => 'Handlebar & Stem', 'slug' => 'handlebar-stem', 'description' => 'Stang, stem, dan grip'],
            ['name' => 'Sadel & Seatpost', 'slug' => 'sadel-seatpost', 'description' => 'Jok dan tiang dudukan'],
            ['name' => 'Aksesoris', 'slug' => 'aksesoris', 'description' => 'Lampu, botol, bell, rack, fender, dll.'],
            ['name' => 'Perlengkapan', 'slug' => 'perlengkapan', 'description' => 'Helm, sarung tangan, kunci, tools'],
            ['name' => 'Lainnya', 'slug' => 'lainnya', 'description' => 'Produk lain-lain'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        // Sample products
        $products = [
            ['category_id' => 1, 'name' => 'Polygon Xtrada 5 2026', 'sku' => 'BK-POL-XT5-26', 'barcode' => '8991234000001', 'price' => 6500000, 'cost_price' => 5200000, 'stock' => 5, 'min_stock' => 2],
            ['category_id' => 1, 'name' => 'Pacific Crosser XT 001', 'sku' => 'BK-PAC-CX01', 'barcode' => '8991234000002', 'price' => 3200000, 'cost_price' => 2500000, 'stock' => 3, 'min_stock' => 1],
            ['category_id' => 1, 'name' => 'United Detroit 1.0', 'sku' => 'BK-UNI-DT10', 'barcode' => '8991234000003', 'price' => 4800000, 'cost_price' => 3800000, 'stock' => 4, 'min_stock' => 1],
            ['category_id' => 3, 'name' => 'Ban Maxxis Crossmark 26x2.1', 'sku' => 'TI-MAX-CM2621', 'barcode' => '8991234000010', 'price' => 285000, 'cost_price' => 200000, 'stock' => 20, 'min_stock' => 5],
            ['category_id' => 3, 'name' => 'Ban Dalam Kenda 26"', 'sku' => 'TI-KND-IN26', 'barcode' => '8991234000011', 'price' => 45000, 'cost_price' => 25000, 'stock' => 50, 'min_stock' => 10],
            ['category_id' => 3, 'name' => 'Velg Araya TM-19 26"', 'sku' => 'RM-ARY-TM19', 'barcode' => '8991234000012', 'price' => 175000, 'cost_price' => 120000, 'stock' => 15, 'min_stock' => 5],
            ['category_id' => 4, 'name' => 'Rantai Shimano HG71 8sp', 'sku' => 'DR-SH-HG71-8', 'barcode' => '8991234000020', 'price' => 165000, 'cost_price' => 110000, 'stock' => 25, 'min_stock' => 8],
            ['category_id' => 4, 'name' => 'Pedal VP-196 MTB', 'sku' => 'DR-VP-196', 'barcode' => '8991234000021', 'price' => 95000, 'cost_price' => 55000, 'stock' => 30, 'min_stock' => 5],
            ['category_id' => 5, 'name' => 'Brake Set Shimano MT200', 'sku' => 'BR-SH-MT200', 'barcode' => '8991234000030', 'price' => 550000, 'cost_price' => 380000, 'stock' => 10, 'min_stock' => 3],
            ['category_id' => 5, 'name' => 'Kampas Rem Tektro', 'sku' => 'BR-TK-PAD01', 'barcode' => '8991234000031', 'price' => 35000, 'cost_price' => 18000, 'stock' => 40, 'min_stock' => 10],
            ['category_id' => 8, 'name' => 'Lampu Depan USB Rechargeable', 'sku' => 'AC-LMP-FR01', 'barcode' => '8991234000040', 'price' => 85000, 'cost_price' => 45000, 'stock' => 20, 'min_stock' => 5],
            ['category_id' => 8, 'name' => 'Botol Minum Polygon 750ml', 'sku' => 'AC-BTL-POL75', 'barcode' => '8991234000041', 'price' => 65000, 'cost_price' => 35000, 'stock' => 25, 'min_stock' => 5],
            ['category_id' => 9, 'name' => 'Helm MXL Matt Black', 'sku' => 'EQ-HLM-MXL01', 'barcode' => '8991234000050', 'price' => 250000, 'cost_price' => 160000, 'stock' => 12, 'min_stock' => 3],
            ['category_id' => 9, 'name' => 'Sarung Tangan Half Finger', 'sku' => 'EQ-GLV-HF01', 'barcode' => '8991234000051', 'price' => 75000, 'cost_price' => 40000, 'stock' => 18, 'min_stock' => 5],
            ['category_id' => 6, 'name' => 'Handlebar Uno 31.8 720mm', 'sku' => 'HB-UNO-318720', 'barcode' => '8991234000060', 'price' => 145000, 'cost_price' => 85000, 'stock' => 10, 'min_stock' => 3],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
