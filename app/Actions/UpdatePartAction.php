<?php

namespace App\Actions;

use App\Models\Part;

class UpdatePartAction
{
    public function execute(Part $part, array $data): Part
    {
        $part->update($data);

        return $part;
    }
}
