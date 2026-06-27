<?php

use App\Models\Customer;

beforeEach(function () {
    $this->admin = adminUser();
    $this->actingAs($this->admin);
});

test('can view customers page', function () {
    $this->get('/customers')->assertOk()
        ->assertInertia(fn ($p) => $p->component('customers/index'));
});

test('can create a customer', function () {
    $this->post('/customers', [
        'name' => 'Maria Santos',
        'phone' => '09171234567',
        'address' => '123 Main St, Cebu City',
        'type' => 'regular',
        'slim_containers' => 2,
        'round_containers' => 0,
    ])->assertRedirect();

    expect(Customer::count())->toBe(1);
    $customer = Customer::first();
    expect($customer->name)->toBe('Maria Santos');
    expect($customer->slim_containers)->toBe(2);
});

test('customer creation requires name and type', function () {
    $this->post('/customers', [])->assertSessionHasErrors(['name', 'type']);
});

test('customer type must be valid', function () {
    $this->post('/customers', ['name' => 'Test', 'type' => 'vip'])->assertSessionHasErrors('type');
});

test('can view customer profile with purchase history', function () {
    $customer = Customer::create([
        'name' => 'Test Customer', 'type' => 'wholesale', 'is_active' => true,
    ]);

    $this->get("/customers/{$customer->id}")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('customers/show')
            ->where('customer.name', 'Test Customer')
        );
});

test('can update customer', function () {
    $customer = Customer::create(['name' => 'Old Name', 'type' => 'regular', 'is_active' => true]);

    $this->put("/customers/{$customer->id}", [
        'name' => 'New Name',
        'type' => 'wholesale',
        'slim_containers' => 3,
        'round_containers' => 1,
        'is_active' => true,
    ]);

    expect($customer->fresh()->name)->toBe('New Name');
    expect($customer->fresh()->slim_containers)->toBe(3);
});

test('can delete customer', function () {
    $customer = Customer::create(['name' => 'To Delete', 'type' => 'regular', 'is_active' => true]);
    $this->delete("/customers/{$customer->id}")->assertRedirect();
    expect(Customer::count())->toBe(0);
});

test('total containers accessor sums slim and round', function () {
    $customer = Customer::create([
        'name' => 'Test', 'type' => 'regular',
        'slim_containers' => 3, 'round_containers' => 2,
    ]);
    expect($customer->total_containers)->toBe(5);
});
