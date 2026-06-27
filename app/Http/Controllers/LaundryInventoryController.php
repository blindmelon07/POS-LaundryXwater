<?php

namespace App\Http\Controllers;

use App\Models\InventoryAdjustment;
use App\Models\InventoryItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaundryInventoryController extends Controller
{
    private function baseQuery()
    {
        return InventoryItem::where('business', 'laundry');
    }

    public function index(): Response
    {
        $items = $this->baseQuery()
            ->with(['adjustments' => fn ($q) => $q->latest()->limit(5)->with('user')])
            ->orderBy('category')->orderBy('name')
            ->get()
            ->map(fn ($item) => [
                'id'                 => $item->id,
                'name'               => $item->name,
                'category'           => $item->category,
                'quantity'           => (float) $item->quantity,
                'unit'               => $item->unit,
                'min_quantity'       => $item->min_quantity ? (float) $item->min_quantity : null,
                'cost_per_unit'      => $item->cost_per_unit ? (float) $item->cost_per_unit : null,
                'total_value'        => $item->total_value,
                'is_low_stock'       => $item->isLowStock(),
                'notes'              => $item->notes,
                'recent_adjustments' => $item->adjustments->map(fn ($a) => [
                    'type'     => $a->type,
                    'quantity' => (float) $a->quantity,
                    'reason'   => $a->reason,
                    'user'     => $a->user?->name,
                    'date'     => $a->created_at->format('M d, Y h:i A'),
                ]),
            ]);

        return Inertia::render('laundry/inventory/index', [
            'items'           => $items,
            'low_stock_count' => $items->where('is_low_stock', true)->count(),
            'total_value'     => $items->sum('total_value'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'category'      => 'required|string|max:100',
            'quantity'      => 'required|numeric|min:0',
            'unit'          => 'required|string|max:50',
            'min_quantity'  => 'nullable|numeric|min:0',
            'cost_per_unit' => 'nullable|numeric|min:0',
            'notes'         => 'nullable|string',
        ]);

        $item = InventoryItem::create(array_merge($validated, ['business' => 'laundry']));

        if ($validated['quantity'] > 0) {
            InventoryAdjustment::create([
                'inventory_item_id' => $item->id,
                'type'              => 'add',
                'quantity'          => $validated['quantity'],
                'quantity_before'   => 0,
                'quantity_after'    => $validated['quantity'],
                'reason'            => 'Initial stock',
                'user_id'           => auth()->id(),
            ]);
        }

        return back()->with('success', 'Item added.');
    }

    public function update(Request $request, InventoryItem $inventoryItem): RedirectResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'category'      => 'required|string|max:100',
            'quantity'      => 'required|numeric|min:0',
            'unit'          => 'required|string|max:50',
            'min_quantity'  => 'nullable|numeric|min:0',
            'cost_per_unit' => 'nullable|numeric|min:0',
            'notes'         => 'nullable|string',
        ]);

        $inventoryItem->update($validated);
        return back()->with('success', 'Item updated.');
    }

    public function adjust(Request $request, InventoryItem $inventoryItem): RedirectResponse
    {
        $validated = $request->validate([
            'type'     => 'required|in:add,remove,adjustment',
            'quantity' => 'required|numeric|min:0.01',
            'reason'   => 'required|string|max:255',
        ]);

        $before = (float) $inventoryItem->quantity;
        $qty    = (float) $validated['quantity'];

        $after = match ($validated['type']) {
            'add'        => $before + $qty,
            'remove'     => max(0, $before - $qty),
            'adjustment' => $qty,
        };

        $inventoryItem->update(['quantity' => $after]);

        InventoryAdjustment::create([
            'inventory_item_id' => $inventoryItem->id,
            'type'              => $validated['type'],
            'quantity'          => $qty,
            'quantity_before'   => $before,
            'quantity_after'    => $after,
            'reason'            => $validated['reason'],
            'user_id'           => auth()->id(),
        ]);

        return back()->with('success', "Stock adjusted: {$inventoryItem->name}");
    }

    public function destroy(InventoryItem $inventoryItem): RedirectResponse
    {
        $inventoryItem->delete();
        return back()->with('success', 'Item deleted.');
    }
}
