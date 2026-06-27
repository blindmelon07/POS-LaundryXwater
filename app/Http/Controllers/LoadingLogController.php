<?php

namespace App\Http\Controllers;

use App\Models\InventoryAdjustment;
use App\Models\InventoryItem;
use App\Models\LoadingLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoadingLogController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->get('date', today()->toDateString());

        $logs = LoadingLog::with(['user', 'inventoryItem'])
            ->whereDate('log_date', $date)
            ->latest()
            ->get()
            ->map(fn ($log) => [
                'id'                 => $log->id,
                'log_date'           => $log->log_date->format('M d, Y'),
                'type'               => $log->type,
                'type_label'         => LoadingLog::$typeLabels[$log->type] ?? $log->type,
                'product_name'       => $log->product_name,
                'quantity'           => (float) $log->quantity,
                'unit'               => $log->unit,
                'rider_name'         => $log->rider_name,
                'notes'              => $log->notes,
                'logged_by'          => $log->user?->name,
                'inventory_item_id'  => $log->inventory_item_id,
                'inventory_linked'   => $log->inventory_item_id !== null,
                'created_at'         => $log->created_at->format('h:i A'),
            ]);

        $summary = [
            'total_out' => $logs->where('type', 'load_out')->sum('quantity'),
            'total_in'  => $logs->where('type', 'load_in')->sum('quantity'),
        ];

        // Water inventory items for the picker
        $inventoryItems = InventoryItem::where('business', 'water')
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->map(fn ($item) => [
                'id'       => $item->id,
                'name'     => $item->name,
                'category' => $item->category,
                'quantity' => (float) $item->quantity,
                'unit'     => $item->unit,
            ]);

        return Inertia::render('loading-log/index', [
            'logs'            => $logs,
            'summary'         => $summary,
            'date'            => $date,
            'inventory_items' => $inventoryItems,
            'type_labels'     => LoadingLog::$typeLabels,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'log_date'          => 'required|date',
            'type'              => 'required|in:load_out,load_in',
            'inventory_item_id' => 'nullable|exists:inventory_items,id',
            'product_name'      => 'required|string|max:255',
            'quantity'          => 'required|numeric|min:0.5',
            'unit'              => 'required|string|max:50',
            'rider_name'        => 'nullable|string|max:255',
            'notes'             => 'nullable|string',
        ]);

        $log = LoadingLog::create(array_merge($validated, ['user_id' => auth()->id()]));

        // Auto-adjust linked inventory item
        if ($validated['inventory_item_id'] ?? null) {
            $item   = InventoryItem::find($validated['inventory_item_id']);
            $before = (float) $item->quantity;
            $qty    = (float) $validated['quantity'];

            $after = $validated['type'] === 'load_out'
                ? max(0, $before - $qty)
                : $before + $qty;

            $item->update(['quantity' => $after]);

            $loader   = auth()->user()?->name ?? 'Loader';
            $rider    = $validated['rider_name'] ?? null;
            $riderStr = $rider ? " (Rider: {$rider})" : '';

            InventoryAdjustment::create([
                'inventory_item_id' => $item->id,
                'type'              => $validated['type'] === 'load_out' ? 'remove' : 'add',
                'quantity'          => $qty,
                'quantity_before'   => $before,
                'quantity_after'    => $after,
                'reason'            => $validated['type'] === 'load_out'
                    ? "Loaded out{$riderStr} — logged by {$loader}"
                    : "Loaded in{$riderStr} — logged by {$loader}",
                'user_id'           => auth()->id(),
            ]);
        }

        return back()->with('success', 'Log entry saved.');
    }

    public function destroy(LoadingLog $loadingLog): RedirectResponse
    {
        $loadingLog->delete();
        return back()->with('success', 'Log entry deleted.');
    }
}
