<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\DeliveryOrder;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = DeliveryOrder::with('customer')->orderByDesc('scheduled_date')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('date')) {
            $query->whereDate('scheduled_date', $request->date);
        }

        $orders = $query->paginate(20)->through(fn ($o) => [
            'id' => $o->id,
            'order_number' => $o->order_number,
            'customer_name' => $o->customer_name,
            'address' => $o->address,
            'phone' => $o->phone,
            'scheduled_date' => $o->scheduled_date->format('M d, Y'),
            'scheduled_time' => $o->scheduled_time,
            'status' => $o->status,
            'status_label' => DeliveryOrder::statusLabels()[$o->status],
            'total_amount' => (float) $o->total_amount,
            'payment_method' => $o->payment_method,
        ]);

        $todayCount = DeliveryOrder::whereDate('scheduled_date', today())->count();
        $pendingCount = DeliveryOrder::where('status', 'pending')->count();

        return Inertia::render('deliveries/index', [
            'orders'           => $orders,
            'filters'          => $request->only(['status', 'date']),
            'status_labels'    => DeliveryOrder::statusLabels(),
            'customers'        => Customer::active()->orderBy('name')->get(['id', 'name', 'phone', 'address', 'type']),
            'products'         => Product::active()->orderBy('type')->get(['id', 'name', 'type', 'price', 'unit']),
            'summary'          => [
                'today'   => $todayCount,
                'pending' => $pendingCount,
            ],
            'can_manage' => auth()->user()?->can('manage deliveries') ?? false,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'customer_name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'phone' => 'nullable|string|max:50',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'nullable|string',
            'payment_method' => 'required|in:cash,gcash,card,unpaid,paid',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $items = [];
        $total = 0;

        foreach ($validated['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);
            $subtotal = $product->price * $item['quantity'];
            $total += $subtotal;
            $items[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_type' => $product->type,
                'unit_price' => $product->price,
                'quantity' => $item['quantity'],
                'subtotal' => $subtotal,
            ];
        }

        $order = DeliveryOrder::create([
            'order_number' => DeliveryOrder::generateOrderNumber(),
            'customer_id' => $validated['customer_id'] ?? null,
            'customer_name' => $validated['customer_name'],
            'address' => $validated['address'],
            'phone' => $validated['phone'] ?? null,
            'scheduled_date' => $validated['scheduled_date'],
            'scheduled_time' => $validated['scheduled_time'] ?? null,
            'status' => 'pending',
            'total_amount' => $total,
            'amount_paid' => 0,
            'payment_method' => $validated['payment_method'],
            'notes' => $validated['notes'] ?? null,
            'user_id' => auth()->id(),
        ]);

        foreach ($items as $item) {
            $order->items()->create($item);
        }

        return back()->with('success', "Delivery {$order->order_number} scheduled.");
    }

    public function updateStatus(Request $request, DeliveryOrder $deliveryOrder): RedirectResponse
    {
        $validated = $request->validate([
            'status'      => 'required|in:pending,out_for_delivery,delivered,cancelled',
            'amount_paid' => 'nullable|numeric|min:0',
        ]);

        $data = ['status' => $validated['status']];

        if ($validated['status'] === 'delivered') {
            $data['delivered_at'] = now();
            $amountPaid = (float) ($validated['amount_paid'] ?? $deliveryOrder->total_amount);
            $data['amount_paid'] = $amountPaid;

            // Auto-create a POS sale if not already linked and payment was made
            if (!$deliveryOrder->sale_id && $amountPaid > 0) {
                $deliveryOrder->load('items');

                $sale = Sale::create([
                    'sale_number'    => Sale::generateSaleNumber(),
                    'customer_id'    => $deliveryOrder->customer_id,
                    'customer_name'  => $deliveryOrder->customer_name,
                    'sale_date'      => today(),
                    'subtotal'       => $deliveryOrder->total_amount,
                    'discount'       => 0,
                    'total_amount'   => $deliveryOrder->total_amount,
                    'payment_method' => $deliveryOrder->payment_method === 'unpaid' ? 'cash' : $deliveryOrder->payment_method,
                    'amount_paid'    => $amountPaid,
                    'change_amount'  => max(0, $amountPaid - $deliveryOrder->total_amount),
                    'notes'          => "Delivery: {$deliveryOrder->order_number} — {$deliveryOrder->address}",
                    'user_id'        => auth()->id(),
                ]);

                foreach ($deliveryOrder->items as $item) {
                    $sale->items()->create([
                        'product_id'          => $item->product_id,
                        'product_name'        => $item->product_name,
                        'product_type'        => $item->product_type,
                        'unit_price'          => $item->unit_price,
                        'quantity'            => $item->quantity,
                        'containers_returned' => 0,
                        'subtotal'            => $item->subtotal,
                    ]);
                }

                $data['sale_id'] = $sale->id;
            }
        }

        $deliveryOrder->update($data);

        return back()->with('success', "Order updated to: " . DeliveryOrder::statusLabels()[$validated['status']]);
    }

    public function destroy(DeliveryOrder $deliveryOrder): RedirectResponse
    {
        $deliveryOrder->delete();
        return back()->with('success', 'Delivery order deleted.');
    }
}
