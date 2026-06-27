<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loading_logs', function (Blueprint $table) {
            $table->id();
            $table->date('log_date');
            $table->string('type');           // load_out | load_in
            $table->string('product_name');
            $table->decimal('quantity', 10, 2);
            $table->string('unit')->default('jugs');
            $table->string('rider_name')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loading_logs');
    }
};
