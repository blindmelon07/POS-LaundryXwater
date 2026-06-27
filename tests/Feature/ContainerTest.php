<?php

use App\Models\Customer;

beforeEach(function () {
    $this->admin = adminUser();
    $this->actingAs($this->admin);
});

test('can view container tracking page', function () {
    $this->get('/containers')->assertOk()
        ->assertInertia(fn ($p) => $p->component('containers/index'));
});

test('container page shows correct summary', function () {
    Customer::create(['name' => 'A', 'type' => 'regular', 'slim_containers' => 3, 'round_containers' => 1, 'is_active' => true]);
    Customer::create(['name' => 'B', 'type' => 'wholesale', 'slim_containers' => 2, 'round_containers' => 2, 'is_active' => true]);

    $this->get('/containers')->assertInertia(
        fn ($p) => $p
            ->where('summary.slim_out', 5)
            ->where('summary.round_out', 3)
            ->where('summary.total_out', 8)
    );
});

test('can update container count for a customer', function () {
    $customer = Customer::create([
        'name' => 'Test', 'type' => 'regular',
        'slim_containers' => 2, 'round_containers' => 1, 'is_active' => true,
    ]);

    $this->put("/containers/{$customer->id}", [
        'slim_containers' => 4,
        'round_containers' => 2,
    ])->assertRedirect();

    expect($customer->fresh()->slim_containers)->toBe(4);
    expect($customer->fresh()->round_containers)->toBe(2);
});

test('container counts cannot be negative', function () {
    $customer = Customer::create(['name' => 'Test', 'type' => 'regular', 'is_active' => true]);

    $this->put("/containers/{$customer->id}", [
        'slim_containers' => -1,
        'round_containers' => 0,
    ])->assertSessionHasErrors('slim_containers');
});
