import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface ParsedCourse {
  id: string;
  grade: string;
}

/**
 * Normalizes text by converting Greek characters to Latin equivalents
 * and handling other common issues.
 */
function normalizeText(text: string): string {
    return text
        .replace(/Μ/g, "M")
        .replace(/Ε/g, "E")
        .replace(/Β/g, "B")
        .replace(/Ι/g, "I")
        .replace(/Ο/g, "O")
        .replace(/Α/g, "A")
        .replace(/Τ/g, "T")
        .replace(/Η/g, "H")
        .replace(/Κ/g, "K")
        .replace(/Ρ/g, "P")
        .replace(/Χ/g, "X")
        .replace(/Υ/g, "Y")
        .replace(/Ζ/g, "Z");
}

/**
 * Extracts all text content from a PDF file.
 */
async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" "); // Join with space to keep lines separated somewhat logically
        fullText += pageText + "\n";
    }
    
    return fullText;
}

/**
 * Parses e-Devlet (YÖK) format transcript.
 * Looks for lines starting with Course Code and ending with Grade.
 */
function parseEDevletFormat(text: string): ParsedCourse[] {
    const results: ParsedCourse[] = [];
    const normalized = normalizeText(text);

    // Regex for e-Devlet format:
    // [Course Code] [Course Name] ... [Grade]
    // Example: ME 101 Calculus 4.0 AA
    // Matches: Start with 2-4 uppercase letters, space, 3 digits (Course Code)
    // Then arbitrary text
    // Ends with valid Letter Grade (AA, BA, BB, CB, CC, DC, DD, FD, FF)
    // Note: We need to be careful not to capture intermediate text as grade if possible, 
    // but the end-of-line anchor isn't reliable in raw PDF text extraction which often joins lines.
    // So we iterate over "tokens" or look for patterns.
    
    // Better strategy for raw text which might be unstructured:
    // Look for pattern: ([A-Z]{2,4}\s*\d{3}).*?(AA|BA|BB|CB|CC|DC|DD|FD|FF)
    // extracting all matches. Global flag.
    const regex = /\b([A-Z]{2,4}\s*\d{3})\b.*?\b(AA|BA|BB|CB|CC|DC|DD|FD|FF)\b/g;
    
    let match;
    while ((match = regex.exec(normalized)) !== null) {
        // match[1] is Course Code (e.g., ME 101)
        // match[2] is Grade (e.g., AA)
        let id = match[1].replace(/\s+/g, " ").trim(); // Normalize spaces in ID
        const grade = match[2];
        
        results.push({ id, grade });
    }
    
    return results;
}

/**
 * Parses School/OBS format transcript.
 * More loose strategy looking for Course Code followed eventually by a Grade.
 */
function parseSchoolFormat(text: string): ParsedCourse[] {
    const results: ParsedCourse[] = [];
    const normalized = normalizeText(text);
    
    // OBS often has weird spacing or table structures.
    // Strategy: Look for "Code" and "Grade" closer together or just key patterns.
    // Similar regex but maybe less strict on what's in between, or handling multiple variations.
    // However, the prompt suggests: "Find Course Code, then find Grade. Ensure valid grade."
    
    // We will use a similar regex but allows for Uppercase in course names.
    // Course Code followed by anything (non-greedy) until a Grade found.
    // Update: Allow multiple spaces between code and number (e.g. PHYS   101)
    // Update: Use word boundaries \b to ensure we match "AA" and not "SAA" or "BABA"
    // Update: Use word boundaries \b around course code to avoid matching years like "2024" as "202"
    const regex = /\b([A-Z]{2,4}\s*\d{3})\b.*?\b(AA|BA|BB|CB|CC|DC|DD|FD|FF)\b/g;
    
    let match;
    while ((match = regex.exec(normalized)) !== null) {
        results.push({
            id: match[1].replace(/\s+/g, " ").trim(),
            grade: match[2]
        });
    }

    return results;
}

export async function parseTranscript(file: File): Promise<ParsedCourse[]> {
    try {
        const text = await extractTextFromPDF(file);
        
        // E-Devlet check (Barcode presence)
        if (text.includes("YOKTR") || text.includes("e-Devlet")) { // "YOKTR" logic as requested
            console.log("Detected e-Devlet format");
            return parseEDevletFormat(text);
        } else {
            console.log("Detected School/OBS format");
            return parseSchoolFormat(text);
        }
    } catch (error) {
        console.error("Error parsing transcript:", error);
        throw new Error("Failed to parse PDF file.");
    }
}
