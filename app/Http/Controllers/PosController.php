<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(): Response
    {
        $products = Product::active()->orderBy('type')->get()->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'type' => $p->type,
            'type_label' => $p->type_label,
            'price' => (float) $p->price,
            'unit' => $p->unit,
            'notes' => $p->notes,
        ]);

        return Inertia::render('pos/index', [
            'products' => $products,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'payment_method' => 'required|in:cash,gcash,card',
            'amount_paid' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.containers_returned' => 'nullable|integer|min:0',
        ]);

        $items = [];
        $subtotal = 0;

        foreach ($validated['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);
            $lineSubtotal = $product->price * $item['quantity'];
            $subtotal += $lineSubtotal;

            $items[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_type' => $product->type,
                'unit_price' => $product->price,
                'quantity' => $item['quantity'],
                'containers_returned' => $item['containers_returned'] ?? 0,
                'subtotal' => $lineSubtotal,
            ];
        }

        $discount = $validated['discount'] ?? 0;
        $total = $subtotal - $discount;
        $amountPaid = $validated['amount_paid'];

        $sale = Sale::create([
            'sale_number' => Sale::generateSaleNumber(),
            'customer_name' => $validated['customer_name'],
            'sale_date' => today(),
            'subtotal' => $subtotal,
            'discount' => $discount,
            'total_amount' => $total,
            'payment_method' => $validated['payment_method'],
            'amount_paid' => $amountPaid,
            'change_amount' => max(0, $amountPaid - $total),
            'notes' => $validated['notes'],
            'user_id' => auth()->id(),
        ]);

        foreach ($items as $item) {
            $sale->items()->create($item);
        }

        return redirect()->route('pos.index')->with('success', "Sale {$sale->sale_number} recorded successfully!");
    }
}
