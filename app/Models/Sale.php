<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    protected $fillable = [
        'sale_number', 'customer_name', 'sale_date', 'subtotal',
        'discount', 'total_amount', 'payment_method', 'amount_paid',
        'change_amount', 'notes', 'user_id',
    ];

    protected $casts = [
        'sale_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function getTotalGallonsAttribute(): int
    {
        return $this->items
            ->whereIn('product_type', ['slim_wholesale', 'slim_regular', 'slim_commercial'])
            ->sum('quantity');
    }

    public static function generateSaleNumber(): string
    {
        $date = now()->format('Ymd');
        $count = self::whereDate('created_at', today())->count() + 1;
        return "WRS-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
