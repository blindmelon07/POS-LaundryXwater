<?php

use App\Models\Customer;
use App\Models\DeliveryOrder;
use App\Models\DeliveryOrderItem;
use App\Models\Product;

beforeEach(function () {
    $this->admin = adminUser();
    $this->actingAs($this->admin);

    $this->product = Product::create([
        'name' => 'Slim Wholesale', 'type' => 'slim_wholesale',
        'price' => 25.00, 'unit' => 'Per gallon', 'is_active' => true,
    ]);

    $this->customer = Customer::create([
        'name' => 'Maria Santos', 'phone' => '09171234567',
        'address' => '123 Main St', 'type' => 'regular', 'is_active' => true,
    ]);
});

test('can view deliveries page', function () {
    $this->get('/deliveries')->assertOk()
        ->assertInertia(fn ($p) => $p->component('deliveries/index'));
});

test('can schedule a delivery order', function () {
    $this->post('/deliveries', [
        'customer_name' => 'Maria Santos',
        'address' => '123 Main St',
        'phone' => '09171234567',
        'scheduled_date' => today()->toDateString(),
        'payment_method' => 'cash',
        'items' => [['product_id' => $this->product->id, 'quantity' => 4]],
    ])->assertRedirect();

    expect(DeliveryOrder::count())->toBe(1);
    $order = DeliveryOrder::first();
    expect($order->status)->toBe('pending');
    expect((float) $order->total_amount)->toBe(100.0);
    expect($order->order_number)->toStartWith('DEL-');
    expect(DeliveryOrderItem::count())->toBe(1);
});

test('delivery order number has correct format', function () {
    $this->post('/deliveries', [
        'customer_name' => 'Test', 'address' => 'Test St',
        'scheduled_date' => today()->toDateString(),
        'payment_method' => 'cash',
        'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
    ]);

    expect(DeliveryOrder::first()->order_number)->toMatch('/^DEL-\d{8}-\d{4}$/');
});

test('delivery requires customer name address scheduled date and items', function () {
    $this->post('/deliveries', [])->assertSessionHasErrors([
        'customer_name', 'address', 'scheduled_date', 'payment_method', 'items',
    ]);
});

test('can update delivery status to out for delivery', function () {
    $order = DeliveryOrder::create([
        'order_number' => 'DEL-20260101-0001',
        'customer_name' => 'Test', 'address' => 'Test St',
        'scheduled_date' => today(),
        'status' => 'pending',
        'total_amount' => 100,
        'amount_paid' => 0,
        'payment_method' => 'cash',
        'user_id' => $this->admin->id,
    ]);

    $this->patch("/deliveries/{$order->id}/status", [
        'status' => 'out_for_delivery',
    ])->assertRedirect();

    expect($order->fresh()->status)->toBe('out_for_delivery');
});

test('can mark delivery as delivered with payment', function () {
    $order = DeliveryOrder::create([
        'order_number' => 'DEL-20260101-0002',
        'customer_name' => 'Test', 'address' => 'Test St',
        'scheduled_date' => today(), 'status' => 'out_for_delivery',
        'total_amount' => 100, 'amount_paid' => 0,
        'payment_method' => 'cash', 'user_id' => $this->admin->id,
    ]);

    $this->patch("/deliveries/{$order->id}/status", [
        'status' => 'delivered',
        'amount_paid' => 100,
    ]);

    $fresh = $order->fresh();
    expect($fresh->status)->toBe('delivered');
    expect($fresh->delivered_at)->not->toBeNull();
    expect((float) $fresh->amount_paid)->toBe(100.0);
});

test('can cancel a delivery', function () {
    $order = DeliveryOrder::create([
        'order_number' => 'DEL-20260101-0003',
        'customer_name' => 'Test', 'address' => 'Test St',
        'scheduled_date' => today(), 'status' => 'pending',
        'total_amount' => 75, 'amount_paid' => 0,
        'payment_method' => 'cash', 'user_id' => $this->admin->id,
    ]);

    $this->patch("/deliveries/{$order->id}/status", ['status' => 'cancelled']);
    expect($order->fresh()->status)->toBe('cancelled');
});

test('can delete a delivery order', function () {
    $order = DeliveryOrder::create([
        'order_number' => 'DEL-20260101-0004',
        'customer_name' => 'Test', 'address' => 'Test St',
        'scheduled_date' => today(), 'status' => 'pending',
        'total_amount' => 0, 'amount_paid' => 0,
        'payment_method' => 'cash', 'user_id' => $this->admin->id,
    ]);

    $this->delete("/deliveries/{$order->id}")->assertRedirect();
    expect(DeliveryOrder::count())->toBe(0);
});
