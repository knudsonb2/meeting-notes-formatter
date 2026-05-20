import { TemplateStructure } from '@/types/documents';

// Simplified template analysis without AI
export function analyzeTemplateStructure(
  templateText: string,
): TemplateStructure {
  // Simple heuristic-based analysis
  const lines = templateText.split('\n').filter((l) => l.trim().length > 0);

  const sections: any[] = [];
  let currentSection = '';

  for (const line of lines) {
    // Detect headings (lines with fewer than 50 chars and ending with : or all caps)
    if (
      line.length < 50 &&
      (line.includes(':') || line === line.toUpperCase())
    ) {
      currentSection = line.replace(':', '').trim();
      if (currentSection.length > 0 && currentSection.length < 40) {
        sections.push({
          heading: currentSection,
          purpose: `Content for ${currentSection}`,
          expected_content: 'Narrative content',
          format: 'paragraph',
        });
      }
    }
  }

  return {
    document_type: 'meeting_minutes',
    title_pattern: 'Meeting Notes',
    metadata_fields: ['title', 'date', 'attendees', 'author'],
    sections:
      sections.length > 0 ? sections : getFallbackTemplateStructure().sections,
    tables: [],
    tone: 'professional',
    special_instructions: [],
  };
}

export function getFallbackTemplateStructure(): TemplateStructure {
  return {
    document_type: 'meeting_minutes',
    title_pattern: 'Meeting Notes',
    metadata_fields: ['title', 'date', 'attendees', 'author'],
    sections: [
      {
        heading: 'Meeting Information',
        purpose: 'Basic meeting metadata',
        expected_content: 'Table with meeting details',
        format: 'table',
      },
      {
        heading: 'Purpose',
        purpose: 'Meeting objective',
        expected_content: 'Brief statement of meeting purpose',
        format: 'paragraph',
      },
      {
        heading: 'Summary',
        purpose: 'High-level overview',
        expected_content: 'Brief summary of meeting',
        format: 'paragraph',
      },
      {
        heading: 'Discussion',
        purpose: 'Detailed discussion points',
        expected_content: 'Organized discussion by topic',
        format: 'mixed',
      },
      {
        heading: 'Decisions',
        purpose: 'Track decisions made',
        expected_content: 'List or table of decisions',
        format: 'table',
      },
      {
        heading: 'Action Items',
        purpose: 'Track action items',
        expected_content: 'Table with action items, owners, and due dates',
        format: 'table',
      },
      {
        heading: 'Risks and Issues',
        purpose: 'Track risks and issues',
        expected_content: 'Table or list of risks and issues',
        format: 'table',
      },
      {
        heading: 'Open Questions',
        purpose: 'Track unresolved questions',
        expected_content: 'List of open questions',
        format: 'bullets',
      },
      {
        heading: 'Next Steps',
        purpose: 'Next actions or meetings',
        expected_content: 'List of next steps',
        format: 'bullets',
      },
    ],
    tables: [
      {
        heading: 'Action Items',
        columns: ['#', 'Action Item', 'Owner', 'Due Date', 'Notes'],
        purpose: 'Track action items with ownership',
      },
      {
        heading: 'Decisions',
        columns: ['#', 'Decision', 'Context / Rationale'],
        purpose: 'Document decisions made',
      },
    ],
    tone: 'professional',
    special_instructions: [
      'Use clear headings',
      'Include tables for structured data',
    ],
  };
}
