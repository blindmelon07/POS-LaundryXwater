<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoadingLog extends Model
{
    protected $fillable = [
        'log_date', 'type', 'product_name', 'quantity', 'unit',
        'rider_name', 'notes', 'user_id', 'inventory_item_id',
    ];

    protected $casts = [
        'log_date' => 'date',
        'quantity' => 'decimal:2',
    ];

    public static array $typeLabels = [
        'load_out' => 'Loaded Out',
        'load_in'  => 'Loaded In',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
