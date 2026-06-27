<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("setting_{$key}", 3600, function () use ($key, $default) {
            return static::where('key', $key)->value('value') ?? $default;
        });
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget("setting_{$key}");
    }

    public static function defaults(): array
    {
        return [
            'business_name' => 'Jaz Pure Water Refilling Station',
            'business_address' => '',
            'business_phone' => '',
            'business_email' => '',
            'receipt_footer' => 'Thank you for your purchase!',
            'tax_rate' => '0',
            'currency' => '₱',
        ];
    }

    public static function all_settings(): array
    {
        $saved = static::pluck('value', 'key')->toArray();
        return array_merge(static::defaults(), $saved);
    }
}
