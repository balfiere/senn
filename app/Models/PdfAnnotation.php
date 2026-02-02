<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PdfAnnotation extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'project_id',
        'embedpdf_annotation_id',
        'page_number',
        'annotation_type',
        'position_x',
        'position_y',
        'width',
        'height',
        'color',
        'opacity',
        'stroke_width',
        'font_size',
        'font_family',
        'line_start_x',
        'line_start_y',
        'line_end_x',
        'line_end_y',
        'line_ending',
        'contents',
        'comment',
        'segment_rects',
        'fill_color',
        'stroke_color',
        'blend_mode',
        'line_start_ending',
        'line_end_ending',
        'text_align',
        'vertical_align',
        'in_reply_to_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'page_number' => 'integer',
            'position_x' => 'float',
            'position_y' => 'float',
            'width' => 'float',
            'height' => 'float',
            'opacity' => 'float',
            'stroke_width' => 'integer',
            'font_size' => 'integer',
            'line_start_x' => 'float',
            'line_start_y' => 'float',
            'line_end_x' => 'float',
            'line_end_y' => 'float',
            'segment_rects' => 'array',
            'blend_mode' => 'integer',
            'text_align' => 'integer',
            'vertical_align' => 'integer',
        ];
    }

    /**
     * Get the project that owns the annotation.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
