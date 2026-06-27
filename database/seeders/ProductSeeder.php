<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'Slim/Round Wholesale', 'type' => 'slim_wholesale', 'price' => 25.00, 'unit' => 'Per gallon', 'notes' => 'Refill only'],
            ['name' => 'Slim/Round Regular', 'type' => 'slim_regular', 'price' => 30.00, 'unit' => 'Per gallon', 'notes' => 'Refill only'],
            ['name' => 'Slim/Round Commercial', 'type' => 'slim_commercial', 'price' => 35.00, 'unit' => 'Per gallon', 'notes' => 'Refill only'],
            ['name' => 'Container Deposit (Slim)', 'type' => 'container_slim', 'price' => 50.00, 'unit' => 'Per container', 'notes' => 'Refundable'],
            ['name' => 'Container Deposit (Round)', 'type' => 'container_round', 'price' => 80.00, 'unit' => 'Per container', 'notes' => 'Refundable'],
            ['name' => 'Delivery Fee', 'type' => 'delivery', 'price' => 20.00, 'unit' => 'Per trip', 'notes' => 'Within delivery area'],
            ['name' => 'Other / Special Order', 'type' => 'other', 'price' => 10.00, 'unit' => 'Per unit', 'notes' => 'Negotiable'],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(['type' => $product['type']], $product);
        }
    }
}
