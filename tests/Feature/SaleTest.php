<?php

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;

beforeEach(function () {
    $this->admin = adminUser();
    $this->actingAs($this->admin);

    $product = Product::create([
        'name' => 'Slim Regular', 'type' => 'slim_regular',
        'price' => 30.00, 'unit' => 'Per gallon', 'is_active' => true,
    ]);

    $this->sale = Sale::create([
        'sale_number' => 'WRS-20260101-0001',
        'customer_name' => 'Test Customer',
        'sale_date' => today(),
        'subtotal' => 90.00,
        'discount' => 0,
        'total_amount' => 90.00,
        'payment_method' => 'cash',
        'amount_paid' => 100.00,
        'change_amount' => 10.00,
        'user_id' => $this->admin->id,
    ]);

    SaleItem::create([
        'sale_id' => $this->sale->id,
        'product_id' => $product->id,
        'product_name' => 'Slim Regular',
        'product_type' => 'slim_regular',
        'unit_price' => 30.00,
        'quantity' => 3,
        'containers_returned' => 0,
        'subtotal' => 90.00,
    ]);
});

test('admin can view sales history', function () {
    $this->get('/sales')->assertOk()->assertInertia(fn ($p) => $p->component('sales/index')->has('sales'));
});

test('sales list shows correct data', function () {
    $this->get('/sales')->assertInertia(
        fn ($p) => $p->has('sales.data', 1)
    );
});

test('can view sale detail', function () {
    $this->get("/sales/{$this->sale->id}")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('sales/show')
            ->where('sale.sale_number', 'WRS-20260101-0001')
            ->where('sale.total_amount', 90.0)
        );
});

test('admin can delete a sale', function () {
    $this->delete("/sales/{$this->sale->id}")->assertRedirect('/sales');
    expect(Sale::count())->toBe(0);
    expect(SaleItem::count())->toBe(0);
});

test('cashier cannot delete a sale', function () {
    $cashier = cashierUser();
    $this->actingAs($cashier);
    $this->delete("/sales/{$this->sale->id}")->assertForbidden();
    expect(Sale::count())->toBe(1);
});

test('sales can be filtered by payment method', function () {
    Sale::create([
        'sale_number' => 'WRS-20260101-0002',
        'sale_date' => today(),
        'subtotal' => 50, 'discount' => 0, 'total_amount' => 50,
        'payment_method' => 'gcash',
        'amount_paid' => 50, 'change_amount' => 0,
        'user_id' => $this->admin->id,
    ]);

    $this->get('/sales?payment_method=gcash')
        ->assertInertia(fn ($p) => $p->has('sales.data', 1));
});

test('total gallons accessor works', function () {
    expect($this->sale->total_gallons)->toBe(3);
});
