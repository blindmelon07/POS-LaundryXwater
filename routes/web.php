<?php

use App\Http\Controllers\ContainerController;
use App\Http\Controllers\LoadingLogController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryOrderController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LaundryInventoryController;
use App\Http\Controllers\LaundryOrderController;
use App\Http\Controllers\LaundryServiceController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ZReportController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware('can:use pos')->group(function () {
        Route::get('pos', [PosController::class, 'index'])->name('pos.index');
        Route::post('pos', [PosController::class, 'store'])->name('pos.store');
    });

    Route::middleware('can:view sales')->group(function () {
        Route::get('sales', [SaleController::class, 'index'])->name('sales.index');
        Route::get('sales/{sale}', [SaleController::class, 'show'])->name('sales.show');
    });
    Route::delete('sales/{sale}', [SaleController::class, 'destroy'])->name('sales.destroy')->middleware('can:delete sales');

    Route::middleware('can:manage products')->group(function () {
        Route::get('products', [ProductController::class, 'index'])->name('products.index');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    });

    Route::middleware('can:manage expenses')->group(function () {
        Route::get('expenses', [ExpenseController::class, 'index'])->name('expenses.index');
        Route::post('expenses', [ExpenseController::class, 'store'])->name('expenses.store');
        Route::put('expenses/{expense}', [ExpenseController::class, 'update'])->name('expenses.update');
        Route::delete('expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');
    });

    Route::middleware('can:manage inventory')->group(function () {
        Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::post('inventory', [InventoryController::class, 'store'])->name('inventory.store');
        Route::put('inventory/{inventoryItem}', [InventoryController::class, 'update'])->name('inventory.update');
        Route::post('inventory/{inventoryItem}/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');
        Route::delete('inventory/{inventoryItem}', [InventoryController::class, 'destroy'])->name('inventory.destroy');
    });

    Route::get('reports', [ReportController::class, 'index'])->name('reports.index')->middleware('can:view reports');
    Route::get('z-report', [ZReportController::class, 'index'])->name('z-report.index')->middleware('can:view reports');

    // Customers
    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    // Containers
    Route::get('containers', [ContainerController::class, 'index'])->name('containers.index');
    Route::put('containers/{customer}', [ContainerController::class, 'updateContainers'])->name('containers.update');

    // Deliveries — rider can view and update status; cashier/admin can create and delete
    Route::middleware('can:view deliveries')->group(function () {
        Route::get('deliveries', [DeliveryOrderController::class, 'index'])->name('deliveries.index');
        Route::patch('deliveries/{deliveryOrder}/status', [DeliveryOrderController::class, 'updateStatus'])->name('deliveries.status');
    });
    Route::middleware('can:manage deliveries')->group(function () {
        Route::post('deliveries', [DeliveryOrderController::class, 'store'])->name('deliveries.store');
        Route::delete('deliveries/{deliveryOrder}', [DeliveryOrderController::class, 'destroy'])->name('deliveries.destroy');
    });

    // Loading Log
    Route::middleware('can:manage loading')->group(function () {
        Route::get('loading-log', [LoadingLogController::class, 'index'])->name('loading-log.index');
        Route::post('loading-log', [LoadingLogController::class, 'store'])->name('loading-log.store');
        Route::delete('loading-log/{loadingLog}', [LoadingLogController::class, 'destroy'])->name('loading-log.destroy');
    });

    // Exports
    Route::get('export/sales', [ExportController::class, 'salesCsv'])->name('export.sales');
    Route::get('export/expenses', [ExportController::class, 'expensesCsv'])->name('export.expenses');
    Route::get('export/report', [ExportController::class, 'reportCsv'])->name('export.report');

    // Business Settings
    Route::middleware('can:manage users')->group(function () {
        Route::get('business-settings', [SettingsController::class, 'index'])->name('settings.business');
        Route::post('business-settings', [SettingsController::class, 'update'])->name('settings.business.update');
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::put('users/{user}/role', [UserController::class, 'assignRole'])->name('users.role');
    });

    // Laundry
    Route::prefix('laundry')->name('laundry.')->group(function () {
        Route::get('orders', [LaundryOrderController::class, 'index'])->name('orders.index');
        Route::post('orders', [LaundryOrderController::class, 'store'])->name('orders.store');
        Route::get('orders/{laundryOrder}', [LaundryOrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{laundryOrder}/status', [LaundryOrderController::class, 'updateStatus'])->name('orders.status');
        Route::delete('orders/{laundryOrder}', [LaundryOrderController::class, 'destroy'])->name('orders.destroy');

        Route::get('services', [LaundryServiceController::class, 'index'])->name('services.index');
        Route::post('services', [LaundryServiceController::class, 'store'])->name('services.store');
        Route::put('services/{laundryService}', [LaundryServiceController::class, 'update'])->name('services.update');
        Route::delete('services/{laundryService}', [LaundryServiceController::class, 'destroy'])->name('services.destroy');

        Route::get('inventory', [LaundryInventoryController::class, 'index'])->name('inventory.index');
        Route::post('inventory', [LaundryInventoryController::class, 'store'])->name('inventory.store');
        Route::put('inventory/{inventoryItem}', [LaundryInventoryController::class, 'update'])->name('inventory.update');
        Route::post('inventory/{inventoryItem}/adjust', [LaundryInventoryController::class, 'adjust'])->name('inventory.adjust');
        Route::delete('inventory/{inventoryItem}', [LaundryInventoryController::class, 'destroy'])->name('inventory.destroy');
    });
});

require __DIR__.'/settings.php';
