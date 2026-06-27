<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Sale;
use App\Models\SaleItem;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = today();
        $monthStart = $today->copy()->startOfMonth();

        $todaySales = Sale::whereDate('sale_date', $today)->get();
        $todayRevenue = $todaySales->sum('total_amount');
        $todayExpenses = Expense::whereDate('date', $today)->sum('amount');

        $todayGallons = SaleItem::whereHas('sale', fn ($q) => $q->whereDate('sale_date', $today))
            ->whereIn('product_type', ['slim_wholesale', 'slim_regular', 'slim_commercial'])
            ->sum('quantity');

        $monthRevenue = Sale::whereBetween('sale_date', [$monthStart, $today])->sum('total_amount');
        $monthExpenses = Expense::whereBetween('date', [$monthStart, $today])->sum('amount');
        $monthGallons = SaleItem::whereHas('sale', fn ($q) => $q->whereBetween('sale_date', [$monthStart, $today]))
            ->whereIn('product_type', ['slim_wholesale', 'slim_regular', 'slim_commercial'])
            ->sum('quantity');

        $recentSales = Sale::with('items')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($sale) => [
                'id' => $sale->id,
                'sale_number' => $sale->sale_number,
                'customer_name' => $sale->customer_name,
                'sale_date' => $sale->sale_date->format('M d, Y'),
                'total_amount' => (float) $sale->total_amount,
                'payment_method' => $sale->payment_method,
                'total_gallons' => $sale->total_gallons,
            ]);

        $last7Days = collect(range(6, 0))->map(function ($daysAgo) {
            $date = today()->subDays($daysAgo);
            return [
                'date' => $date->format('M d'),
                'revenue' => (float) Sale::whereDate('sale_date', $date)->sum('total_amount'),
                'expenses' => (float) Expense::whereDate('date', $date)->sum('amount'),
            ];
        });

        return Inertia::render('dashboard', [
            'stats' => [
                'today_revenue' => (float) $todayRevenue,
                'today_transactions' => $todaySales->count(),
                'today_gallons' => (int) $todayGallons,
                'today_net_profit' => (float) ($todayRevenue - $todayExpenses),
                'month_revenue' => (float) $monthRevenue,
                'month_expenses' => (float) $monthExpenses,
                'month_net_profit' => (float) ($monthRevenue - $monthExpenses),
                'month_gallons' => (int) $monthGallons,
            ],
            'recent_sales' => $recentSales,
            'chart_data' => $last7Days,
        ]);
    }
}
