<?php

namespace App\Http\Controllers;

use App\Models\LaundryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaundryServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('laundry/services/index', [
            'services'    => LaundryService::orderBy('type')->orderBy('name')->get(),
            'type_labels' => LaundryService::$typeLabels,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'type'      => 'required|in:wash_dry,wash_only,dry_only,fold,press,other',
            'price'     => 'required|numeric|min:0',
            'unit'      => 'required|string|max:50',
            'is_active' => 'boolean',
            'notes'     => 'nullable|string|max:255',
        ]);

        LaundryService::create($validated);
        return back()->with('success', 'Service added.');
    }

    public function update(Request $request, LaundryService $laundryService): RedirectResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'type'      => 'required|in:wash_dry,wash_only,dry_only,fold,press,other',
            'price'     => 'required|numeric|min:0',
            'unit'      => 'required|string|max:50',
            'is_active' => 'boolean',
            'notes'     => 'nullable|string|max:255',
        ]);

        $laundryService->update($validated);
        return back()->with('success', 'Service updated.');
    }

    public function destroy(LaundryService $laundryService): RedirectResponse
    {
        $laundryService->delete();
        return back()->with('success', 'Service deleted.');
    }
}
