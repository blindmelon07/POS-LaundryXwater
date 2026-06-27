<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Expense::orderByDesc('date')->orderByDesc('created_at');

        if ($request->filled('month')) {
            $query->whereMonth('date', date('m', strtotime($request->month)))
                ->whereYear('date', date('Y', strtotime($request->month)));
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $expenses = $query->paginate(20)->through(fn ($e) => [
            'id' => $e->id,
            'date' => $e->date->format('M d, Y'),
            'description' => $e->description,
            'category' => $e->category,
            'category_label' => $e->category_label,
            'amount' => (float) $e->amount,
            'receipt_number' => $e->receipt_number,
            'notes' => $e->notes,
        ]);

        $totalThisMonth = Expense::whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->sum('amount');

        return Inertia::render('expenses/index', [
            'expenses' => $expenses,
            'filters' => $request->only(['month', 'category']),
            'category_labels' => Expense::categoryLabels(),
            'total_this_month' => (float) $totalThisMonth,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'description' => 'required|string|max:255',
            'category' => 'required|in:water_supply,electricity,rent,salaries,packaging,maintenance,delivery,other',
            'amount' => 'required|numeric|min:0',
            'receipt_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->id();
        Expense::create($validated);

        return back()->with('success', 'Expense recorded successfully.');
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'description' => 'required|string|max:255',
            'category' => 'required|in:water_supply,electricity,rent,salaries,packaging,maintenance,delivery,other',
            'amount' => 'required|numeric|min:0',
            'receipt_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $expense->update($validated);
        return back()->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $expense->delete();
        return back()->with('success', 'Expense deleted.');
    }
}
