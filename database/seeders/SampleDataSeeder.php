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
use Illuminate\Support\Facades\Hash;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = User::where('email', 'admin@pos.com')->first()
            ?? User::first();

        // ── Products ────────────────────────────────────────────────────────
        $products = Product::all()->keyBy('type');
        $slim_w  = $products['slim_wholesale'];
        $slim_r  = $products['slim_regular'];
        $slim_c  = $products['slim_commercial'];
        $cont_s  = $products['container_slim'];
        $cont_r  = $products['container_round'];
        $delivery = $products['delivery'];

        // ── Business Settings ────────────────────────────────────────────────
        Setting::set('business_name', 'Jaz Pure Water Refilling Station');
        Setting::set('business_address', '123 Purity St, Barangay Water, Cebu City');
        Setting::set('business_phone', '09171234567');
        Setting::set('business_email', 'jazpure@email.com');
        Setting::set('receipt_footer', 'Thank you for choosing Jaz Pure! Stay hydrated!');

        // ── Customers ────────────────────────────────────────────────────────
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

        // ── Inventory Items ──────────────────────────────────────────────────
        $items = [
            ['name' => 'Slim Containers (19L)', 'category' => 'Containers', 'quantity' => 45, 'unit' => 'pcs', 'min_quantity' => 10, 'cost_per_unit' => 180],
            ['name' => 'Round Containers (5gal)', 'category' => 'Containers', 'quantity' => 28, 'unit' => 'pcs', 'min_quantity' => 8, 'cost_per_unit' => 220],
            ['name' => 'Mineral Water Chemicals', 'category' => 'Water Supply', 'quantity' => 12, 'unit' => 'kg', 'min_quantity' => 5, 'cost_per_unit' => 350],
            ['name' => 'Filter Cartridges', 'category' => 'Supplies', 'quantity' => 6, 'unit' => 'pcs', 'min_quantity' => 2, 'cost_per_unit' => 450],
            ['name' => 'Sealing Caps', 'category' => 'Packaging', 'quantity' => 200, 'unit' => 'pcs', 'min_quantity' => 50, 'cost_per_unit' => 2],
            ['name' => 'Distilled Water (raw)', 'category' => 'Water Supply', 'quantity' => 8, 'unit' => 'gal', 'min_quantity' => 20, 'cost_per_unit' => 15],
        ];

        foreach ($items as $itemData) {
            $existing = InventoryItem::where('name', $itemData['name'])->first();
            if (!$existing) {
                $item = InventoryItem::create($itemData);
                InventoryAdjustment::create([
                    'inventory_item_id' => $item->id,
                    'type' => 'add',
                    'quantity' => $itemData['quantity'],
                    'quantity_before' => 0,
                    'quantity_after' => $itemData['quantity'],
                    'reason' => 'Initial stock from seeder',
                    'user_id' => $adminUser->id,
                ]);
            }
        }

        // ── Sales Transactions (Last 7 days) ─────────────────────────────────
        $salesData = [
            ['days_ago' => 6, 'customer' => $customers[0], 'method' => 'cash', 'items' => [[$slim_r, 4, 0], [$cont_s, 1, 0]]],
            ['days_ago' => 6, 'customer' => $customers[1], 'method' => 'gcash', 'items' => [[$slim_w, 10, 0], [$delivery, 1, 0]]],
            ['days_ago' => 5, 'customer' => null, 'method' => 'cash', 'items' => [[$slim_r, 2, 0]]],
            ['days_ago' => 5, 'customer' => $customers[2], 'method' => 'card', 'items' => [[$slim_c, 6, 0], [$cont_r, 2, 0]]],
            ['days_ago' => 4, 'customer' => $customers[3], 'method' => 'cash', 'items' => [[$slim_r, 3, 1]]],
            ['days_ago' => 4, 'customer' => $customers[0], 'method' => 'gcash', 'items' => [[$slim_r, 4, 0], [$delivery, 1, 0]]],
            ['days_ago' => 3, 'customer' => $customers[1], 'method' => 'cash', 'items' => [[$slim_w, 8, 2]]],
            ['days_ago' => 3, 'customer' => null, 'method' => 'cash', 'items' => [[$slim_r, 2, 0]]],
            ['days_ago' => 2, 'customer' => $customers[4], 'method' => 'gcash', 'items' => [[$slim_w, 6, 1], [$cont_s, 2, 0]]],
            ['days_ago' => 2, 'customer' => $customers[2], 'method' => 'cash', 'items' => [[$slim_c, 4, 0]]],
            ['days_ago' => 1, 'customer' => $customers[0], 'method' => 'cash', 'items' => [[$slim_r, 5, 2]]],
            ['days_ago' => 1, 'customer' => null, 'method' => 'card', 'items' => [[$slim_r, 3, 0]]],
            ['days_ago' => 0, 'customer' => $customers[1], 'method' => 'gcash', 'items' => [[$slim_w, 12, 3], [$delivery, 2, 0]]],
            ['days_ago' => 0, 'customer' => $customers[3], 'method' => 'cash', 'items' => [[$slim_r, 2, 0], [$cont_s, 1, 1]]],
            ['days_ago' => 0, 'customer' => null, 'method' => 'cash', 'items' => [[$slim_r, 4, 0]]],
        ];

        $txnCount = [];
        foreach ($salesData as $s) {
            $date = today()->subDays($s['days_ago']);
            $key = $date->toDateString();
            $txnCount[$key] = ($txnCount[$key] ?? 0) + 1;

            $subtotal = array_reduce($s['items'], fn ($carry, $i) => $carry + $i[0]->price * $i[1], 0);
            $total = $subtotal;
            $saleNumber = 'WRS-' . $date->format('Ymd') . '-' . str_pad($txnCount[$key], 4, '0', STR_PAD_LEFT);

            $sale = Sale::create([
                'sale_number' => $saleNumber,
                'customer_id' => $s['customer']?->id,
                'customer_name' => $s['customer']?->name ?? 'Walk-in',
                'sale_date' => $date,
                'subtotal' => $subtotal,
                'discount' => 0,
                'total_amount' => $total,
                'payment_method' => $s['method'],
                'amount_paid' => $total + ($s['method'] === 'cash' ? rand(0, 50) : 0),
                'change_amount' => $s['method'] === 'cash' ? rand(0, 50) : 0,
                'user_id' => $adminUser->id,
                'created_at' => $date->copy()->setTime(rand(8, 17), rand(0, 59)),
                'updated_at' => $date->copy()->setTime(rand(8, 17), rand(0, 59)),
            ]);

            foreach ($s['items'] as [$product, $qty, $returned]) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_type' => $product->type,
                    'unit_price' => $product->price,
                    'quantity' => $qty,
                    'containers_returned' => $returned,
                    'subtotal' => $product->price * $qty,
                ]);
            }
        }

        // ── Expenses (Last 7 days) ───────────────────────────────────────────
        $expensesData = [
            ['days_ago' => 6, 'desc' => 'Mineral water chemicals restock', 'cat' => 'water_supply', 'amount' => 1800],
            ['days_ago' => 5, 'desc' => 'Electricity bill', 'cat' => 'electricity', 'amount' => 3200],
            ['days_ago' => 4, 'desc' => 'Fuel for delivery', 'cat' => 'delivery', 'amount' => 450],
            ['days_ago' => 3, 'desc' => 'Filter cartridge replacement', 'cat' => 'maintenance', 'amount' => 900],
            ['days_ago' => 2, 'desc' => 'Sealing caps restock', 'cat' => 'packaging', 'amount' => 320],
            ['days_ago' => 1, 'desc' => 'Weekly salary - Cashier', 'cat' => 'salaries', 'amount' => 2500],
            ['days_ago' => 0, 'desc' => 'Store rent (weekly share)', 'cat' => 'rent', 'amount' => 2000],
            ['days_ago' => 0, 'desc' => 'Fuel for delivery', 'cat' => 'delivery', 'amount' => 380],
        ];

        foreach ($expensesData as $e) {
            Expense::create([
                'date' => today()->subDays($e['days_ago']),
                'description' => $e['desc'],
                'category' => $e['cat'],
                'amount' => $e['amount'],
                'user_id' => $adminUser->id,
            ]);
        }

        // ── Delivery Orders ──────────────────────────────────────────────────
        $deliveryOrders = [
            [
                'customer' => $customers[1],
                'scheduled_date' => today(),
                'scheduled_time' => '09:00',
                'status' => 'out_for_delivery',
                'items' => [[$slim_w, 8], [$delivery, 1]],
                'method' => 'cash',
            ],
            [
                'customer' => $customers[4],
                'scheduled_date' => today(),
                'scheduled_time' => '14:00',
                'status' => 'pending',
                'items' => [[$slim_w, 6], [$delivery, 1]],
                'method' => 'gcash',
            ],
            [
                'customer' => $customers[2],
                'scheduled_date' => today()->addDay(),
                'scheduled_time' => '10:00',
                'status' => 'pending',
                'items' => [[$slim_c, 4]],
                'method' => 'cash',
            ],
            [
                'customer' => $customers[0],
                'scheduled_date' => today()->subDay(),
                'scheduled_time' => '15:00',
                'status' => 'delivered',
                'items' => [[$slim_r, 4], [$delivery, 1]],
                'method' => 'cash',
            ],
        ];

        $delCount = [];
        foreach ($deliveryOrders as $d) {
            $date = \Carbon\Carbon::parse($d['scheduled_date']);
            $key = $date->toDateString();
            $delCount[$key] = ($delCount[$key] ?? 0) + 1;
            $orderNum = 'DEL-' . $date->format('Ymd') . '-' . str_pad($delCount[$key], 4, '0', STR_PAD_LEFT);

            $total = array_reduce($d['items'], fn ($c, $i) => $c + $i[0]->price * $i[1], 0);

            $order = DeliveryOrder::create([
                'order_number' => $orderNum,
                'customer_id' => $d['customer']->id,
                'customer_name' => $d['customer']->name,
                'address' => $d['customer']->address,
                'phone' => $d['customer']->phone,
                'scheduled_date' => $d['scheduled_date'],
                'scheduled_time' => $d['scheduled_time'],
                'status' => $d['status'],
                'total_amount' => $total,
                'amount_paid' => $d['status'] === 'delivered' ? $total : 0,
                'payment_method' => $d['method'],
                'delivered_at' => $d['status'] === 'delivered' ? now()->subDay() : null,
                'user_id' => $adminUser->id,
            ]);

            foreach ($d['items'] as [$product, $qty]) {
                DeliveryOrderItem::create([
                    'delivery_order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_type' => $product->type,
                    'unit_price' => $product->price,
                    'quantity' => $qty,
                    'subtotal' => $product->price * $qty,
                ]);
            }
        }

        $this->command->info('✅ Sample data seeded:');
        $this->command->info('   • ' . count($customers) . ' customers');
        $this->command->info('   • ' . Sale::count() . ' sales transactions');
        $this->command->info('   • ' . Expense::count() . ' expenses');
        $this->command->info('   • ' . DeliveryOrder::count() . ' delivery orders');
        $this->command->info('   • ' . InventoryItem::count() . ' inventory items');
    }
}
