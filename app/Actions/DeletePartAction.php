<?php

namespace App\Actions;

use App\Models\Part;

class DeletePartAction
{
    public function execute(Part $part): void
    {
        $part->delete();
    }
}
