<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\DeliveryOrder;
use App\Models\DeliveryOrderItem;
use App\Models\Expense;
use App\Models\InventoryAdjustment;
use App\Models\InventoryItem;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = User::where('email', 'admin@pos.com')->first() ?? User::first();

        // ── Products (by name to avoid type collision) ────────────────────────
        $slim_w   = Product::where('name', 'Slim/Round Wholesale')->first();
        $slim_r   = Product::where('name', 'Slim/Round Regular')->first();
        $slim_c   = Product::where('name', 'Slim/Round Commercial')->first();
        $walkin   = Product::where('name', 'Slim/Round Walk-in')->first();
        $gallon_w = Product::where('name', 'Slim/Round Gallon w/ Water')->first();

        if (!$slim_w || !$slim_r || !$slim_c) {
            $this->command->warn('Products not found. Run ProductSeeder first.');
            return;
        }

        // ── Business Settings ─────────────────────────────────────────────────
        Setting::firstOrCreate(['key' => 'business_name'],    ['value' => 'Jaz Pure Water Refilling Station']);
        Setting::firstOrCreate(['key' => 'business_address'], ['value' => '123 Purity St, Barangay Water, Cebu City']);
        Setting::firstOrCreate(['key' => 'business_phone'],   ['value' => '09171234567']);
        Setting::firstOrCreate(['key' => 'business_email'],   ['value' => 'jazpure@email.com']);
        Setting::firstOrCreate(['key' => 'receipt_footer'],   ['value' => 'Thank you for choosing Jaz Pure! Stay hydrated!']);
        Setting::firstOrCreate(['key' => 'tax_rate'],         ['value' => '0']);
        Setting::firstOrCreate(['key' => 'currency'],         ['value' => '₱']);

        // ── Customers ─────────────────────────────────────────────────────────
        $customers = [
            Customer::firstOrCreate(['name' => 'Maria Santos'], [
                'phone' => '09171234567', 'address' => '12 Mango Ave, Cebu City',
                'type' => 'regular', 'slim_containers' => 2, 'round_containers' => 0,
            ]),
            Customer::firstOrCreate(['name' => 'Juan dela Cruz'], [
                'phone' => '09281234567', 'address' => '45 Colon St, Cebu City',
                'type' => 'wholesale', 'slim_containers' => 5, 'round_containers' => 2,
            ]),
            Customer::firstOrCreate(['name' => 'Rose Reyes'], [
                'phone' => '09351234567', 'address' => '78 Osmena Blvd, Cebu City',
                'type' => 'commercial', 'slim_containers' => 0, 'round_containers' => 3,
            ]),
            Customer::firstOrCreate(['name' => 'Pedro Penduko'], [
                'phone' => '09421234567', 'address' => '99 Jakosalem St, Cebu City',
                'type' => 'regular', 'slim_containers' => 1, 'round_containers' => 0,
            ]),
            Customer::firstOrCreate(['name' => 'Ana Lim'], [
                'phone' => '09561234567', 'address' => '14 Sanciangko St, Cebu City',
                'type' => 'wholesale', 'slim_containers' => 3, 'round_containers' => 1,
            ]),
        ];

        // ── Water Inventory Items ─────────────────────────────────────────────
        $inventoryItems = [
            [
                'name' => 'Slim Containers (19L)', 'category' => 'Containers',
                'quantity' => 45, 'unit' => 'pcs', 'min_quantity' => 10,
                'cost_per_unit' => 180, 'container_type' => 'slim',
            ],
            [
                'name' => 'Round Containers (5gal)', 'category' => 'Containers',
                'quantity' => 28, 'unit' => 'pcs', 'min_quantity' => 8,
                'cost_per_unit' => 220, 'container_type' => 'round',
            ],
            [
                'name' => 'Salt', 'category' => 'Water Supply',
                'quantity' => 12, 'unit' => 'kg', 'min_quantity' => 5,
                'cost_per_unit' => 35,
            ],
            [
                'name' => 'Filter Cartridges', 'category' => 'Supplies',
                'quantity' => 6, 'unit' => 'pcs', 'min_quantity' => 2,
                'cost_per_unit' => 450,
            ],
            [
                'name' => 'Sealing Caps', 'category' => 'Packaging',
                'quantity' => 200, 'unit' => 'pcs', 'min_quantity' => 50,
                'cost_per_unit' => 2,
            ],
        ];

        foreach ($inventoryItems as $data) {
            if (!InventoryItem::where('name', $data['name'])->where('business', 'water')->exists()) {
                $item = InventoryItem::create(array_merge($data, ['business' => 'water']));
                InventoryAdjustment::create([
                    'inventory_item_id' => $item->id,
                    'type'              => 'add',
                    'quantity'          => $data['quantity'],
                    'quantity_before'   => 0,
                    'quantity_after'    => $data['quantity'],
                    'reason'            => 'Initial stock',
                    'user_id'           => $adminUser->id,
                ]);
            }
        }

        // ── Sales (Last 7 days) ───────────────────────────────────────────────
        if (Sale::count() === 0) {
            $salesData = [
                ['days_ago' => 6, 'customer' => $customers[0], 'method' => 'cash',  'items' => [[$slim_r, 4]]],
                ['days_ago' => 6, 'customer' => $customers[1], 'method' => 'gcash', 'items' => [[$slim_w, 10]]],
                ['days_ago' => 5, 'customer' => null,          'method' => 'cash',  'items' => [[$slim_r, 2]]],
                ['days_ago' => 5, 'customer' => $customers[2], 'method' => 'card',  'items' => [[$slim_c, 6]]],
                ['days_ago' => 4, 'customer' => $customers[3], 'method' => 'cash',  'items' => [[$slim_r, 3]]],
                ['days_ago' => 4, 'customer' => $customers[0], 'method' => 'gcash', 'items' => [[$slim_r, 4]]],
                ['days_ago' => 3, 'customer' => $customers[1], 'method' => 'cash',  'items' => [[$slim_w, 8]]],
                ['days_ago' => 3, 'customer' => null,          'method' => 'cash',  'items' => [[$walkin ?? $slim_r, 2]]],
                ['days_ago' => 2, 'customer' => $customers[4], 'method' => 'gcash', 'items' => [[$slim_w, 6]]],
                ['days_ago' => 2, 'customer' => $customers[2], 'method' => 'cash',  'items' => [[$slim_c, 4]]],
                ['days_ago' => 1, 'customer' => $customers[0], 'method' => 'cash',  'items' => [[$slim_r, 5]]],
                ['days_ago' => 1, 'customer' => null,          'method' => 'card',  'items' => [[$slim_r, 3]]],
                ['days_ago' => 0, 'customer' => $customers[1], 'method' => 'gcash', 'items' => [[$slim_w, 12]]],
                ['days_ago' => 0, 'customer' => $customers[3], 'method' => 'cash',  'items' => [[$slim_r, 2]]],
                ['days_ago' => 0, 'customer' => null,          'method' => 'cash',  'items' => [[$slim_r, 4]]],
            ];

            $txnCount = [];
            foreach ($salesData as $s) {
                $date = today()->subDays($s['days_ago']);
                $key  = $date->toDateString();
                $txnCount[$key] = ($txnCount[$key] ?? 0) + 1;

                $subtotal = array_reduce($s['items'], fn ($c, $i) => $c + $i[0]->price * $i[1], 0);

                $sale = Sale::create([
                    'sale_number'    => 'WRS-' . $date->format('Ymd') . '-' . str_pad($txnCount[$key], 4, '0', STR_PAD_LEFT),
                    'customer_id'    => $s['customer']?->id,
                    'customer_name'  => $s['customer']?->name ?? 'Walk-in',
                    'sale_date'      => $date,
                    'subtotal'       => $subtotal,
                    'discount'       => 0,
                    'total_amount'   => $subtotal,
                    'payment_method' => $s['method'],
                    'amount_paid'    => $subtotal + ($s['method'] === 'cash' ? rand(0, 50) : 0),
                    'change_amount'  => $s['method'] === 'cash' ? rand(0, 50) : 0,
                    'user_id'        => $adminUser->id,
                    'created_at'     => $date->copy()->setTime(rand(8, 17), rand(0, 59)),
                    'updated_at'     => $date->copy()->setTime(rand(8, 17), rand(0, 59)),
                ]);

                foreach ($s['items'] as [$product, $qty]) {
                    SaleItem::create([
                        'sale_id'             => $sale->id,
                        'product_id'          => $product->id,
                        'product_name'        => $product->name,
                        'product_type'        => $product->type,
                        'unit_price'          => $product->price,
                        'quantity'            => $qty,
                        'containers_returned' => 0,
                        'subtotal'            => $product->price * $qty,
                    ]);
                }
            }
        }

        // ── Expenses (Last 7 days) — using new categories ─────────────────────
        if (Expense::count() === 0) {
            $expensesData = [
                ['days_ago' => 6, 'desc' => 'Prime Water supply bill',     'cat' => 'water_bill',     'amount' => 1800],
                ['days_ago' => 5, 'desc' => 'Soreco electricity bill',     'cat' => 'electricity',    'amount' => 3200],
                ['days_ago' => 4, 'desc' => 'Fuel for delivery',           'cat' => 'transportation', 'amount' => 450 ],
                ['days_ago' => 3, 'desc' => 'Filter cartridge replacement','cat' => 'filter',         'amount' => 900 ],
                ['days_ago' => 2, 'desc' => 'Sealing caps restock',        'cat' => 'other_supplies', 'amount' => 320 ],
                ['days_ago' => 1, 'desc' => 'Salt restock',               'cat' => 'salt',           'amount' => 420 ],
                ['days_ago' => 1, 'desc' => 'Weekly salary - Cashier',    'cat' => 'salaries',       'amount' => 2500],
                ['days_ago' => 0, 'desc' => 'Transportation fuel',        'cat' => 'transportation', 'amount' => 380 ],
            ];

            foreach ($expensesData as $e) {
                Expense::create([
                    'date'        => today()->subDays($e['days_ago']),
                    'description' => $e['desc'],
                    'category'    => $e['cat'],
                    'amount'      => $e['amount'],
                    'user_id'     => $adminUser->id,
                ]);
            }
        }

        // ── Delivery Orders ───────────────────────────────────────────────────
        if (DeliveryOrder::count() === 0) {
            $deliveryData = [
                ['customer' => $customers[1], 'date' => today(),           'time' => '09:00', 'status' => 'out_for_delivery', 'items' => [[$slim_w, 8]]],
                ['customer' => $customers[4], 'date' => today(),           'time' => '14:00', 'status' => 'pending',          'items' => [[$slim_w, 6]]],
                ['customer' => $customers[2], 'date' => today()->addDay(), 'time' => '10:00', 'status' => 'pending',          'items' => [[$slim_c, 4]]],
                ['customer' => $customers[0], 'date' => today()->subDay(), 'time' => '15:00', 'status' => 'delivered',        'items' => [[$slim_r, 4]]],
            ];

            $delCount = [];
            foreach ($deliveryData as $d) {
                $date = $d['date'];
                $key  = $date->toDateString();
                $delCount[$key] = ($delCount[$key] ?? 0) + 1;
                $total = array_reduce($d['items'], fn ($c, $i) => $c + $i[0]->price * $i[1], 0);

                $order = DeliveryOrder::create([
                    'order_number'   => 'DEL-' . $date->format('Ymd') . '-' . str_pad($delCount[$key], 4, '0', STR_PAD_LEFT),
                    'customer_id'    => $d['customer']->id,
                    'customer_name'  => $d['customer']->name,
                    'address'        => $d['customer']->address,
                    'phone'          => $d['customer']->phone,
                    'scheduled_date' => $date,
                    'scheduled_time' => $d['time'],
                    'status'         => $d['status'],
                    'total_amount'   => $total,
                    'amount_paid'    => $d['status'] === 'delivered' ? $total : 0,
                    'payment_method' => 'cash',
                    'delivered_at'   => $d['status'] === 'delivered' ? now()->subDay() : null,
                    'user_id'        => $adminUser->id,
                ]);

                foreach ($d['items'] as [$product, $qty]) {
                    DeliveryOrderItem::create([
                        'delivery_order_id' => $order->id,
                        'product_id'        => $product->id,
                        'product_name'      => $product->name,
                        'product_type'      => $product->type,
                        'unit_price'        => $product->price,
                        'quantity'          => $qty,
                        'subtotal'          => $product->price * $qty,
                    ]);
                }
            }
        }

        $this->command->info('✅ Sample data seeded:');
        $this->command->info('   • ' . count($customers) . ' customers');
        $this->command->info('   • ' . Sale::count() . ' sales');
        $this->command->info('   • ' . Expense::count() . ' expenses');
        $this->command->info('   • ' . DeliveryOrder::count() . ' delivery orders');
        $this->command->info('   • ' . InventoryItem::count() . ' inventory items');
    }
}
