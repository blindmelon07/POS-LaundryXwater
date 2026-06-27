<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Sale::with('items')->orderByDesc('sale_date')->orderByDesc('created_at');

        if ($request->filled('date')) {
            $query->whereDate('sale_date', $request->date);
        }
        if ($request->filled('month')) {
            $query->whereMonth('sale_date', date('m', strtotime($request->month)))
                ->whereYear('sale_date', date('Y', strtotime($request->month)));
        }
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $sales = $query->paginate(20)->through(fn ($sale) => [
            'id' => $sale->id,
            'sale_number' => $sale->sale_number,
            'customer_name' => $sale->customer_name,
            'sale_date' => $sale->sale_date->format('M d, Y'),
            'total_amount' => (float) $sale->total_amount,
            'payment_method' => $sale->payment_method,
            'total_gallons' => $sale->total_gallons,
            'items_count' => $sale->items->count(),
        ]);

        return Inertia::render('sales/index', [
            'sales' => $sales,
            'filters' => $request->only(['date', 'month', 'payment_method']),
        ]);
    }

    public function show(Sale $sale): Response
    {
        $sale->load('items', 'user');

        return Inertia::render('sales/show', [
            'sale' => [
                'id' => $sale->id,
                'sale_number' => $sale->sale_number,
                'customer_name' => $sale->customer_name,
                'sale_date' => $sale->sale_date->format('M d, Y'),
                'subtotal' => (float) $sale->subtotal,
                'discount' => (float) $sale->discount,
                'total_amount' => (float) $sale->total_amount,
                'payment_method' => $sale->payment_method,
                'amount_paid' => (float) $sale->amount_paid,
                'change_amount' => (float) $sale->change_amount,
                'notes' => $sale->notes,
                'created_by' => $sale->user?->name,
                'created_at' => $sale->created_at->format('M d, Y h:i A'),
                'items' => $sale->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'product_type' => $item->product_type,
                    'unit_price' => (float) $item->unit_price,
                    'quantity' => $item->quantity,
                    'containers_returned' => $item->containers_returned,
                    'subtotal' => (float) $item->subtotal,
                ]),
            ],
        ]);
    }

    public function destroy(Sale $sale): RedirectResponse
    {
        $sale->delete();
        return redirect()->route('sales.index')->with('success', 'Sale deleted successfully.');
    }
}
