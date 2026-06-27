<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $year = (int) $request->get('year', now()->year);

        $months = collect(range(1, 12))->map(function ($month) use ($year) {
            $start = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
            $end = $start->copy()->endOfMonth();
            $label = $start->format('M');

            $revenue = (float) Sale::whereBetween('sale_date', [$start, $end])->sum('total_amount');
            $expenses = (float) Expense::whereBetween('date', [$start, $end])->sum('amount');
            $grossProfit = $revenue - $expenses;
            $margin = $revenue > 0 ? round(($grossProfit / $revenue) * 100, 1) : 0;

            $gallons = (int) SaleItem::whereHas('sale', fn ($q) => $q->whereBetween('sale_date', [$start, $end]))
                ->whereIn('product_type', ['slim_wholesale', 'slim_regular', 'slim_commercial'])
                ->sum('quantity');

            $transactions = Sale::whereBetween('sale_date', [$start, $end])->count();

            return [
                'month' => $label,
                'month_num' => $month,
                'revenue' => $revenue,
                'expenses' => $expenses,
                'gross_profit' => $grossProfit,
                'margin' => $margin,
                'gallons' => $gallons,
                'transactions' => $transactions,
            ];
        });

        $yearRevenue = $months->sum('revenue');
        $yearExpenses = $months->sum('expenses');
        $yearProfit = $yearRevenue - $yearExpenses;
        $yearGallons = $months->sum('gallons');
        $yearMargin = $yearRevenue > 0 ? round(($yearProfit / $yearRevenue) * 100, 1) : 0;

        $availableYears = Sale::selectRaw('YEAR(sale_date) as year')
            ->groupBy('year')
            ->orderByDesc('year')
            ->pluck('year')
            ->toArray();

        if (!in_array($year, $availableYears)) {
            $availableYears[] = now()->year;
            sort($availableYears);
            $availableYears = array_unique($availableYears);
        }

        return Inertia::render('reports/index', [
            'months' => $months,
            'year' => $year,
            'available_years' => array_values($availableYears),
            'totals' => [
                'revenue' => $yearRevenue,
                'expenses' => $yearExpenses,
                'profit' => $yearProfit,
                'gallons' => $yearGallons,
                'margin' => $yearMargin,
            ],
        ]);
    }
}
