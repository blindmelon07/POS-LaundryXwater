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
            'round_gallons'   => 'Round Gallons',
            'slim_gallons'    => 'Slim Gallons',
            'dispenser'       => 'Dispenser',
            'electricity'     => 'Soreco (Electricity Bill)',
            'water_bill'      => 'Prime Water (Water Bill)',
            'salt'            => 'Salt',
            'filter'          => 'Filter',
            'salaries'        => 'Salary + Bonus',
            'miscellaneous'   => 'Miscellaneous',
            'other_supplies'  => 'Other Supplies',
            'transportation'  => 'Transportation',
        ];
    }

    public function getCategoryLabelAttribute(): string
    {
        return self::categoryLabels()[$this->category] ?? $this->category;
    }
}
