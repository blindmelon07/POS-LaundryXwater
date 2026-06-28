<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryOrder extends Model
{
    protected $fillable = [
        'order_number', 'customer_id', 'customer_name', 'address', 'phone',
        'scheduled_date', 'scheduled_time', 'status', 'total_amount',
        'amount_paid', 'payment_method', 'notes', 'delivered_at', 'user_id', 'sale_id',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'delivered_at' => 'datetime',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(DeliveryOrderItem::class);
    }

    public static function statusLabels(): array
    {
        return [
            'pending' => 'Pending',
            'out_for_delivery' => 'Out for Delivery',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
        ];
    }

    public static function statusColors(): array
    {
        return [
            'pending' => 'secondary',
            'out_for_delivery' => 'default',
            'delivered' => 'outline',
            'cancelled' => 'destructive',
        ];
    }

    public static function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $count = self::whereDate('created_at', today())->count() + 1;
        return "DEL-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
