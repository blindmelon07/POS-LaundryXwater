<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaundryService extends Model
{
    protected $fillable = [
        'name', 'type', 'price', 'unit', 'is_active', 'notes',
    ];

    protected $casts = [
        'price'     => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public static array $typeLabels = [
        'wash_dry'  => 'Wash & Dry',
        'wash_only' => 'Wash Only',
        'dry_only'  => 'Dry Only',
        'fold'      => 'Fold',
        'press'     => 'Press / Iron',
        'other'     => 'Other',
    ];
}
