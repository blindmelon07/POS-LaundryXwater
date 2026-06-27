<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Customer;
use App\Models\SaleItem;
use Inertia\Inertia;
use Inertia\Response;

class ContainerController extends Controller
{
    public function index(): Response
    {
        $slimOut = (int) Customer::sum('slim_containers');
        $roundOut = (int) Customer::sum('round_containers');

        $totalSlimSold = (int) SaleItem::where('product_type', 'container_slim')->sum('quantity');
        $totalRoundSold = (int) SaleItem::where('product_type', 'container_round')->sum('quantity');
        $totalSlimReturned = (int) SaleItem::where('product_type', 'container_slim')->sum('containers_returned');
        $totalRoundReturned = (int) SaleItem::where('product_type', 'container_round')->sum('containers_returned');

        $customersWithContainers = Customer::where(function ($q) {
            $q->where('slim_containers', '>', 0)->orWhere('round_containers', '>', 0);
        })->orderByDesc('slim_containers')->orderByDesc('round_containers')->get()->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'phone' => $c->phone,
            'slim_containers' => $c->slim_containers,
            'round_containers' => $c->round_containers,
            'total' => $c->total_containers,
        ]);

        return Inertia::render('containers/index', [
            'summary' => [
                'slim_out' => $slimOut,
                'round_out' => $roundOut,
                'total_out' => $slimOut + $roundOut,
                'slim_sold' => $totalSlimSold,
                'round_sold' => $totalRoundSold,
                'slim_returned' => $totalSlimReturned,
                'round_returned' => $totalRoundReturned,
            ],
            'customers' => $customersWithContainers,
        ]);
    }

    public function updateContainers(\Illuminate\Http\Request $request, Customer $customer): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'slim_containers' => 'required|integer|min:0',
            'round_containers' => 'required|integer|min:0',
        ]);

        $customer->update($validated);
        return back()->with('success', "Container count updated for {$customer->name}.");
    }
}

