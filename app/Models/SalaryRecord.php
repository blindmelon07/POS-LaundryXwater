<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalaryRecord extends Model
{
    protected $fillable = [
        'employee_id', 'period_month', 'period_year',
        'base_salary', 'bonus', 'deductions', 'net_salary',
        'payment_date', 'payment_method', 'status',
        'notes', 'processed_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'base_salary'  => 'decimal:2',
        'bonus'        => 'decimal:2',
        'deductions'   => 'decimal:2',
        'net_salary'   => 'decimal:2',
    ];

    public static array $months = [
        1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April',
        5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August',
        9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function getPeriodLabelAttribute(): string
    {
        return (self::$months[$this->period_month] ?? "Month {$this->period_month}") . ' ' . $this->period_year;
    }
}
