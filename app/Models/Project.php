<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'pdf_url',
        'stopwatch_seconds',
        'stopwatch_running',
        'stopwatch_started_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stopwatch_running' => 'boolean',
            'stopwatch_started_at' => 'datetime',
            'stopwatch_seconds' => 'integer',
        ];
    }

    /**
     * Get the user that owns the project.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parts for the project.
     */
    public function parts(): HasMany
    {
        return $this->hasMany(Part::class)->orderBy('position');
    }

    /**
     * Get the PDF annotations for the project.
     */
    public function pdfAnnotations(): HasMany
    {
        return $this->hasMany(PdfAnnotation::class);
    }
}
