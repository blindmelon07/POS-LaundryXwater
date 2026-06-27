<?php

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;

beforeEach(function () {
    $this->admin = adminUser();
    $this->actingAs($this->admin);

    $this->product = Product::create([
        'name' => 'Slim Wholesale',
        'type' => 'slim_wholesale',
        'price' => 25.00,
        'unit' => 'Per gallon',
        'is_active' => true,
    ]);
});

test('admin can view POS terminal', function () {
    $this->get('/pos')->assertOk()->assertInertia(fn ($page) => $page->component('pos/index')->has('products'));
});

test('cashier can view POS terminal', function () {
    $cashier = cashierUser();
    $this->actingAs($cashier);
    $this->get('/pos')->assertOk();
});

test('user without pos permission is forbidden', function () {
    $user = \App\Models\User::factory()->create();
    $this->actingAs($user);
    $this->get('/pos')->assertForbidden();
});

test('can create a sale via POS', function () {
    $response = $this->post('/pos', [
        'customer_name' => 'Juan dela Cruz',
        'payment_method' => 'cash',
        'amount_paid' => 100,
        'discount' => 0,
        'notes' => '',
        'items' => [
            ['product_id' => $this->product->id, 'quantity' => 3, 'containers_returned' => 0],
        ],
    ]);

    $response->assertRedirect('/pos');
    expect(Sale::count())->toBe(1);
    expect(SaleItem::count())->toBe(1);

    $sale = Sale::first();
    expect($sale->total_amount)->toBe('75.00');
    expect($sale->change_amount)->toBe('25.00');
    expect($sale->sale_number)->toStartWith('WRS-');
});

test('sale number is auto-generated with correct format', function () {
    $this->post('/pos', [
        'payment_method' => 'cash',
        'amount_paid' => 50,
        'items' => [['product_id' => $this->product->id, 'quantity' => 2, 'containers_returned' => 0]],
    ]);

    $sale = Sale::first();
    expect($sale->sale_number)->toMatch('/^WRS-\d{8}-\d{4}$/');
});

test('POS requires at least one item', function () {
    $this->post('/pos', [
        'payment_method' => 'cash',
        'amount_paid' => 50,
        'items' => [],
    ])->assertSessionHasErrors('items');

    expect(Sale::count())->toBe(0);
});

test('POS validates payment method', function () {
    $this->post('/pos', [
        'payment_method' => 'bitcoin',
        'amount_paid' => 50,
        'items' => [['product_id' => $this->product->id, 'quantity' => 1, 'containers_returned' => 0]],
    ])->assertSessionHasErrors('payment_method');
});

test('sale is linked to authenticated user', function () {
    $this->post('/pos', [
        'payment_method' => 'cash',
        'amount_paid' => 50,
        'items' => [['product_id' => $this->product->id, 'quantity' => 2, 'containers_returned' => 0]],
    ]);

    expect(Sale::first()->user_id)->toBe($this->admin->id);
});

test('discount is applied correctly', function () {
    $this->post('/pos', [
        'payment_method' => 'gcash',
        'amount_paid' => 45,
        'discount' => 5,
        'items' => [['product_id' => $this->product->id, 'quantity' => 2, 'containers_returned' => 0]],
    ]);

    $sale = Sale::first();
    expect($sale->subtotal)->toBe('50.00');
    expect($sale->discount)->toBe('5.00');
    expect($sale->total_amount)->toBe('45.00');
});
