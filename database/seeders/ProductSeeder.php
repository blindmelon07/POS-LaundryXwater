<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // ── Delivery ─────────────────────────────────────────────
            [
                'name'      => 'Slim/Round Wholesale',
                'type'      => 'slim_wholesale',
                'price'     => 25.00,
                'unit'      => 'Per gallon',
                'notes'     => 'Delivery – Wholesale',
                'is_active' => true,
            ],
            [
                'name'      => 'Slim/Round Regular',
                'type'      => 'slim_regular',
                'price'     => 30.00,
                'unit'      => 'Per gallon',
                'notes'     => 'Delivery – Regular',
                'is_active' => true,
            ],
            [
                'name'      => 'Slim/Round Commercial',
                'type'      => 'slim_commercial',
                'price'     => 35.00,
                'unit'      => 'Per gallon',
                'notes'     => 'Delivery – Commercial',
                'is_active' => true,
            ],

            // ── Walk-in ───────────────────────────────────────────────
            [
                'name'      => 'Slim/Round Walk-in',
                'type'      => 'slim_wholesale',
                'price'     => 25.00,
                'unit'      => 'Per gallon',
                'notes'     => 'Walk-in',
                'is_active' => true,
            ],
            [
                'name'      => 'Slim/Round Walk-in/Delivered',
                'type'      => 'slim_regular',
                'price'     => 30.00,
                'unit'      => 'Per gallon',
                'notes'     => 'Walk-in / Delivered',
                'is_active' => true,
            ],

            // ── Products for sale ─────────────────────────────────────
            [
                'name'      => 'Slim/Round Gallon w/ Water',
                'type'      => 'container_slim',
                'price'     => 200.00,
                'unit'      => 'Per unit',
                'notes'     => 'New container + water included',
                'is_active' => true,
            ],
            [
                'name'      => 'Dispenser',
                'type'      => 'other',
                'price'     => 5000.00,
                'unit'      => 'Per unit',
                'notes'     => 'Water dispenser',
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['name' => $product['name']],
                $product
            );
        }

        // Deactivate the old placeholder products that the store doesn't use
        Product::whereIn('name', [
            'Container Deposit (Slim)',
            'Container Deposit (Round)',
            'Delivery Fee',
            'Other / Special Order',
        ])->update(['is_active' => false]);
    }
}
