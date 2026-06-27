<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LaundryOrderItem extends Model
{
    protected $fillable = [
        'laundry_order_id', 'service_name', 'service_type',
        'unit_price', 'quantity', 'unit', 'subtotal',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'quantity'   => 'decimal:2',
        'subtotal'   => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(LaundryOrder::class, 'laundry_order_id');
    }
}
