<?php

use App\Models\Product;

beforeEach(function () {
    $this->admin = adminUser();
    $this->actingAs($this->admin);
});

test('admin can view products page', function () {
    $this->get('/products')->assertOk()
        ->assertInertia(fn ($p) => $p->component('products/index'));
});

test('cashier cannot access products page', function () {
    $cashier = cashierUser();
    $this->actingAs($cashier);
    $this->get('/products')->assertForbidden();
});

test('admin can create a product', function () {
    $this->post('/products', [
        'name' => 'Slim Wholesale',
        'type' => 'slim_wholesale',
        'price' => 25.00,
        'unit' => 'Per gallon',
        'notes' => 'Refill only',
        'is_active' => true,
    ])->assertRedirect();

    expect(Product::count())->toBe(1);
    expect(Product::first()->name)->toBe('Slim Wholesale');
    expect(Product::first()->price)->toBe('25.00');
});

test('product creation requires name type and price', function () {
    $this->post('/products', [])->assertSessionHasErrors(['name', 'type', 'price']);
});

test('product type must be valid', function () {
    $this->post('/products', [
        'name' => 'Test', 'type' => 'invalid_type', 'price' => 10, 'unit' => 'pcs',
    ])->assertSessionHasErrors('type');
});

test('admin can update a product', function () {
    $product = Product::create([
        'name' => 'Old Name', 'type' => 'slim_regular',
        'price' => 30.00, 'unit' => 'Per gallon', 'is_active' => true,
    ]);

    $this->put("/products/{$product->id}", [
        'name' => 'New Name', 'type' => 'slim_regular',
        'price' => 35.00, 'unit' => 'Per gallon', 'is_active' => true,
    ]);

    expect($product->fresh()->name)->toBe('New Name');
    expect($product->fresh()->price)->toBe('35.00');
});

test('admin can delete a product', function () {
    $product = Product::create([
        'name' => 'To Delete', 'type' => 'other',
        'price' => 10.00, 'unit' => 'pcs', 'is_active' => true,
    ]);

    $this->delete("/products/{$product->id}")->assertRedirect();
    expect(Product::count())->toBe(0);
});

test('type label accessor returns readable name', function () {
    $product = Product::create([
        'name' => 'Test', 'type' => 'slim_wholesale',
        'price' => 25, 'unit' => 'Per gallon',
    ]);
    expect($product->type_label)->toBe('Slim/Round Wholesale');
});

test('active scope only returns active products', function () {
    Product::create(['name' => 'Active', 'type' => 'slim_regular', 'price' => 30, 'unit' => 'Per gallon', 'is_active' => true]);
    Product::create(['name' => 'Inactive', 'type' => 'slim_regular', 'price' => 30, 'unit' => 'Per gallon', 'is_active' => false]);

    expect(Product::active()->count())->toBe(1);
});
