<?php

use App\Models\Expense;
use App\Models\Sale;

beforeEach(function () {
    $this->admin = adminUser();
    $this->actingAs($this->admin);
});

test('can export sales as csv', function () {
    Sale::create([
        'sale_number' => 'WRS-20260101-0001',
        'sale_date' => today(),
        'subtotal' => 75, 'discount' => 0, 'total_amount' => 75,
        'payment_method' => 'cash', 'amount_paid' => 100, 'change_amount' => 25,
        'user_id' => $this->admin->id,
    ]);

    $response = $this->get('/export/sales');
    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    expect($response->getContent())->toContain('WRS-20260101-0001');
});

test('can export expenses as csv', function () {
    Expense::create([
        'date' => today(),
        'description' => 'Test Electricity Bill',
        'category' => 'electricity',
        'amount' => 1500,
        'user_id' => $this->admin->id,
    ]);

    $response = $this->get('/export/expenses');
    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    expect($response->getContent())->toContain('Test Electricity Bill');
});

test('can export annual report as csv', function () {
    $response = $this->get('/export/report?year=' . now()->year);
    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    expect($response->getContent())->toContain('January');
    expect($response->getContent())->toContain('December');
});

test('csv export includes header row', function () {
    $response = $this->get('/export/sales');
    $content = $response->getContent();
    expect($content)->toContain('Sale #');
    expect($content)->toContain('Customer');
    expect($content)->toContain('Total');
});

test('csv export attachment header is set', function () {
    $response = $this->get('/export/sales');
    $disposition = $response->headers->get('Content-Disposition');
    expect($disposition)->toContain('attachment');
    expect($disposition)->toContain('.csv');
});
