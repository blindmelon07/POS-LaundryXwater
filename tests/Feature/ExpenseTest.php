<?php

use App\Models\Expense;

beforeEach(function () {
    $this->admin = adminUser();
    $this->actingAs($this->admin);
});

test('can view expenses page', function () {
    $this->get('/expenses')->assertOk()
        ->assertInertia(fn ($p) => $p->component('expenses/index'));
});

test('can create an expense', function () {
    $this->post('/expenses', [
        'date' => today()->toDateString(),
        'description' => 'Electricity bill',
        'category' => 'electricity',
        'amount' => 1500.00,
        'receipt_number' => 'REC-001',
    ])->assertRedirect();

    expect(Expense::count())->toBe(1);
    $expense = Expense::first();
    expect($expense->description)->toBe('Electricity bill');
    expect($expense->amount)->toBe('1500.00');
    expect($expense->user_id)->toBe($this->admin->id);
});

test('expense creation requires date description category and amount', function () {
    $this->post('/expenses', [])->assertSessionHasErrors(['date', 'description', 'category', 'amount']);
});

test('expense category must be valid', function () {
    $this->post('/expenses', [
        'date' => today()->toDateString(),
        'description' => 'Test',
        'category' => 'invalid',
        'amount' => 100,
    ])->assertSessionHasErrors('category');
});

test('can update an expense', function () {
    $expense = Expense::create([
        'date' => today(),
        'description' => 'Old description',
        'category' => 'rent',
        'amount' => 5000,
        'user_id' => $this->admin->id,
    ]);

    $this->put("/expenses/{$expense->id}", [
        'date' => today()->toDateString(),
        'description' => 'Updated rent',
        'category' => 'rent',
        'amount' => 5500,
    ]);

    expect($expense->fresh()->description)->toBe('Updated rent');
    expect($expense->fresh()->amount)->toBe('5500.00');
});

test('can delete an expense', function () {
    $expense = Expense::create([
        'date' => today(), 'description' => 'To delete',
        'category' => 'other', 'amount' => 100,
        'user_id' => $this->admin->id,
    ]);

    $this->delete("/expenses/{$expense->id}")->assertRedirect();
    expect(Expense::count())->toBe(0);
});

test('category label accessor returns readable name', function () {
    $expense = Expense::create([
        'date' => today(), 'description' => 'Test', 'category' => 'water_supply',
        'amount' => 500, 'user_id' => $this->admin->id,
    ]);

    expect($expense->category_label)->toBe('Water Supply / Chemicals');
});

test('cashier can manage expenses', function () {
    $cashier = cashierUser();
    $this->actingAs($cashier);

    $this->get('/expenses')->assertOk();
    $this->post('/expenses', [
        'date' => today()->toDateString(),
        'description' => 'Fuel', 'category' => 'delivery', 'amount' => 300,
    ])->assertRedirect();
});
