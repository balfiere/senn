<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'pdf_file' => [
                'nullable',
                'file',
                'mimes:pdf',
                'max:20480', // 20MB max for security
                function ($attribute, $value, $fail) {
                    // Additional validation to ensure it's actually a valid PDF file
                    if (! $value) {
                        return; // Skip if no file is uploaded
                    }

                    // Verify file extension is .pdf (additional security layer)
                    $clientName = $value->getClientOriginalName();
                    $extension = strtolower(pathinfo($clientName, PATHINFO_EXTENSION));
                    if ($extension !== 'pdf') {
                        $fail('The uploaded file must have a .pdf extension.');

                        return;
                    }

                    $finfo = finfo_open(FILEINFO_MIME_TYPE);
                    $mimeType = finfo_file($finfo, $value->getRealPath());
                    finfo_close($finfo);

                    if ($mimeType !== 'application/pdf') {
                        $fail('The uploaded file is not a valid PDF document.');
                    }

                    // Verify PDF signature by checking first bytes contain PDF marker
                    $firstBytes = file_get_contents($value->getRealPath(), false, null, 0, 5);
                    if (strpos($firstBytes, '%PDF-') !== 0) {
                        $fail('The uploaded file does not contain valid PDF content.');
                    }
                },
            ],
        ];
    }
}
