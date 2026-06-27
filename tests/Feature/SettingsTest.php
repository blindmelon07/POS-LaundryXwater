<?php

use App\Models\Setting;

beforeEach(function () {
    $this->admin = adminUser();
    $this->actingAs($this->admin);
});

test('admin can view business settings page', function () {
    $this->get('/business-settings')->assertOk()
        ->assertInertia(fn ($p) => $p->component('settings-business/index')->has('settings'));
});

test('cashier cannot access business settings', function () {
    $cashier = cashierUser();
    $this->actingAs($cashier);
    $this->get('/business-settings')->assertForbidden();
});

test('admin can save business settings', function () {
    $this->post('/business-settings', [
        'business_name' => 'Jaz Pure Water Station',
        'business_address' => '123 Water St, Cebu City',
        'business_phone' => '09171234567',
        'business_email' => 'info@jazpure.com',
        'receipt_footer' => 'Thank you!',
        'tax_rate' => '0',
        'currency' => '₱',
    ])->assertRedirect();

    expect(Setting::get('business_name'))->toBe('Jaz Pure Water Station');
    expect(Setting::get('business_address'))->toBe('123 Water St, Cebu City');
});

test('settings business name is required', function () {
    $this->post('/business-settings', [
        'business_name' => '',
    ])->assertSessionHasErrors('business_name');
});

test('setting helper can get and set values', function () {
    Setting::set('test_key', 'test_value');
    expect(Setting::get('test_key'))->toBe('test_value');
});

test('setting get returns default when key not found', function () {
    expect(Setting::get('nonexistent', 'default_val'))->toBe('default_val');
});

test('settings are cached after first read', function () {
    Setting::set('cached_key', 'cached_value');

    // First call populates cache
    $first = Setting::get('cached_key');
    // Simulate direct DB update bypassing cache
    Setting::where('key', 'cached_key')->update(['value' => 'new_value']);
    // Should still return cached value
    $second = Setting::get('cached_key');

    expect($first)->toBe($second);
});

test('all settings returns merged defaults and saved values', function () {
    Setting::set('business_name', 'Custom Name');

    $all = Setting::all_settings();

    expect($all['business_name'])->toBe('Custom Name');
    expect($all)->toHaveKey('receipt_footer');
    expect($all)->toHaveKey('currency');
});
