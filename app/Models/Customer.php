<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'name', 'phone', 'address', 'email', 'type',
        'slim_containers', 'round_containers', 'balance', 'notes', 'is_active',
    ];

    protected $casts = [
        'slim_containers' => 'integer',
        'round_containers' => 'integer',
        'balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function deliveryOrders(): HasMany
    {
        return $this->hasMany(DeliveryOrder::class);
    }

    public function getTotalContainersAttribute(): int
    {
        return $this->slim_containers + $this->round_containers;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public static function typeLabels(): array
    {
        return [
            'wholesale' => 'Wholesale',
            'regular' => 'Regular',
            'commercial' => 'Commercial',
        ];
    }
}
