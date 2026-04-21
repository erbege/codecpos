<!DOCTYPE html>
<html>
<head>
    <title>Laporan Perbandingan Produk</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #333; margin: 0; padding: 0; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #4f46e5; text-transform: uppercase; font-size: 18px; }
        .header p { margin: 3px 0; color: #666; font-weight: bold; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
        th { background-color: #f8fafc; color: #475569; text-transform: uppercase; font-size: 9px; padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; }
        td { padding: 8px; border: 1px solid #cbd5e1; word-wrap: break-word; }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .text-indigo { color: #4f46e5; }
        .text-rose { color: #e11d48; }
        .text-amber { color: #d97706; }
        .bg-gray { background-color: #f1f5f9; }
        
        .badge { display: inline-block; padding: 2px 5px; border-radius: 4px; font-size: 8px; font-weight: bold; text-transform: uppercase; border: 1px solid #ccc; }
        
        .footer { margin-top: 30px; font-size: 9px; color: #64748b; text-align: right; }
        
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Perbandingan Produk</h1>
        <p>CODECPOS SYSTEM</p>
        <p>Mode: {{ $filters['view'] === 'matrix' ? 'Global Matrix (Seluruh Outlet)' : 'Perbandingan Spesifik (Side-by-Side)' }}</p>
        @if($filters['view'] === 'side-by-side' && $outletA && $outletB)
            <p>Membandingkan: {{ $outletA->name }} VS {{ $outletB->name }}</p>
        @endif
    </div>

    @if($filters['view'] === 'matrix')
        <table>
            <thead>
                <tr>
                    <th width="80">SKU</th>
                    <th width="200">Nama Produk</th>
                    @foreach($outlets as $outlet)
                        <th>{{ $outlet->name }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach($data['matrix'] as $item)
                <tr>
                    <td class="font-bold text-indigo">{{ $item['sku'] }}</td>
                    <td>{{ $item['name'] }}</td>
                    @foreach($outlets as $outlet)
                        @php $od = $item['outlet_data'][$outlet->id]; @endphp
                        <td class="text-center">
                            @if($od['active'])
                                <div class="font-bold {{ $od['stock'] == 0 ? 'text-rose' : '' }}">
                                    {{ $od['stock'] }} PCS
                                </div>
                                <div style="font-size: 8px; color: #666;">
                                    Rp {{ number_format($od['price'], 0, ',', '.') }}
                                </div>
                            @else
                                <span style="color: #ccc;">-</span>
                            @endif
                        </td>
                    @endforeach
                </tr>
                @endforeach
            </tbody>
        </table>
    @else
        {{-- Side by Side View --}}
        @if(count($data['mismatch']) > 0)
            <p style="margin-top: 20px; font-weight: bold; color: #e11d48;">1. Produk dengan Perbedaan Data (Stok / Harga)</p>
            <table>
                <thead>
                    <tr>
                        <th width="80">SKU</th>
                        <th width="150">Nama Produk</th>
                        <th>{{ $outletA->name }}</th>
                        <th>{{ $outletB->name }}</th>
                        <th width="100">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['mismatch'] as $item)
                    <tr>
                        <td class="font-bold text-indigo">{{ $item['sku'] }}</td>
                        <td>{{ $item['name'] }}</td>
                        <td class="text-center">
                            <span class="{{ $item['diff_stock'] ? 'font-bold text-amber' : '' }}">Stok: {{ $item['a']['stock'] }}</span><br>
                            <span class="{{ $item['diff_price'] ? 'font-bold text-rose' : '' }}">Rp {{ number_format($item['a']['price'], 0, ',', '.') }}</span>
                        </td>
                        <td class="text-center">
                            <span class="{{ $item['diff_stock'] ? 'font-bold text-amber' : '' }}">Stok: {{ $item['b']['stock'] }}</span><br>
                            <span class="{{ $item['diff_price'] ? 'font-bold text-rose' : '' }}">Rp {{ number_format($item['b']['price'], 0, ',', '.') }}</span>
                        </td>
                        <td class="text-center">
                            @if($item['diff_price']) <span class="badge">Beda Harga</span><br> @endif
                            @if($item['diff_stock']) <span class="badge">Selisih Stok</span> @endif
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @endif

        @if(count($data['only_in_a']) > 0)
            <p style="margin-top: 20px; font-weight: bold;">2. Produk Hanya Tersedia di {{ $outletA->name }}</p>
            <table>
                <thead>
                    <tr>
                        <th width="80">SKU</th>
                        <th width="250">Nama Produk</th>
                        <th width="100" class="text-center">Stok</th>
                        <th width="150" class="text-right">Harga</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['only_in_a'] as $item)
                    <tr>
                        <td class="font-bold text-indigo">{{ $item['sku'] }}</td>
                        <td>{{ $item['name'] }}</td>
                        <td class="text-center font-bold">{{ $item['stock'] }}</td>
                        <td class="text-right">Rp {{ number_format($item['price'], 0, ',', '.') }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @endif

        @if(count($data['only_in_b']) > 0)
            <p style="margin-top: 20px; font-weight: bold;">3. Produk Hanya Tersedia di {{ $outletB->name }}</p>
            <table>
                <thead>
                    <tr>
                        <th width="80">SKU</th>
                        <th width="250">Nama Produk</th>
                        <th width="100" class="text-center">Stok</th>
                        <th width="150" class="text-right">Harga</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['only_in_b'] as $item)
                    <tr>
                        <td class="font-bold text-indigo">{{ $item['sku'] }}</td>
                        <td>{{ $item['name'] }}</td>
                        <td class="text-center font-bold">{{ $item['stock'] }}</td>
                        <td class="text-right">Rp {{ number_format($item['price'], 0, ',', '.') }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    @endif

    <div class="footer">
        Dicetak pada: {{ now()->format('d/m/Y H:i:s') }} oleh CODECPOS
    </div>
</body>
</html>
