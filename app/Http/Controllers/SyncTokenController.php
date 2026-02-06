<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SyncTokenController
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $deviceName = $validated['device_name'] ?? 'Rowcounter Device';

        $token = $request->user()->createToken($deviceName, ['sync'], now()->addDays(30));

        return response()->json([
            'token' => $token->plainTextToken,
        ]);
    }
}
