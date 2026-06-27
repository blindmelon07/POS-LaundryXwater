<?php

use App\Models\Expense;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;

beforeEach(function () {
    $this->admin = adminUser();
    $this->actingAs($this->admin);
});

test('can view z-report page', function () {
    $this->get('/z-report')->assertOk()
        ->assertInertia(fn ($p) => $p->component('z-report/index'));
});

test('z-report shows correct daily revenue', function () {
    $product = Product::create([
        'name' => 'Slim Wholesale', 'type' => 'slim_wholesale',
        'price' => 25, 'unit' => 'Per gallon', 'is_active' => true,
    ]);

    $sale = Sale::create([
        'sale_number' => 'WRS-TEST-0001',
        'sale_date' => today(),
        'subtotal' => 75, 'discount' => 0, 'total_amount' => 75,
        'payment_method' => 'cash',
        'amount_paid' => 100, 'change_amount' => 25,
        'user_id' => $this->admin->id,
    ]);

    SaleItem::create([
        'sale_id' => $sale->id, 'product_id' => $product->id,
        'product_name' => 'Slim Wholesale', 'product_type' => 'slim_wholesale',
        'unit_price' => 25, 'quantity' => 3, 'containers_returned' => 0, 'subtotal' => 75,
    ]);

    $this->get('/z-report?date=' . today()->toDateString())
        ->assertInertia(fn ($p) => $p
            ->where('summary.total_transactions', 1)
            ->where('summary.total_gallons', 3)
            ->where('summary.total_revenue', 75)
        );
});

test('z-report revenue matches total sales', function () {
    Sale::create([
        'sale_number' => 'WRS-TEST-0001', 'sale_date' => today(),
        'subtotal' => 120, 'discount' => 0, 'total_amount' => 120,
        'payment_method' => 'cash', 'amount_paid' => 120, 'change_amount' => 0,
        'user_id' => $this->admin->id,
    ]);

    $this->get('/z-report?date=' . today()->toDateString())
        ->assertInertia(fn ($p) => $p->where('summary.total_revenue', 120));
});

test('z-report shows correct expenses', function () {
    Expense::create([
        'date' => today(), 'description' => 'Electricity',
        'category' => 'electricity', 'amount' => 1500,
        'user_id' => $this->admin->id,
    ]);

    Expense::create([
        'date' => today(), 'description' => 'Rent',
        'category' => 'rent', 'amount' => 5000,
        'user_id' => $this->admin->id,
    ]);

    $this->get('/z-report?date=' . today()->toDateString())
        ->assertInertia(fn ($p) => $p->where('summary.total_expenses', 6500));
});

test('z-report net profit is revenue minus expenses', function () {
    Sale::create([
        'sale_number' => 'WRS-TEST-0001', 'sale_date' => today(),
        'subtotal' => 500, 'discount' => 0, 'total_amount' => 500,
        'payment_method' => 'cash', 'amount_paid' => 500, 'change_amount' => 0,
        'user_id' => $this->admin->id,
    ]);

    Expense::create([
        'date' => today(), 'description' => 'Supplies',
        'category' => 'water_supply', 'amount' => 200,
        'user_id' => $this->admin->id,
    ]);

    $this->get('/z-report?date=' . today()->toDateString())
        ->assertInertia(fn ($p) => $p->where('summary.net_profit', 300));
});

test('z-report returns empty for day with no data', function () {
    $this->get('/z-report?date=2000-01-01')
        ->assertInertia(fn ($p) => $p
            ->where('summary.total_transactions', 0)
            ->where('summary.total_revenue', 0)
        );
});

test('cashier can view z-report', function () {
    $cashier = cashierUser();
    $this->actingAs($cashier);
    $this->get('/z-report')->assertOk();
});
