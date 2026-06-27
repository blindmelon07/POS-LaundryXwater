<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

class ExportController extends Controller
{
    public function salesCsv(Request $request): HttpResponse
    {
        $query = Sale::with('items')->orderByDesc('sale_date');

        if ($request->filled('month')) {
            $query->whereMonth('sale_date', date('m', strtotime($request->month)))
                ->whereYear('sale_date', date('Y', strtotime($request->month)));
        }

        $sales = $query->get();

        $rows = [['Sale #', 'Date', 'Customer', 'Payment', 'Gallons', 'Subtotal', 'Discount', 'Total']];
        foreach ($sales as $s) {
            $rows[] = [
                $s->sale_number,
                $s->sale_date->format('Y-m-d'),
                $s->customer_name ?? 'Walk-in',
                $s->payment_method,
                $s->total_gallons,
                $s->subtotal,
                $s->discount,
                $s->total_amount,
            ];
        }

        return $this->csvResponse($rows, 'sales-' . now()->format('Y-m-d') . '.csv');
    }

    public function expensesCsv(Request $request): HttpResponse
    {
        $query = Expense::orderByDesc('date');

        if ($request->filled('month')) {
            $query->whereMonth('date', date('m', strtotime($request->month)))
                ->whereYear('date', date('Y', strtotime($request->month)));
        }

        $expenses = $query->get();

        $rows = [['Date', 'Description', 'Category', 'Amount', 'Receipt #', 'Notes']];
        foreach ($expenses as $e) {
            $rows[] = [
                $e->date->format('Y-m-d'),
                $e->description,
                $e->category_label,
                $e->amount,
                $e->receipt_number ?? '',
                $e->notes ?? '',
            ];
        }

        return $this->csvResponse($rows, 'expenses-' . now()->format('Y-m-d') . '.csv');
    }

    public function reportCsv(Request $request): HttpResponse
    {
        $year = (int) $request->get('year', now()->year);

        $rows = [['Month', 'Revenue (Ã¢â€šÂ±)', 'Expenses (Ã¢â€šÂ±)', 'Gross Profit (Ã¢â€šÂ±)', 'Margin %', 'Gallons Sold', 'Transactions']];

        for ($m = 1; $m <= 12; $m++) {
            $start = \Carbon\Carbon::create($year, $m, 1)->startOfMonth();
            $end = $start->copy()->endOfMonth();
            $revenue = (float) Sale::whereBetween('sale_date', [$start, $end])->sum('total_amount');
            $expenses = (float) Expense::whereBetween('date', [$start, $end])->sum('amount');
            $profit = $revenue - $expenses;
            $margin = $revenue > 0 ? round(($profit / $revenue) * 100, 1) : 0;
            $gallons = (int) SaleItem::whereHas('sale', fn ($q) => $q->whereBetween('sale_date', [$start, $end]))
                ->whereIn('product_type', ['slim_wholesale', 'slim_regular', 'slim_commercial'])
                ->sum('quantity');
            $txn = Sale::whereBetween('sale_date', [$start, $end])->count();

            $rows[] = [$start->format('F'), $revenue, $expenses, $profit, $margin . '%', $gallons, $txn];
        }

        return $this->csvResponse($rows, "report-{$year}.csv");
    }

    private function csvResponse(array $rows, string $filename): HttpResponse
    {
        $output = '';
        foreach ($rows as $row) {
            $output .= implode(',', array_map(fn ($v) => '"' . str_replace('"', '""', $v) . '"', $row)) . "\n";
        }

        return response($output, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
