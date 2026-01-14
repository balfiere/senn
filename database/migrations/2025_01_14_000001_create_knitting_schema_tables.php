<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('name');
            $table->text('pdf_url')->nullable();
            $table->integer('stopwatch_seconds')->default(0);
            $table->boolean('stopwatch_running')->default(false);
            $table->timestamp('stopwatch_started_at')->nullable();
            $table->timestamps();
        });

        Schema::create('parts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->text('name')->default('Part 1');
            $table->integer('position')->default(0);
            $table->timestamps();
        });

        Schema::create('counters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('part_id')->constrained('parts')->cascadeOnDelete();
            $table->text('name')->default('Row Counter');
            $table->integer('current_value')->default(1);
            $table->integer('reset_at')->nullable();
            $table->integer('reset_count')->default(0);
            $table->boolean('show_reset_count')->default(false);
            $table->boolean('is_global')->default(false);
            $table->boolean('is_linked')->default(false);
            $table->integer('position')->default(0);
            $table->timestamps();
        });

        Schema::create('counter_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('counter_id')->constrained('counters')->cascadeOnDelete();
            $table->text('row_pattern');
            $table->text('comment_text');
            $table->timestamps();
        });

        Schema::create('pdf_annotations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->text('embedpdf_annotation_id')->unique();
            $table->integer('page_number');
            $table->text('annotation_type');
            $table->float('position_x');
            $table->float('position_y');
            $table->float('width')->default(0);
            $table->float('height')->default(0);
            $table->text('color')->nullable()->default('#cba6f7');
            $table->float('opacity')->default(1.0);
            $table->integer('stroke_width')->default(1);
            $table->integer('font_size')->default(14);
            $table->text('font_family')->nullable()->default('Helvetica');
            $table->float('line_start_x')->nullable();
            $table->float('line_start_y')->nullable();
            $table->float('line_end_x')->nullable();
            $table->float('line_end_y')->nullable();
            $table->text('line_ending')->nullable();
            $table->text('contents')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->jsonb('segment_rects')->nullable();
            $table->text('fill_color')->nullable();
            $table->text('stroke_color')->nullable();
            $table->integer('blend_mode')->default(0);
            $table->text('line_start_ending')->nullable()->default('None');
            $table->text('line_end_ending')->nullable()->default('None');
            $table->text('in_reply_to_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pdf_annotations');
        Schema::dropIfExists('counter_comments');
        Schema::dropIfExists('counters');
        Schema::dropIfExists('parts');
        Schema::dropIfExists('projects');
    }
};
