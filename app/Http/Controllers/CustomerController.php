<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Customer::withCount('sales')->orderBy('name');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('phone', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $customers = $query->get()->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'phone' => $c->phone,
            'address' => $c->address,
            'email' => $c->email,
            'type' => $c->type,
            'slim_containers' => $c->slim_containers,
            'round_containers' => $c->round_containers,
            'total_containers' => $c->total_containers,
            'balance' => (float) $c->balance,
            'is_active' => $c->is_active,
            'sales_count' => $c->sales_count,
            'notes' => $c->notes,
        ]);

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'type']),
            'type_labels' => Customer::typeLabels(),
            'summary' => [
                'total' => $customers->count(),
                'slim_out' => $customers->sum('slim_containers'),
                'round_out' => $customers->sum('round_containers'),
            ],
        ]);
    }

    public function show(Customer $customer): Response
    {
        $sales = $customer->sales()
            ->with('items')
            ->orderByDesc('sale_date')
            ->limit(20)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'sale_number' => $s->sale_number,
                'sale_date' => $s->sale_date->format('M d, Y'),
                'total_amount' => (float) $s->total_amount,
                'payment_method' => $s->payment_method,
                'total_gallons' => $s->total_gallons,
            ]);

        return Inertia::render('customers/show', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'email' => $customer->email,
                'type' => $customer->type,
                'slim_containers' => $customer->slim_containers,
                'round_containers' => $customer->round_containers,
                'balance' => (float) $customer->balance,
                'notes' => $customer->notes,
                'is_active' => $customer->is_active,
                'created_at' => $customer->created_at->format('M d, Y'),
                'total_spent' => (float) $customer->sales()->sum('total_amount'),
                'total_transactions' => $customer->sales()->count(),
            ],
            'sales' => $sales,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'email' => 'nullable|email|max:255',
            'type' => 'required|in:wholesale,regular,commercial',
            'slim_containers' => 'nullable|integer|min:0',
            'round_containers' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        Customer::create($validated);
        return back()->with('success', 'Customer added successfully.');
    }

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'email' => 'nullable|email|max:255',
            'type' => 'required|in:wholesale,regular,commercial',
            'slim_containers' => 'nullable|integer|min:0',
            'round_containers' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $customer->update($validated);
        return back()->with('success', 'Customer updated.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();
        return back()->with('success', 'Customer deleted.');
    }
}
