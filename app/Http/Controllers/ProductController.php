<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::orderBy('type')->get()->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'type' => $p->type,
            'type_label' => $p->type_label,
            'price' => (float) $p->price,
            'unit' => $p->unit,
            'notes' => $p->notes,
            'is_active' => $p->is_active,
        ]);

        return Inertia::render('products/index', [
            'products' => $products,
            'type_labels' => Product::typeLabels(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:slim_wholesale,slim_regular,slim_commercial,container_slim,container_round,delivery,other',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:100',
            'notes' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        Product::create($validated);
        return back()->with('success', 'Product added successfully.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:slim_wholesale,slim_regular,slim_commercial,container_slim,container_round,delivery,other',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:100',
            'notes' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $product->update($validated);
        return back()->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();
        return back()->with('success', 'Product deleted.');
    }
}
