<?php

namespace App\Http\Controllers;

use App\Models\PdfAnnotation;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PdfAnnotationController extends Controller
{
    /**
     * Get all annotations for a project.
     */
    public function index(Project $project): JsonResponse
    {
        Gate::authorize('view', $project);

        $annotations = $project->pdfAnnotations()
            ->orderBy('page_number')
            ->orderBy('created_at')
            ->get();

        return response()->json($annotations);
    }

    /**
     * Store a new annotation.
     */
    public function store(Request $request, Project $project): RedirectResponse
    {
        Gate::authorize('update', $project);

        $validated = $request->validate([
            'embedpdf_annotation_id' => 'required|string|unique:pdf_annotations,embedpdf_annotation_id',
            'page_number' => 'required|integer|min:1',
            'annotation_type' => 'required|string',
            'position_x' => 'required|numeric',
            'position_y' => 'required|numeric',
            'width' => 'numeric|nullable',
            'height' => 'numeric|nullable',
            'color' => 'string|nullable',
            'fill_color' => 'string|nullable',
            'stroke_color' => 'string|nullable',
            'opacity' => 'numeric|nullable',
            'blend_mode' => 'integer|nullable',
            'stroke_width' => 'integer|nullable',
            'font_size' => 'integer|nullable',
            'font_family' => 'string|nullable',
            'line_start_x' => 'numeric|nullable',
            'line_start_y' => 'numeric|nullable',
            'line_end_x' => 'numeric|nullable',
            'line_end_y' => 'numeric|nullable',
            'line_ending' => 'string|nullable',
            'line_start_ending' => 'string|nullable',
            'line_end_ending' => 'string|nullable',
            'contents' => 'string|nullable',
            'comment' => 'string|nullable',
            'in_reply_to_id' => 'string|nullable',
            'segment_rects' => 'string|nullable', // Received as JSON string from frontend
        ]);

        // Decode segment_rects if it's a JSON string
        if (isset($validated['segment_rects']) && is_string($validated['segment_rects'])) {
            $validated['segment_rects'] = json_decode($validated['segment_rects'], true);
        }

        $project->pdfAnnotations()->create($validated);

        return redirect()->back()->with('success', 'Annotation created.');
    }

    /**
     * Update an annotation.
     */
    public function update(Request $request, string $annotationId): RedirectResponse
    {
        $annotation = PdfAnnotation::where('embedpdf_annotation_id', $annotationId)->firstOrFail();

        Gate::authorize('update', $annotation->project);

        $validated = $request->validate([
            'page_number' => 'integer|min:1',
            'annotation_type' => 'string',
            'position_x' => 'numeric',
            'position_y' => 'numeric',
            'width' => 'numeric|nullable',
            'height' => 'numeric|nullable',
            'color' => 'string|nullable',
            'fill_color' => 'string|nullable',
            'stroke_color' => 'string|nullable',
            'opacity' => 'numeric|nullable',
            'blend_mode' => 'integer|nullable',
            'stroke_width' => 'integer|nullable',
            'font_size' => 'integer|nullable',
            'font_family' => 'string|nullable',
            'line_start_x' => 'numeric|nullable',
            'line_start_y' => 'numeric|nullable',
            'line_end_x' => 'numeric|nullable',
            'line_end_y' => 'numeric|nullable',
            'line_ending' => 'string|nullable',
            'line_start_ending' => 'string|nullable',
            'line_end_ending' => 'string|nullable',
            'contents' => 'string|nullable',
            'comment' => 'string|nullable',
            'in_reply_to_id' => 'string|nullable',
            'segment_rects' => 'string|nullable', // Received as JSON string from frontend
        ]);

        // Decode segment_rects if it's a JSON string
        if (isset($validated['segment_rects']) && is_string($validated['segment_rects'])) {
            $validated['segment_rects'] = json_decode($validated['segment_rects'], true);
        }

        $annotation->update($validated);

        return redirect()->back()->with('success', 'Annotation updated.');
    }

    /**
     * Delete an annotation.
     */
    public function destroy(Request $request, string $annotationId): JsonResponse
    {
        $annotation = PdfAnnotation::where('embedpdf_annotation_id', $annotationId)->firstOrFail();

        Gate::authorize('update', $annotation->project);

        $annotation->delete();

        return response()->json(['success' => true, 'message' => 'Annotation deleted.']);
    }
}
