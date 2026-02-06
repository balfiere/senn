<?php

namespace App\Http\Controllers\Sync;

use App\Models\Counter;
use App\Models\CounterComment;
use App\Models\Part;
use App\Models\PdfAnnotation;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

final class SyncPullController
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $user->currentAccessToken() || ! $user->tokenCan('sync')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'since' => ['nullable', 'date'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:500'],
        ]);

        $since = isset($validated['since'])
            ? Carbon::parse($validated['since'])
            : null;

        $limit = $validated['limit'] ?? 200;

        $projects = $this->changedProjects($user->id, $since, $limit);
        $parts = $this->changedParts($user->id, $since, $limit);
        $counters = $this->changedCounters($user->id, $since, $limit);
        $counterComments = $this->changedCounterComments($user->id, $since, $limit);
        $pdfAnnotations = $this->changedPdfAnnotations($user->id, $since, $limit);

        return response()->json([
            'cursor' => now()->toISOString(),
            'projects' => $projects,
            'parts' => $parts,
            'counters' => $counters,
            'counter_comments' => $counterComments,
            'pdf_annotations' => $pdfAnnotations,
        ]);
    }

    /** @return array<int, array<string, mixed>> */
    private function changedProjects(int $userId, $since, int $limit): array
    {
        $query = Project::query()
            ->withTrashed()
            ->where('user_id', $userId)
            ->orderBy('updated_at');

        if ($since) {
            $query->where(function ($q) use ($since) {
                $q->where('updated_at', '>', $since)
                    ->orWhere('deleted_at', '>', $since);
            });
        }

        return $query->limit($limit)->get()->map(fn (Project $p) => [
            'id' => $p->id,
            'user_id' => $p->user_id,
            'name' => $p->name,
            'pdf_path' => $p->pdf_path,
            'thumbnail_path' => $p->thumbnail_path,
            'stopwatch_seconds' => $p->stopwatch_seconds,
            'stopwatch_running' => $p->stopwatch_running,
            'stopwatch_started_at' => optional($p->stopwatch_started_at)?->toISOString(),
            'updated_at' => $p->updated_at?->toISOString(),
            'deleted_at' => optional($p->deleted_at)?->toISOString(),
        ])->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function changedParts(int $userId, $since, int $limit): array
    {
        $query = Part::query()
            ->withTrashed()
            ->whereHas('project', fn ($q) => $q->where('user_id', $userId))
            ->orderBy('updated_at');

        if ($since) {
            $query->where(function ($q) use ($since) {
                $q->where('updated_at', '>', $since)
                    ->orWhere('deleted_at', '>', $since);
            });
        }

        return $query->limit($limit)->get()->map(fn (Part $p) => [
            'id' => $p->id,
            'project_id' => $p->project_id,
            'name' => $p->name,
            'position' => $p->position,
            'updated_at' => $p->updated_at?->toISOString(),
            'deleted_at' => optional($p->deleted_at)?->toISOString(),
        ])->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function changedCounters(int $userId, $since, int $limit): array
    {
        $query = Counter::query()
            ->withTrashed()
            ->whereHas('part.project', fn ($q) => $q->where('user_id', $userId))
            ->orderBy('updated_at');

        if ($since) {
            $query->where(function ($q) use ($since) {
                $q->where('updated_at', '>', $since)
                    ->orWhere('deleted_at', '>', $since);
            });
        }

        return $query->limit($limit)->get()->map(fn (Counter $c) => [
            'id' => $c->id,
            'part_id' => $c->part_id,
            'name' => $c->name,
            'current_value' => $c->current_value,
            'reset_at' => $c->reset_at,
            'reset_count' => $c->reset_count,
            'show_reset_count' => $c->show_reset_count,
            'is_global' => $c->is_global,
            'is_linked' => $c->is_linked,
            'position' => $c->position,
            'updated_at' => $c->updated_at?->toISOString(),
            'deleted_at' => optional($c->deleted_at)?->toISOString(),
        ])->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function changedCounterComments(int $userId, $since, int $limit): array
    {
        $query = CounterComment::query()
            ->withTrashed()
            ->whereHas('counter.part.project', fn ($q) => $q->where('user_id', $userId))
            ->orderBy('updated_at');

        if ($since) {
            $query->where(function ($q) use ($since) {
                $q->where('updated_at', '>', $since)
                    ->orWhere('deleted_at', '>', $since);
            });
        }

        return $query->limit($limit)->get()->map(fn (CounterComment $c) => [
            'id' => $c->id,
            'counter_id' => $c->counter_id,
            'row_pattern' => $c->row_pattern,
            'comment_text' => $c->comment_text,
            'updated_at' => $c->updated_at?->toISOString(),
            'deleted_at' => optional($c->deleted_at)?->toISOString(),
        ])->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function changedPdfAnnotations(int $userId, $since, int $limit): array
    {
        $query = PdfAnnotation::query()
            ->withTrashed()
            ->whereHas('project', fn ($q) => $q->where('user_id', $userId))
            ->orderBy('updated_at');

        if ($since) {
            $query->where(function ($q) use ($since) {
                $q->where('updated_at', '>', $since)
                    ->orWhere('deleted_at', '>', $since);
            });
        }

        return $query->limit($limit)->get()->map(fn (PdfAnnotation $a) => [
            'id' => $a->id,
            'project_id' => $a->project_id,
            'embedpdf_annotation_id' => $a->embedpdf_annotation_id,
            'page_number' => $a->page_number,
            'annotation_type' => $a->annotation_type,
            'position_x' => $a->position_x,
            'position_y' => $a->position_y,
            'width' => $a->width,
            'height' => $a->height,
            'color' => $a->color,
            'fill_color' => $a->fill_color,
            'stroke_color' => $a->stroke_color,
            'opacity' => $a->opacity,
            'blend_mode' => $a->blend_mode,
            'stroke_width' => $a->stroke_width,
            'font_size' => $a->font_size,
            'font_family' => $a->font_family,
            'line_start_x' => $a->line_start_x,
            'line_start_y' => $a->line_start_y,
            'line_end_x' => $a->line_end_x,
            'line_end_y' => $a->line_end_y,
            'line_ending' => $a->line_ending,
            'line_start_ending' => $a->line_start_ending,
            'line_end_ending' => $a->line_end_ending,
            'contents' => $a->contents,
            'comment' => $a->comment,
            'in_reply_to_id' => $a->in_reply_to_id,
            'segment_rects' => $a->segment_rects,
            'text_align' => $a->text_align,
            'vertical_align' => $a->vertical_align,
            'updated_at' => $a->updated_at?->toISOString(),
            'deleted_at' => optional($a->deleted_at)?->toISOString(),
        ])->all();
    }
}
