<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\InventoryAdjustment;
use App\Models\InventoryItem;
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
            'amount_paid'                  => 'nullable|numeric|min:0',
            'discount'                     => 'nullable|numeric|min:0',
            'notes'                        => 'nullable|string',
            'slim_returned'                => 'nullable|integer|min:0',
            'round_returned'               => 'nullable|integer|min:0',
            'items'                        => 'nullable|array',
            'items.*.product_id'           => 'required|exists:products,id',
            'items.*.quantity'             => 'required|integer|min:1',
            'items.*.containers_returned'  => 'nullable|integer|min:0',
        ]);

        $items    = [];
        $subtotal = 0;

        foreach ($validated['items'] ?? [] as $item) {
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

        $slimReturnedDirect  = (int) ($validated['slim_returned']  ?? 0);
        $roundReturnedDirect = (int) ($validated['round_returned'] ?? 0);
        $hasReturns = $slimReturnedDirect > 0 || $roundReturnedDirect > 0;

        // Reject if nothing to process
        if (empty($items) && !$hasReturns) {
            return back()->withErrors(['items' => 'Add at least one product or record a container return.']);
        }

        $discount   = (float) ($validated['discount'] ?? 0);
        $total      = $subtotal - $discount;
        $amountPaid = (float) ($validated['amount_paid'] ?? 0);

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
            $slimReturned  = $slimReturnedDirect;
            $roundReturned = $roundReturnedDirect;

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
                // Deduct from customer's container balance
                $customer = Customer::find($customerId);
                if ($customer) {
                    $customer->update([
                        'slim_containers'  => max(0, $customer->slim_containers - $slimReturned),
                        'round_containers' => max(0, $customer->round_containers - $roundReturned),
                    ]);
                }

                // Add returned containers back into inventory
                $customerName = $customer?->name ?? ($validated['customer_name'] ?? 'Customer');
                $this->restockContainerInventory('slim', $slimReturned, $sale->sale_number, $customerName);
                $this->restockContainerInventory('round', $roundReturned, $sale->sale_number, $customerName);
            }
        }

        return redirect()->route('pos.index')->with('success', "Sale {$sale->sale_number} recorded.");
    }

    private function restockContainerInventory(string $type, int $qty, string $saleNumber, string $customerName): void
    {
        if ($qty <= 0) return;

        $items = InventoryItem::where('business', 'water')
            ->where('container_type', $type)
            ->get();

        $processor = auth()->user()?->name ?? 'System';

        foreach ($items as $item) {
            $before = (float) $item->quantity;
            $after  = $before + $qty;

            $item->update(['quantity' => $after]);

            InventoryAdjustment::create([
                'inventory_item_id' => $item->id,
                'type'              => 'add',
                'quantity'          => $qty,
                'quantity_before'   => $before,
                'quantity_after'    => $after,
                'reason'            => "Returned by {$customerName} — Sale {$saleNumber} (processed by: {$processor})",
                'user_id'           => auth()->id(),
            ]);
        }
    }
}
