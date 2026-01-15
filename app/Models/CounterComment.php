<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CounterComment extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'counter_id',
        'row_pattern',
        'comment_text',
    ];

    /**
     * Get the counter that owns the comment.
     */
    public function counter(): BelongsTo
    {
        return $this->belongsTo(Counter::class);
    }
}
