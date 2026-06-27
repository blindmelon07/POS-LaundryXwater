<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(): Response
    {
        $products = Product::active()->orderBy('type')->get()->map(fn ($p) => [
            'id'         => $p->id,
            'name'       => $p->name,
            'type'       => $p->type,
            'type_label' => $p->type_label,
            'price'      => (float) $p->price,
            'unit'       => $p->unit,
            'notes'      => $p->notes,
        ]);

        $customers = Customer::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'slim_containers', 'round_containers'])
            ->map(fn ($c) => [
                'id'               => $c->id,
                'name'             => $c->name,
                'phone'            => $c->phone,
                'slim_containers'  => $c->slim_containers,
                'round_containers' => $c->round_containers,
            ]);

        return Inertia::render('pos/index', [
            'products'  => $products,
            'customers' => $customers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id'                  => 'nullable|exists:customers,id',
            'customer_name'                => 'nullable|string|max:255',
            'payment_method'               => 'required|in:cash,gcash,card',
            'amount_paid'                  => 'required|numeric|min:0',
            'discount'                     => 'nullable|numeric|min:0',
            'notes'                        => 'nullable|string',
            'slim_returned'                => 'nullable|integer|min:0',
            'round_returned'               => 'nullable|integer|min:0',
            'items'                        => 'required|array|min:1',
            'items.*.product_id'           => 'required|exists:products,id',
            'items.*.quantity'             => 'required|integer|min:1',
            'items.*.containers_returned'  => 'nullable|integer|min:0',
        ]);

        $items    = [];
        $subtotal = 0;

        foreach ($validated['items'] as $item) {
            $product       = Product::findOrFail($item['product_id']);
            $lineSubtotal  = $product->price * $item['quantity'];
            $subtotal     += $lineSubtotal;

            $items[] = [
                'product_id'          => $product->id,
                'product_name'        => $product->name,
                'product_type'        => $product->type,
                'unit_price'          => $product->price,
                'quantity'            => $item['quantity'],
                'containers_returned' => $item['containers_returned'] ?? 0,
                'subtotal'            => $lineSubtotal,
            ];
        }

        $discount   = (float) ($validated['discount'] ?? 0);
        $total      = $subtotal - $discount;
        $amountPaid = (float) $validated['amount_paid'];

        $sale = Sale::create([
            'sale_number'   => Sale::generateSaleNumber(),
            'customer_id'   => $validated['customer_id'] ?? null,
            'customer_name' => $validated['customer_name'] ?? null,
            'sale_date'     => today(),
            'subtotal'      => $subtotal,
            'discount'      => $discount,
            'total_amount'  => $total,
            'payment_method'=> $validated['payment_method'],
            'amount_paid'   => $amountPaid,
            'change_amount' => max(0, $amountPaid - $total),
            'notes'         => $validated['notes'] ?? null,
            'user_id'       => auth()->id(),
        ]);

        foreach ($items as $item) {
            $sale->items()->create($item);
        }

        // Auto-deduct returned containers from the linked customer's balance
        $customerId = $validated['customer_id'] ?? null;
        if ($customerId) {
            // Direct return inputs from the checkout panel
            $slimReturned  = (int) ($validated['slim_returned']  ?? 0);
            $roundReturned = (int) ($validated['round_returned'] ?? 0);

            // Also count any returns recorded on container cart items
            foreach ($validated['items'] as $item) {
                $returned = (int) ($item['containers_returned'] ?? 0);
                if ($returned <= 0) continue;

                $product = Product::find($item['product_id']);
                if (!$product) continue;

                if ($product->type === 'container_slim') {
                    $slimReturned += $returned;
                } elseif ($product->type === 'container_round') {
                    $roundReturned += $returned;
                }
            }

            if ($slimReturned > 0 || $roundReturned > 0) {
                $customer = Customer::find($customerId);
                if ($customer) {
                    $customer->update([
                        'slim_containers'  => max(0, $customer->slim_containers - $slimReturned),
                        'round_containers' => max(0, $customer->round_containers - $roundReturned),
                    ]);
                }
            }
        }

        return redirect()->route('pos.index')->with('success', "Sale {$sale->sale_number} recorded.");
    }
}
