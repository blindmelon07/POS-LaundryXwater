<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name', 'type', 'price', 'unit', 'notes', 'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public static function typeLabels(): array
    {
        return [
            'slim_wholesale' => 'Slim/Round Wholesale',
            'slim_regular' => 'Slim/Round Regular',
            'slim_commercial' => 'Slim/Round Commercial',
            'container_slim' => 'Container Deposit (Slim)',
            'container_round' => 'Container Deposit (Round)',
            'delivery' => 'Delivery Fee',
            'other' => 'Other / Special Order',
        ];
    }

    public function getTypeLabelAttribute(): string
    {
        return self::typeLabels()[$this->type] ?? $this->type;
    }

    public function isRefill(): bool
    {
        return in_array($this->type, ['slim_wholesale', 'slim_regular', 'slim_commercial']);
    }
}
