<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pdf_annotations', function (Blueprint $table) {
            $table->integer('text_align')->default(0); // 0: Left, 1: Center, 2: Right
            $table->integer('vertical_align')->default(0); // 0: Top, 1: Middle, 2: Bottom
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pdf_annotations', function (Blueprint $table) {
            $table->dropColumn(['text_align', 'vertical_align']);
        });
    }
};
