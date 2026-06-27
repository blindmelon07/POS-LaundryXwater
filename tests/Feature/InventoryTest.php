<?php

use App\Models\InventoryAdjustment;
use App\Models\InventoryItem;

beforeEach(function () {
    $this->admin = adminUser();
    $this->actingAs($this->admin);
});

test('can view inventory page', function () {
    $this->get('/inventory')->assertOk()
        ->assertInertia(fn ($p) => $p->component('inventory/index'));
});

test('can create an inventory item', function () {
    $this->post('/inventory', [
        'name' => 'Slim Containers',
        'category' => 'Containers',
        'quantity' => 50,
        'unit' => 'pcs',
        'min_quantity' => 10,
        'cost_per_unit' => 150,
    ])->assertRedirect();

    expect(InventoryItem::count())->toBe(1);
    $item = InventoryItem::first();
    expect($item->name)->toBe('Slim Containers');
    expect((float) $item->quantity)->toBe(50.0);
});

test('creating inventory item logs initial stock adjustment', function () {
    $this->post('/inventory', [
        'name' => 'Test Item', 'category' => 'Test',
        'quantity' => 20, 'unit' => 'pcs',
    ]);

    expect(InventoryAdjustment::count())->toBe(1);
    $adj = InventoryAdjustment::first();
    expect($adj->type)->toBe('add');
    expect($adj->reason)->toBe('Initial stock');
    expect((float) $adj->quantity_before)->toBe(0.0);
    expect((float) $adj->quantity_after)->toBe(20.0);
});

test('no adjustment logged when creating item with zero quantity', function () {
    $this->post('/inventory', [
        'name' => 'Empty Item', 'category' => 'Test',
        'quantity' => 0, 'unit' => 'pcs',
    ]);
    expect(InventoryAdjustment::count())->toBe(0);
});

test('can add stock via adjustment', function () {
    $item = InventoryItem::create([
        'name' => 'Test', 'category' => 'Test', 'quantity' => 10, 'unit' => 'pcs',
    ]);

    $this->post("/inventory/{$item->id}/adjust", [
        'type' => 'add',
        'quantity' => 5,
        'reason' => 'Purchased from supplier',
    ]);

    expect((float) $item->fresh()->quantity)->toBe(15.0);
    expect(InventoryAdjustment::where('type', 'add')->count())->toBe(1);
});

test('can remove stock via adjustment', function () {
    $item = InventoryItem::create([
        'name' => 'Test', 'category' => 'Test', 'quantity' => 10, 'unit' => 'pcs',
    ]);

    $this->post("/inventory/{$item->id}/adjust", [
        'type' => 'remove',
        'quantity' => 3,
        'reason' => 'Damaged',
    ]);

    expect((float) $item->fresh()->quantity)->toBe(7.0);
});

test('stock cannot go below zero when removing', function () {
    $item = InventoryItem::create([
        'name' => 'Test', 'category' => 'Test', 'quantity' => 5, 'unit' => 'pcs',
    ]);

    $this->post("/inventory/{$item->id}/adjust", [
        'type' => 'remove', 'quantity' => 10, 'reason' => 'Test',
    ]);

    expect((float) $item->fresh()->quantity)->toBe(0.0);
});

test('can set exact quantity via adjustment', function () {
    $item = InventoryItem::create([
        'name' => 'Test', 'category' => 'Test', 'quantity' => 100, 'unit' => 'pcs',
    ]);

    $this->post("/inventory/{$item->id}/adjust", [
        'type' => 'adjustment', 'quantity' => 42, 'reason' => 'Physical count',
    ]);

    expect((float) $item->fresh()->quantity)->toBe(42.0);
});

test('adjustment requires a reason', function () {
    $item = InventoryItem::create([
        'name' => 'Test', 'category' => 'Test', 'quantity' => 10, 'unit' => 'pcs',
    ]);

    $this->post("/inventory/{$item->id}/adjust", [
        'type' => 'add', 'quantity' => 5, 'reason' => '',
    ])->assertSessionHasErrors('reason');
});

test('is low stock when quantity at or below min', function () {
    $item = InventoryItem::create([
        'name' => 'Test', 'category' => 'Test',
        'quantity' => 5, 'unit' => 'pcs', 'min_quantity' => 10,
    ]);
    expect($item->isLowStock())->toBeTrue();
});

test('total value accessor calculates correctly', function () {
    $item = InventoryItem::create([
        'name' => 'Test', 'category' => 'Test',
        'quantity' => 10, 'unit' => 'pcs', 'cost_per_unit' => 150,
    ]);
    expect($item->total_value)->toBe(1500.0);
});
