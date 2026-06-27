<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->admin = adminUser();
    $this->actingAs($this->admin);
});

test('admin can view users page', function () {
    $this->get('/users')->assertOk()
        ->assertInertia(fn ($p) => $p->component('users/index')->has('users')->has('roles'));
});

test('cashier cannot view users page', function () {
    $cashier = cashierUser();
    $this->actingAs($cashier);
    $this->get('/users')->assertForbidden();
});

test('admin can create a user', function () {
    $this->post('/users', [
        'name' => 'New Cashier',
        'email' => 'cashier@test.com',
        'password' => 'password123',
        'role' => 'cashier',
    ])->assertRedirect();

    $user = User::where('email', 'cashier@test.com')->first();
    expect($user)->not->toBeNull();
    expect($user->hasRole('cashier'))->toBeTrue();
});

test('admin can assign a different role to a user', function () {
    $user = User::factory()->create();
    $cashierRole = Role::firstOrCreate(['name' => 'cashier']);
    $user->assignRole('cashier');

    $this->put("/users/{$user->id}/role", [
        'role' => 'admin',
    ])->assertRedirect();

    expect($user->fresh()->hasRole('admin'))->toBeTrue();
    expect($user->fresh()->hasRole('cashier'))->toBeFalse();
});

test('admin can update user info', function () {
    $user = User::factory()->create(['name' => 'Old Name']);

    $this->put("/users/{$user->id}", [
        'name' => 'New Name',
        'email' => $user->email,
    ])->assertRedirect();

    expect($user->fresh()->name)->toBe('New Name');
});

test('admin cannot delete their own account', function () {
    $this->delete("/users/{$this->admin->id}")->assertRedirect();
    expect(User::find($this->admin->id))->not->toBeNull();
});

test('admin can delete another user', function () {
    $user = User::factory()->create();
    $this->delete("/users/{$user->id}")->assertRedirect();
    expect(User::find($user->id))->toBeNull();
});

test('user creation requires name email password and role', function () {
    $this->post('/users', [])->assertSessionHasErrors(['name', 'email', 'password', 'role']);
});

test('email must be unique when creating user', function () {
    User::factory()->create(['email' => 'taken@test.com']);

    $this->post('/users', [
        'name' => 'Test', 'email' => 'taken@test.com',
        'password' => 'password123', 'role' => 'cashier',
    ])->assertSessionHasErrors('email');
});
