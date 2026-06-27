<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Buy promo_buy units → get promo_get units free. Null = no promo.
            $table->unsignedSmallInteger('promo_buy')->nullable()->after('is_active');
            $table->unsignedSmallInteger('promo_get')->nullable()->after('promo_buy');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['promo_buy', 'promo_get']);
        });
    }
};
