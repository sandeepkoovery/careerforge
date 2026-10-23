<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use Smalot\PdfParser\Parser;
use ZipArchive;

class TextExtractor
{
    public function extract(UploadedFile $file): string
    {
        $ext = strtolower($file->getClientOriginalExtension());
        $path = $file->getRealPath();

        $text = match ($ext) {
            'pdf' => $this->pdf($path),
            'docx' => $this->docx($path),
            default => (string) file_get_contents($path),
        };

        $text = $this->normalise($text);
        if (mb_strlen($text) < 30) {
            throw ValidationException::withMessages([
                'file' => 'We could not read any text from this file. If it is a scanned image, upload a text-based PDF or DOCX — that is also what ATS systems need.',
            ]);
        }

        return $text;
    }

    private function pdf(string $path): string
    {
        try {
            return (new Parser)->parseFile($path)->getText();
        } catch (\Throwable $e) {
            throw ValidationException::withMessages(['file' => 'This PDF could not be parsed. Try re-exporting it or upload a DOCX.']);
        }
    }

    private function docx(string $path): string
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            throw ValidationException::withMessages(['file' => 'This DOCX file appears to be corrupted.']);
        }
        $xml = $zip->getFromName('word/document.xml') ?: '';
        $zip->close();

        $xml = preg_replace('/<\/w:p>/', "\n", $xml);
        $xml = preg_replace('/<w:tab\/>/', ' ', $xml);
        $xml = preg_replace('/<w:br\/>/', "\n", $xml);

        return html_entity_decode(strip_tags($xml), ENT_QUOTES | ENT_XML1, 'UTF-8');
    }

    private function normalise(string $text): string
    {
        $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
        $text = str_replace(["\r\n", "\r", "\t", "\u{00A0}"], ["\n", "\n", ' ', ' '], $text);
        $text = preg_replace('/[ ]{2,}/', ' ', $text);
        $text = preg_replace('/\n{3,}/', "\n\n", $text);

        return trim($text);
    }
}
