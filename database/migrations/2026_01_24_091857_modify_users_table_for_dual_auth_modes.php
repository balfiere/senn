<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add username field only if it doesn't exist
            if (! Schema::hasColumn('users', 'username')) {
                $table->string('username')->nullable()->unique()->after('name');
            }

            // Make email nullable (it's required in production mode, but not in simple mode)
            $table->string('email')->nullable()->change();

            // email_verified_at already nullable, so no change needed
        });

        // Add unique indexes only if they don't exist
        try {
            DB::statement('CREATE UNIQUE INDEX users_email_unique ON users(email) WHERE email IS NOT NULL');
        } catch (\Exception $e) {
            // Index already exists
        }

        try {
            DB::statement('CREATE UNIQUE INDEX users_username_unique ON users(username) WHERE username IS NOT NULL');
        } catch (\Exception $e) {
            // Index already exists
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the username column
            $table->dropColumn('username');

            // Make email required again
            $table->string('email')->nullable(false)->change();
        });

        // SQLite will automatically drop the indexes when the columns are modified
    }
};
