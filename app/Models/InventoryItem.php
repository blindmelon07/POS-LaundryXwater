<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    protected $fillable = [
        'business', 'container_type', 'name', 'category', 'quantity', 'unit',
        'min_quantity', 'cost_per_unit', 'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'min_quantity' => 'decimal:2',
        'cost_per_unit' => 'decimal:2',
    ];

    public function isLowStock(): bool
    {
        return $this->min_quantity !== null && $this->quantity <= $this->min_quantity;
    }

    public function getTotalValueAttribute(): float
    {
        return $this->cost_per_unit ? (float) $this->quantity * (float) $this->cost_per_unit : 0;
    }

    public function adjustments(): HasMany
    {
        return $this->hasMany(InventoryAdjustment::class);
    }
}
