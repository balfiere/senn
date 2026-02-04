<?php

use App\Http\Requests\StoreProjectRequest;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

describe('PDF validation security', function (): void {
    beforeEach(function (): void {
        $this->user = User::factory()->create();
    });

    /**
     * Create a fake PDF file with valid PDF header signature.
     */
    function createFakePdf(int $sizeKb, string $mimeType = 'application/pdf'): UploadedFile
    {
        // Create a minimal PDF with valid header
        $pdfContent = '%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<< /Size 4 /Root 1 0 R >>
startxref
193
%%EOF';

        // Pad the content to the requested size
        $padding = max(0, ($sizeKb * 1024) - strlen($pdfContent));
        $pdfContent .= str_repeat(' ', $padding);

        $tempFile = tempnam(sys_get_temp_dir(), 'pdf_');
        file_put_contents($tempFile, $pdfContent);

        return new UploadedFile(
            $tempFile,
            'test.pdf',
            $mimeType,
            null,
            true // test mode
        );
    }

    test('valid PDF file is accepted for project creation', function (): void {
        $pdf = createFakePdf(100); // 100KB PDF

        $validator = Validator::make([
            'name' => 'Test Project',
            'pdf_file' => $pdf,
        ], (new StoreProjectRequest)->rules(), (new StoreProjectRequest)->messages());

        // A valid PDF should pass validation
        expect($validator->passes())->toBeTrue();
    });

    test('file exceeding size limit is rejected', function (): void {
        // 25MB file (exceeds 20MB limit)
        $pdf = createFakePdf(25 * 1024); // 25MB

        $validator = Validator::make([
            'name' => 'Test Project',
            'pdf_file' => $pdf,
        ], (new StoreProjectRequest)->rules(), (new StoreProjectRequest)->messages());

        expect($validator->fails())->toBeTrue();
        // Laravel's built-in error message uses kilobytes
        expect($validator->errors()->get('pdf_file')[0])->toContain('20480');
    });

    test('non-PDF file is rejected', function (): void {
        $file = UploadedFile::fake()->create('test.exe', 100, 'application/x-msdownload');

        $validator = Validator::make([
            'name' => 'Test Project',
            'pdf_file' => $file,
        ], (new StoreProjectRequest)->rules(), (new StoreProjectRequest)->messages());

        expect($validator->fails())->toBeTrue();
    });

    test('file with wrong extension but PDF mime type is rejected', function (): void {
        // Create a file with .txt extension but PDF content
        $tempFile = tempnam(sys_get_temp_dir(), 'pdf_');
        rename($tempFile, $tempFile.'.txt');
        file_put_contents($tempFile.'.txt', '%PDF-1.4 test content');

        $wrongExtFile = new UploadedFile(
            $tempFile.'.txt',
            'test.txt',
            'application/pdf',
            null,
            true
        );

        $validator = Validator::make([
            'name' => 'Test Project',
            'pdf_file' => $wrongExtFile,
        ], (new StoreProjectRequest)->rules(), (new StoreProjectRequest)->messages());

        expect($validator->fails())->toBeTrue();
    });

    test('PHP file upload is rejected', function (): void {
        $phpFile = UploadedFile::fake()->create('shell.php', 50, 'text/x-php');

        $validator = Validator::make([
            'name' => 'Test Project',
            'pdf_file' => $phpFile,
        ], (new StoreProjectRequest)->rules(), (new StoreProjectRequest)->messages());

        expect($validator->fails())->toBeTrue();
    });

    test('SVG file is rejected', function (): void {
        $svgFile = UploadedFile::fake()->create('malicious.svg', 50, 'image/svg+xml');

        $validator = Validator::make([
            'name' => 'Test Project',
            'pdf_file' => $svgFile,
        ], (new StoreProjectRequest)->rules(), (new StoreProjectRequest)->messages());

        expect($validator->fails())->toBeTrue();
    });
});
