<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ComparisonExport implements FromView, ShouldAutoSize, WithStyles
{
    protected $data;
    protected $outlets;
    protected $filters;
    protected $outletA;
    protected $outletB;

    public function __construct($data, $outlets, $filters, $outletA, $outletB)
    {
        $this->data = $data;
        $this->outlets = $outlets;
        $this->filters = $filters;
        $this->outletA = $outletA;
        $this->outletB = $outletB;
    }

    public function view(): View
    {
        return view('reports.comparison_pdf', [
            'data' => $this->data,
            'outlets' => $this->outlets,
            'filters' => $this->filters,
            'outletA' => $this->outletA,
            'outletB' => $this->outletB,
            'is_excel' => true,
        ]);
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            2 => ['font' => ['italic' => true]],
        ];
    }
}
