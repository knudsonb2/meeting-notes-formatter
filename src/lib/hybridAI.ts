import {
  TemplateStructure,
  MeetingMetadata,
  RewrittenContent,
} from '@/types/documents';

export function generatePromptForGemini(
  templateStructure: TemplateStructure,
  rawNotes: string,
  metadata: MeetingMetadata,
  outputMode?: string,
): string {
  const systemInstructions = `You are a professional document formatter for Army Corps of Engineers meeting records.

CRITICAL FORMATTING RULES:
1. Output PLAIN TEXT only in the JSON structure - NO MARKDOWN, NO HTML, NO FORMATTING CODES
2. Do NOT use ** for bold, _ for italics, # for headers, or any markdown syntax
3. Write content as plain sentences and paragraphs
4. For missing information, use EXACTLY this format: [Owner TBD], [Date TBD], [Clarification needed: specific question]
5. Never invent names, dates, decisions, owners, due dates not present in source notes
6. Maintain professional, neutral, objective tone
7. Do NOT duplicate information across sections
8. Extract all decisions, action items, risks clearly
9. Follow the template structure exactly

SIGNATURE BLOCK: ${metadata?.includeSignatureBlock ? 'YES - Include signature block fields' : 'NO - Do not include signature block'}`;

  const prompt = `${systemInstructions}

Template structure to follow:
${JSON.stringify(templateStructure, null, 2)}

Meeting metadata:
${JSON.stringify(metadata, null, 2)}

Output mode: ${outputMode || 'meeting_minutes'}

Raw meeting notes to transform:
---
${rawNotes}
---

Return ONLY valid JSON (no markdown code blocks, no extra text):
{
  "title": "string",
  "metadata": {
    "title": "string",
    "date": "string",
    "project": "string",
    "attendees": ["string"],
    "author": "string",
    "organization": "string",
    "includeSignatureBlock": ${metadata?.includeSignatureBlock || false}
  },
  "sections": [
    {
      "heading": "string (use exact template headings)",
      "content": "string (PLAIN TEXT, no markdown, use [clarification needed: reason] for missing info)",
      "format": "paragraph or bullets or table"
    }
  ],
  "action_items": [
    {
      "description": "string",
      "owner": "string or [Owner TBD]",
      "due_date": "string or [Date TBD]",
      "status": "string",
      "notes": "string"
    }
  ],
  "decisions": [
    {
      "description": "string",
      "context": "string",
      "rationale": "string"
    }
  ],
  "risks_issues": [
    {
      "type": "risk or issue",
      "description": "string",
      "impact": "string",
      "mitigation": "string"
    }
  ],
  "open_questions": ["string"],
  "clarifications_needed": ["string - list any missing critical information"]
}`;

  return prompt;
}

export function parseGeminiResponse(response: string): RewrittenContent {
  let cleaned = '';

  try {
    // Ultra-safe null/undefined checks
    if (response === null || response === undefined) {
      throw new Error(
        "No response provided. Please paste Gemini's JSON response.",
      );
    }

    if (typeof response !== 'string') {
      throw new Error('Response must be a string, got: ' + typeof response);
    }

    const trimmedResponse = String(response).trim();

    if (trimmedResponse.length === 0) {
      throw new Error(
        "Response is empty. Please paste Gemini's JSON response.",
      );
    }

    cleaned = trimmedResponse;

    // Remove markdown code blocks if present
    if (cleaned.indexOf('```json') === 0) {
      cleaned = cleaned.replace(/^```json\n?/g, '').replace(/\n?```$/g, '');
    } else if (cleaned.indexOf('```') === 0) {
      cleaned = cleaned.replace(/^```\n?/g, '').replace(/\n?```$/g, '');
    }

    // Trim again
    cleaned = cleaned.trim();

    // Extract JSON if there's extra text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch && jsonMatch[0]) {
      cleaned = jsonMatch[0];
    }

    // Validate JSON structure
    if (cleaned.charAt(cleaned.length - 1) !== '}') {
      throw new Error(
        'JSON appears incomplete - does not end with }. Please copy the complete response.',
      );
    }

    if (cleaned.charAt(0) !== '{') {
      throw new Error(
        'JSON does not start with {. Please copy only the JSON response.',
      );
    }

    // Parse JSON
    let content: any;
    try {
      content = JSON.parse(cleaned);
    } catch (parseError: any) {
      const errorMsg =
        parseError && parseError.message
          ? parseError.message
          : 'Unknown parse error';
      throw new Error('Invalid JSON format: ' + errorMsg);
    }

    // Validate content
    if (!content || typeof content !== 'object') {
      throw new Error('Parsed content is not a valid object.');
    }

    // Check required fields
    if (!content.title || typeof content.title !== 'string') {
      throw new Error('Missing or invalid field: "title"');
    }

    if (!content.sections) {
      throw new Error('Missing required field: "sections"');
    }

    if (!Array.isArray(content.sections)) {
      throw new Error('Field "sections" must be an array.');
    }

    if (content.sections.length === 0) {
      throw new Error(
        'Field "sections" array is empty - must have at least one section.',
      );
    }

    // Validate sections
    for (let i = 0; i < content.sections.length; i++) {
      const section = content.sections[i];

      if (!section || typeof section !== 'object') {
        throw new Error('Section ' + (i + 1) + ' is not valid.');
      }

      if (!section.heading || typeof section.heading !== 'string') {
        throw new Error('Section ' + (i + 1) + ' missing field: "heading"');
      }

      if (
        section.content === undefined ||
        section.content === null ||
        typeof section.content !== 'string'
      ) {
        throw new Error(
          'Section ' +
            (i + 1) +
            ' (' +
            section.heading +
            ') missing or invalid field: "content"',
        );
      }
    }

    // Set defaults for optional fields
    content.metadata = content.metadata || {};
    content.action_items = Array.isArray(content.action_items)
      ? content.action_items
      : [];
    content.decisions = Array.isArray(content.decisions)
      ? content.decisions
      : [];
    content.risks_issues = Array.isArray(content.risks_issues)
      ? content.risks_issues
      : [];
    content.open_questions = Array.isArray(content.open_questions)
      ? content.open_questions
      : [];
    content.clarifications_needed = Array.isArray(content.clarifications_needed)
      ? content.clarifications_needed
      : [];

    return content as RewrittenContent;
  } catch (error: any) {
    // Ultra-safe error logging
    const errorMessage =
      error && error.message ? String(error.message) : 'Unknown error occurred';

    console.error('=== PARSE ERROR ===');
    console.error('Error:', errorMessage);

    if (cleaned) {
      const cleanedStr = String(cleaned);
      const len = cleanedStr.length;
      console.error('Cleaned response length:', len);
      if (len > 0) {
        console.error(
          'First 100 chars:',
          cleanedStr.substring(0, Math.min(100, len)),
        );
        console.error(
          'Last 100 chars:',
          cleanedStr.substring(Math.max(0, len - 100)),
        );
      }
    }

    throw new Error(errorMessage);
  }
}
