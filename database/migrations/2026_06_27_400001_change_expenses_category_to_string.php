<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement('ALTER TABLE expenses MODIFY COLUMN category VARCHAR(255) NOT NULL');
        }
        // SQLite handles this automatically via RefreshDatabase + updated original migration
    }

    public function down(): void
    {
        // No rollback needed — restoring the enum would break new category values
    }
};
