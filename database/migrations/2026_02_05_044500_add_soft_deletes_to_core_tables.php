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
        Schema::table('projects', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('parts', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('counters', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('counter_comments', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('pdf_annotations', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pdf_annotations', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('counter_comments', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('counters', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('parts', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
