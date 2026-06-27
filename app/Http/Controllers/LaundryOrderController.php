<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\LaundryOrder;
use App\Models\LaundryOrderItem;
use App\Models\LaundryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaundryOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = LaundryOrder::with('items')->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->filled('date')) {
            $query->whereDate('drop_off_date', $request->date);
        }

        $orders = $query->paginate(20)->withQueryString();

        $summary = [
            'today'   => LaundryOrder::whereDate('drop_off_date', today())->count(),
            'pending' => LaundryOrder::whereIn('status', ['pending', 'in_progress'])->count(),
            'ready'   => LaundryOrder::where('status', 'ready')->count(),
        ];

        return Inertia::render('laundry/orders/index', [
            'orders'        => $orders,
            'filters'       => $request->only('status', 'date'),
            'status_labels' => LaundryOrder::$statusLabels,
            'services'      => LaundryService::where('is_active', true)->orderBy('name')->get(),
            'customers'     => Customer::where('is_active', true)->orderBy('name')->get(['id', 'name', 'phone', 'address']),
            'summary'       => $summary,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_name'  => 'required|string|max:255',
            'customer_id'    => 'nullable|exists:customers,id',
            'phone'          => 'nullable|string|max:20',
            'payment_method' => 'required|in:cash,gcash,card,unpaid',
            'drop_off_date'  => 'required|date',
            'pickup_date'    => 'nullable|date|after_or_equal:drop_off_date',
            'discount'       => 'nullable|numeric|min:0',
            'notes'          => 'nullable|string',
            'items'          => 'required|array|min:1',
            'items.*.service_name' => 'required|string',
            'items.*.service_type' => 'required|string',
            'items.*.unit_price'   => 'required|numeric|min:0',
            'items.*.quantity'     => 'required|numeric|min:0.01',
            'items.*.unit'         => 'required|string',
        ]);

        $subtotal = collect($validated['items'])->sum(fn ($i) => $i['unit_price'] * $i['quantity']);
        $discount = (float) ($validated['discount'] ?? 0);
        $total    = max(0, $subtotal - $discount);

        $order = LaundryOrder::create([
            'order_number'   => LaundryOrder::generateOrderNumber(),
            'customer_name'  => $validated['customer_name'],
            'customer_id'    => $validated['customer_id'] ?? null,
            'phone'          => $validated['phone'] ?? null,
            'status'         => 'pending',
            'payment_method' => $validated['payment_method'],
            'subtotal'       => $subtotal,
            'discount'       => $discount,
            'total_amount'   => $total,
            'amount_paid'    => 0,
            'change_amount'  => 0,
            'drop_off_date'  => $validated['drop_off_date'],
            'pickup_date'    => $validated['pickup_date'] ?? null,
            'notes'          => $validated['notes'] ?? null,
            'created_by'     => auth()->id(),
        ]);

        foreach ($validated['items'] as $item) {
            LaundryOrderItem::create([
                'laundry_order_id' => $order->id,
                'service_name'     => $item['service_name'],
                'service_type'     => $item['service_type'],
                'unit_price'       => $item['unit_price'],
                'quantity'         => $item['quantity'],
                'unit'             => $item['unit'],
                'subtotal'         => $item['unit_price'] * $item['quantity'],
            ]);
        }

        return back()->with('success', "Laundry order {$order->order_number} created.");
    }

    public function show(LaundryOrder $laundryOrder): Response
    {
        $laundryOrder->load(['items', 'creator']);

        return Inertia::render('laundry/orders/show', [
            'order' => [
                'id'             => $laundryOrder->id,
                'order_number'   => $laundryOrder->order_number,
                'customer_name'  => $laundryOrder->customer_name,
                'phone'          => $laundryOrder->phone,
                'status'         => $laundryOrder->status,
                'status_label'   => LaundryOrder::$statusLabels[$laundryOrder->status] ?? $laundryOrder->status,
                'payment_method' => $laundryOrder->payment_method,
                'subtotal'       => (float) $laundryOrder->subtotal,
                'discount'       => (float) $laundryOrder->discount,
                'total_amount'   => (float) $laundryOrder->total_amount,
                'amount_paid'    => (float) $laundryOrder->amount_paid,
                'change_amount'  => (float) $laundryOrder->change_amount,
                'drop_off_date'  => $laundryOrder->drop_off_date->format('M d, Y'),
                'pickup_date'    => $laundryOrder->pickup_date?->format('M d, Y'),
                'notes'          => $laundryOrder->notes,
                'created_by'     => $laundryOrder->creator?->name,
                'created_at'     => $laundryOrder->created_at->format('M d, Y h:i A'),
                'items'          => $laundryOrder->items->map(fn ($i) => [
                    'id'           => $i->id,
                    'service_name' => $i->service_name,
                    'service_type' => $i->service_type,
                    'unit_price'   => (float) $i->unit_price,
                    'quantity'     => (float) $i->quantity,
                    'unit'         => $i->unit,
                    'subtotal'     => (float) $i->subtotal,
                ]),
            ],
            'status_labels' => LaundryOrder::$statusLabels,
        ]);
    }

    public function updateStatus(Request $request, LaundryOrder $laundryOrder): RedirectResponse
    {
        $validated = $request->validate([
            'status'      => 'required|in:pending,in_progress,ready,completed,cancelled',
            'amount_paid' => 'nullable|numeric|min:0',
        ]);

        $amountPaid   = (float) ($validated['amount_paid'] ?? $laundryOrder->amount_paid);
        $changeAmount = max(0, $amountPaid - (float) $laundryOrder->total_amount);

        $laundryOrder->update([
            'status'        => $validated['status'],
            'amount_paid'   => $amountPaid,
            'change_amount' => $changeAmount,
            'pickup_date'   => $validated['status'] === 'completed'
                ? ($laundryOrder->pickup_date ?? today())
                : $laundryOrder->pickup_date,
        ]);

        return back()->with('success', 'Order status updated.');
    }

    public function destroy(LaundryOrder $laundryOrder): RedirectResponse
    {
        $laundryOrder->delete();
        return back()->with('success', 'Order deleted.');
    }
}
