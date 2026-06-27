<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZReportController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->get('date', today()->toDateString());
        $carbonDate = \Carbon\Carbon::parse($date);

        $sales = Sale::with('items')->whereDate('sale_date', $carbonDate)->get();

        $byPayment = $sales->groupBy('payment_method')->map(fn ($g) => [
            'count' => $g->count(),
            'total' => (float) $g->sum('total_amount'),
        ]);

        $gallonsByType = SaleItem::whereHas('sale', fn ($q) => $q->whereDate('sale_date', $carbonDate))
            ->whereIn('product_type', ['slim_wholesale', 'slim_regular', 'slim_commercial'])
            ->get()
            ->groupBy('product_type')
            ->map(fn ($g) => (int) $g->sum('quantity'));

        $expenses = Expense::whereDate('date', $carbonDate)
            ->get()
            ->groupBy('category')
            ->map(fn ($g) => [
                'label' => \App\Models\Expense::categoryLabels()[$g->first()->category] ?? $g->first()->category,
                'total' => (float) $g->sum('amount'),
            ]);

        $totalRevenue = (float) $sales->sum('total_amount');
        $totalExpenses = (float) Expense::whereDate('date', $carbonDate)->sum('amount');
        $totalGallons = (int) SaleItem::whereHas('sale', fn ($q) => $q->whereDate('sale_date', $carbonDate))
            ->whereIn('product_type', ['slim_wholesale', 'slim_regular', 'slim_commercial'])
            ->sum('quantity');

        return Inertia::render('z-report/index', [
            'date' => $carbonDate->format('F d, Y'),
            'date_value' => $date,
            'business' => [
                'name' => Setting::get('business_name', 'Jaz Pure Water Refilling Station'),
                'address' => Setting::get('business_address', ''),
                'phone' => Setting::get('business_phone', ''),
            ],
            'summary' => [
                'total_transactions' => $sales->count(),
                'total_revenue' => $totalRevenue,
                'total_discount' => (float) $sales->sum('discount'),
                'total_expenses' => $totalExpenses,
                'net_profit' => $totalRevenue - $totalExpenses,
                'total_gallons' => $totalGallons,
            ],
            'by_payment' => $byPayment,
            'gallons_by_type' => $gallonsByType,
            'expenses' => $expenses->values(),
            'transactions' => $sales->map(fn ($s) => [
                'sale_number' => $s->sale_number,
                'customer_name' => $s->customer_name ?? 'Walk-in',
                'total_amount' => (float) $s->total_amount,
                'payment_method' => $s->payment_method,
                'time' => $s->created_at->format('h:i A'),
            ]),
        ]);
    }
}
