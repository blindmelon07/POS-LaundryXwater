<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    protected $fillable = [
        'date', 'description', 'category', 'amount',
        'receipt_number', 'notes', 'user_id',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function categoryLabels(): array
    {
        return [
            'water_supply' => 'Water Supply / Chemicals',
            'electricity' => 'Electricity',
            'rent' => 'Rent',
            'salaries' => 'Salaries',
            'packaging' => 'Packaging / Containers',
            'maintenance' => 'Maintenance',
            'delivery' => 'Fuel / Delivery',
            'other' => 'Other',
        ];
    }

    public function getCategoryLabelAttribute(): string
    {
        return self::categoryLabels()[$this->category] ?? $this->category;
    }
}
