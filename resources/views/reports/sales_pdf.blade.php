<!DOCTYPE html>
<html>
<head>
    <title>Laporan Penjualan</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #4f46e5; text-transform: uppercase; font-size: 20px; }
        .header p { margin: 5px 0; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f3f4f6; color: #4b5563; text-transform: uppercase; font-size: 10px; padding: 10px; border: 1px solid #e5e7eb; }
        td { padding: 10px; border: 1px solid #e5e7eb; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: right; }
        .summary { margin-top: 30px; border-top: 2px solid #4f46e5; padding-top: 10px; }
        .summary-item { margin-bottom: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Penjualan</h1>
        <p>CODECPOS SYSTEM</p>
        <p>Periode: {{ $date_from }} s/d {{ $date_to }}</p>
        @if($outlet) <p>Outlet: {{ $outlet->name }}</p> @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Nama Produk</th>
                <th width="100">Jumlah Terjual</th>
                <th width="150" class="text-right">Total Pendapatan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $item)
            <tr>
                <td>{{ $item->product_name }}</td>
                <td class="text-center">{{ $item->total_qty }}</td>
                <td class="text-right">Rp {{ number_format($item->total_amount, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary">
        <div class="summary-item">Total Item Terjual: {{ $data->sum('total_qty') }}</div>
        <div class="summary-item">Total Pendapatan: Rp {{ number_format($data->sum('total_amount'), 0, ',', '.') }}</div>
    </div>

    <div class="footer">
        Dicetak pada: {{ now()->format('d/m/Y H:i:s') }}
    </div>
</body>
</html>
