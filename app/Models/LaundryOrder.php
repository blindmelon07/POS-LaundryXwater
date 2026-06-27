<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LaundryOrder extends Model
{
    protected $fillable = [
        'order_number', 'customer_name', 'customer_id', 'phone',
        'status', 'payment_method',
        'subtotal', 'discount', 'total_amount', 'amount_paid', 'change_amount',
        'drop_off_date', 'pickup_date', 'notes', 'created_by',
    ];

    protected $casts = [
        'drop_off_date' => 'date',
        'pickup_date'   => 'date',
        'subtotal'      => 'decimal:2',
        'discount'      => 'decimal:2',
        'total_amount'  => 'decimal:2',
        'amount_paid'   => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    public static array $statusLabels = [
        'pending'         => 'Pending',
        'in_progress'     => 'In Progress',
        'ready'           => 'Ready for Pickup',
        'completed'       => 'Completed',
        'cancelled'       => 'Cancelled',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(LaundryOrderItem::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generateOrderNumber(): string
    {
        $date  = now()->format('Ymd');
        $count = self::whereDate('created_at', today())->count() + 1;
        return 'LDY-' . $date . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
