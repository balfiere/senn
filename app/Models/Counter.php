<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Counter extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'part_id',
        'name',
        'current_value',
        'reset_at',
        'reset_count',
        'show_reset_count',
        'is_global',
        'is_linked',
        'position',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_value' => 'integer',
            'reset_at' => 'integer',
            'reset_count' => 'integer',
            'show_reset_count' => 'boolean',
            'is_global' => 'boolean',
            'is_linked' => 'boolean',
            'position' => 'integer',
        ];
    }

    /**
     * Get the part that owns the counter.
     */
    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class);
    }

    /**
     * Get the comments for the counter.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(CounterComment::class);
    }
}
