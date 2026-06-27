<?php

use App\Models\Expense;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;

beforeEach(function () {
    $this->admin = adminUser();
    $this->actingAs($this->admin);
});

test('admin can view monthly reports', function () {
    $this->get('/reports')->assertOk()
        ->assertInertia(fn ($p) => $p->component('reports/index')->has('months')->has('totals'));
});

test('reports show 12 months', function () {
    $this->get('/reports')->assertInertia(fn ($p) => $p->has('months', 12));
});

test('report totals aggregate correctly', function () {
    $product = Product::create([
        'name' => 'Test', 'type' => 'slim_wholesale',
        'price' => 25, 'unit' => 'Per gallon', 'is_active' => true,
    ]);

    $sale = Sale::create([
        'sale_number' => 'WRS-TEST-001',
        'sale_date' => now()->startOfYear()->addMonth(),
        'subtotal' => 250, 'discount' => 0, 'total_amount' => 250,
        'payment_method' => 'cash', 'amount_paid' => 250, 'change_amount' => 0,
        'user_id' => $this->admin->id,
    ]);

    Expense::create([
        'date' => now()->startOfYear()->addMonth(),
        'description' => 'Test', 'category' => 'other',
        'amount' => 100, 'user_id' => $this->admin->id,
    ]);

    $year = now()->year;
    $this->get("/reports?year={$year}")
        ->assertInertia(fn ($p) => $p
            ->where('totals.revenue', 250)
            ->where('totals.expenses', 100)
            ->where('totals.profit', 150)
        );
});

test('can filter reports by year', function () {
    $this->get('/reports?year=2025')
        ->assertInertia(fn ($p) => $p->where('year', 2025));
});

test('cashier can view reports', function () {
    $cashier = cashierUser();
    $this->actingAs($cashier);
    $this->get('/reports')->assertOk();
});
