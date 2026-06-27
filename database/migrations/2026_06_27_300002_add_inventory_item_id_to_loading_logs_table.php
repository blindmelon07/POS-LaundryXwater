<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loading_logs', function (Blueprint $table) {
            $table->foreignId('inventory_item_id')
                ->nullable()
                ->after('user_id')
                ->constrained('inventory_items')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('loading_logs', function (Blueprint $table) {
            $table->dropForeignIfExists(['inventory_item_id']);
            $table->dropColumn('inventory_item_id');
        });
    }
};
