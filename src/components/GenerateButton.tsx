'use client';

import { useState } from 'react';
import { Button, Callout, Icon, TextArea, Card } from '@blueprintjs/core';
import type {
  TemplateMetadata,
  MeetingNotesData,
  ProcessedResult,
} from '@/types/documents';

interface GenerateButtonProps {
  template: TemplateMetadata;
  notes: MeetingNotesData;
  onGenerate: (result: ProcessedResult) => void;
}

export default function GenerateButton({
  template,
  notes,
  onGenerate,
}: GenerateButtonProps) {
  const [showGemini, setShowGemini] = useState(false);
  const [geminiOutput, setGeminiOutput] = useState('');
  const [promptCopied, setPromptCopied] = useState(false);

  const generatePrompt = () => {
    const structure = template.structure;

    if (!structure) {
      return 'Error: Template structure not loaded. Please re-select the template.';
    }

    // Build detailed section descriptions
    const sectionsJson = structure.sections.map((section, idx) => {
      const details: any = {
        heading: section.heading,
        level: section.level,
        order: section.order,
        formatting: section.formatting,
        expected_content: section.content
          ? 'Use template guidance as reference'
          : 'Extract from meeting notes',
      };

      if (section.hasTable) {
        const relatedTable = structure.tables.find(
          (t) => t.sectionIndex === idx,
        );
        if (relatedTable) {
          details.table = {
            columns: relatedTable.columns,
            purpose: relatedTable.purpose,
          };
        }
      }

      if (section.hasList) {
        const relatedList = structure.lists.find((l) => l.sectionIndex === idx);
        if (relatedList) {
          details.list_type = relatedList.type;
        }
      }

      return details;
    });

    // Build table descriptions
    const tablesJson = structure.tables.map((table) => ({
      heading: table.heading,
      columns: table.columns,
      example_rows: table.rows.slice(0, 2),
      total_rows: table.rows.length,
    }));

    // Build placeholder descriptions
    const placeholdersJson = structure.placeholders.map((p) => ({
      text: p.text,
      type: p.type,
      location:
        structure.sections[p.sectionIndex]?.heading || 'Unknown section',
    }));

    return `PERSONA:
You are a senior U.S. Army Corps of Engineers (USACE) professional with 25 years of experience across multiple disciplines:
- Civil and Environmental Engineering
- Biology and Environmental Science
- Project and Program Management
- Regulatory and Permitting Processes
- Construction Management and Quality Control
- Senior Leadership and Strategic Planning

You are intimately familiar with USACE processes, especially the Planning, Design, Build, Partner (PDBP) process. You have extensive experience translating messy, incomplete field notes and meeting discussions into clear, concise, professional documentation suitable for senior leader review and decision-making.

Your expertise allows you to:
- Make logical connections between incomplete thoughts and unfinished ideas
- Identify implicit decisions and action items that weren't explicitly stated
- Understand technical context and fill gaps with appropriate professional assumptions (marked as such)
- Organize chaotic information into structured, logical formats
- Write in the professional tone expected by USACE leadership
- Apply proper military and engineering documentation standards

TASK:
Transform the provided raw, messy meeting notes into a professional ${structure.documentType.toUpperCase()} document following the exact template structure and formatting rules provided below.

CRITICAL FORMATTING RULES (MUST BE APPLIED TO OUTPUT):
1. Output PLAIN TEXT only in the JSON structure - NO MARKDOWN, NO HTML, NO FORMATTING CODES in content fields
2. Do NOT use ** for bold, _ for italics, # for headers, or any markdown syntax in content
3. Write content as plain sentences and paragraphs
4. For missing information, use EXACTLY this format: [Owner TBD], [Date TBD], [Clarification needed: specific question]
5. When making logical inferences from incomplete notes, note them as: [Inferred: explanation]
6. Maintain professional, neutral, objective tone suitable for senior USACE leadership
7. Do NOT duplicate information across sections
8. Extract all decisions, action items, risks, and issues clearly and completely
9. Follow the EXACT template structure, section order, and formatting rules below
10. Apply ALL CAPS to section headings where indicated in template formatting
11. Preserve table structures with exact column names from template
12. Maintain list types (bullet vs numbered) as specified in template
13. Use professional USACE terminology and abbreviations appropriately
14. Connect fragmented thoughts into coherent narratives
15. Identify implicit commitments and convert them to explicit action items

SIGNATURE BLOCK: NO - Do not include signature block unless template explicitly shows one

===== ANALYZED TEMPLATE STRUCTURE =====
Template File: ${template.displayName}
Document Type: ${structure.documentType.toUpperCase()}
Total Sections: ${structure.sections.length}
Total Tables: ${structure.tables.length}
Total Placeholders: ${structure.placeholders.length}

SECTION STRUCTURE (FOLLOW EXACT ORDER, APPLY FORMATTING RULES):
${JSON.stringify(sectionsJson, null, 2)}

FORMATTING RULES FROM TEMPLATE:
${structure.sections
  .map((s, idx) => {
    let rules = `Section ${idx + 1}: "${s.heading}"`;
    if (s.formatting.isAllCaps) rules += ' - USE ALL CAPS';
    if (s.formatting.isUnderlined)
      rules += ` - Underline with ${s.level === 1 ? '=' : '-'} characters`;
    if (s.formatting.isBold) rules += ' - Header should stand out';
    if (s.hasTable) rules += ' - CONTAINS TABLE (see structure below)';
    if (s.hasList) rules += ' - CONTAINS LIST';
    return rules;
  })
  .join('\n')}

${
  structure.tables.length > 0
    ? `
TABLE STRUCTURES FOUND IN TEMPLATE (REPLICATE EXACTLY):
${JSON.stringify(tablesJson, null, 2)}

CRITICAL: When creating table content, use the EXACT column names from above. Format each row clearly.
`
    : ''
}

${
  structure.placeholders.length > 0
    ? `
PLACEHOLDERS DETECTED IN TEMPLATE:
${JSON.stringify(placeholdersJson, null, 2)}

Fill these placeholders with extracted data or use [TBD] format if information is not in meeting notes.
`
    : ''
}

SECTION HEADINGS TO USE (IN EXACT ORDER WITH EXACT FORMATTING):
${structure.sections
  .map((s, idx) => {
    let line = `${idx + 1}. ${s.heading}`;
    if (s.formatting.isAllCaps) line += ' (ALL CAPS)';
    if (s.hasTable) line += ' [Contains Table]';
    if (s.hasList) line += ' [Contains List]';
    return line;
  })
  .join('\n')}

===== END TEMPLATE STRUCTURE =====

MEETING NOTES TO TRANSFORM (Raw, Messy, Incomplete):
---
${notes.rawText}
---

YOUR EXPERT ANALYSIS APPROACH:
1. Read through all notes to understand overall meeting context and purpose
2. Identify key themes, decisions, and action items (even if not explicitly labeled)
3. Recognize implicit commitments and convert to explicit action items
4. Make logical connections between fragmented statements
5. Organize information according to template section structure
6. Apply professional USACE writing standards and terminology
7. Fill in reasonable context based on your 25 years of experience (mark inferences)
8. Format for senior leader consumption - clear, concise, actionable
9. Ensure all template formatting rules are applied
10. Verify no information is duplicated across sections

INSTRUCTIONS FOR JSON OUTPUT:
1. Create a JSON object with the structure below
2. For each section in "sections" array, use the EXACT heading from template (with proper capitalization)
3. Apply formatting rules: ALL CAPS where indicated, proper underlines, etc.
4. Extract content from meeting notes using your expertise to organize and clarify
5. Make logical inferences to complete incomplete thoughts (mark as [Inferred: reason])
6. If template has tables, format that section's content to align with table structure
7. Maintain the ORDER of sections as they appear in template (use "order" field)
8. Use [TBD] or [Clarification needed: reason] only for truly missing critical information
9. Write in professional USACE tone suitable for senior leadership
10. Extract decisions, action items, and risks/issues into structured fields
11. Connect dots between incomplete statements to create coherent narrative
12. Identify implicit action items and owners based on context

Return ONLY valid JSON (no markdown code blocks, no extra text, no preamble):
{
  "title": "string (use ${structure.sections[0]?.heading || 'Meeting Document'} or derive appropriate title)",
  "document_type": "${structure.documentType}",
  "metadata": {
    "date": "string (extract from notes or use [Date TBD])",
    "project": "string (extract or infer from context)",
    "attendees": ["string (extract all participants, use [Attendee TBD] if incomplete)"],
    "author": "string (extract from notes or use [Author TBD])",
    "organization": "string (use U.S. Army Corps of Engineers or specific district if mentioned)"
  },
  "sections": [
    {
      "heading": "string (USE EXACT HEADING FROM TEMPLATE WITH PROPER CAPS)",
      "order": number (use order from template structure - DO NOT REORDER),
      "content": "string (PLAIN TEXT - organized, professional, clear - apply your expertise to clarify messy notes)",
      "format": "paragraph or bullets or table",
      "has_table": boolean,
      "has_list": boolean
    }
  ],
  "action_items": [
    {
      "description": "string (clear, actionable, specific)",
      "owner": "string (person responsible) or [Owner TBD]",
      "due_date": "string (specific date) or [Date TBD]",
      "status": "string (Open, In Progress, etc.) or [Status TBD]",
      "notes": "string (context, dependencies, clarifications)"
    }
  ],
  "decisions": [
    {
      "description": "string (clear decision statement)",
      "context": "string (why this decision was needed)",
      "rationale": "string (reasoning behind decision or [Rationale TBD])"
    }
  ],
  "risks_issues": [
    {
      "type": "risk or issue",
      "description": "string (clear description of risk/issue)",
      "impact": "string (potential impact on project/schedule/budget)",
      "mitigation": "string (mitigation strategy) or [Mitigation TBD]"
    }
  ],
  "open_questions": ["string (clear questions that need answers)"],
  "clarifications_needed": ["string (specific items needing clarification with context)"]
}

FINAL REMINDERS FOR YOUR EXPERT ANALYSIS:
- Use your 25 years of USACE experience to interpret context
- Apply PDBP process knowledge to organize information appropriately
- Make logical connections between incomplete thoughts
- Use professional USACE terminology and writing standards
- Format for senior leader review - clear, concise, actionable
- Use EXACT section headings from template with proper formatting (ALL CAPS where indicated)
- Maintain template's section order (do not reorganize)
- Apply table structures exactly as shown in template
- Mark inferences clearly: [Inferred: explanation]
- Only use [TBD] for genuinely missing information
- Convert implicit commitments to explicit action items with owners`;
  };

  const cleanGeminiOutput = (output: string): string => {
    let cleaned = output;

    // Remove markdown code blocks
    cleaned = cleaned.replace(/^```json\s*\n/i, '');
    cleaned = cleaned.replace(/^```\s*\n/i, '');
    cleaned = cleaned.replace(/\n```$/i, '');

    // Extract JSON
    const jsonStart = cleaned.indexOf('{');
    if (jsonStart > 0) {
      cleaned = cleaned.substring(jsonStart);
    }

    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonEnd > 0 && jsonEnd < cleaned.length - 1) {
      cleaned = cleaned.substring(0, jsonEnd + 1);
    }

    cleaned = cleaned.trim();

    // Parse and format
    try {
      const parsed = JSON.parse(cleaned);

      // Sort sections by order if present
      if (parsed.sections && template.structure) {
        parsed.sections.sort((a: any, b: any) => {
          const orderA = a.order ?? 999;
          const orderB = b.order ?? 999;
          return orderA - orderB;
        });
      }

      // Convert JSON to formatted document
      let document = '';

      // Title
      if (parsed.title) {
        document += `${parsed.title}\n\n`;
      }

      // Metadata section
      if (parsed.metadata) {
        document += 'MEETING INFORMATION\n';
        document += '='.repeat(50) + '\n';
        if (parsed.metadata.date) document += `Date: ${parsed.metadata.date}\n`;
        if (parsed.metadata.project)
          document += `Project: ${parsed.metadata.project}\n`;
        if (parsed.metadata.attendees && parsed.metadata.attendees.length > 0) {
          document += `Attendees: ${parsed.metadata.attendees.join(', ')}\n`;
        }
        if (parsed.metadata.author)
          document += `Author: ${parsed.metadata.author}\n`;
        if (parsed.metadata.organization)
          document += `Organization: ${parsed.metadata.organization}\n`;
        document += '\n';
      }

      // Sections (using template structure to determine formatting)
      if (parsed.sections && parsed.sections.length > 0) {
        for (const section of parsed.sections) {
          const templateSection = template.structure?.sections.find(
            (s) => s.heading.toLowerCase() === section.heading.toLowerCase(),
          );

          // Header formatting based on template
          if (
            templateSection?.formatting.isAllCaps ||
            section.heading === section.heading.toUpperCase()
          ) {
            document += `${section.heading.toUpperCase()}\n`;
          } else {
            document += `${section.heading}\n`;
          }

          // Underline based on level
          if (templateSection?.level === 1) {
            document += '='.repeat(50) + '\n';
          } else {
            document += '-'.repeat(50) + '\n';
          }

          document += `${section.content}\n\n`;
        }
      }

      // Action Items Table
      if (parsed.action_items && parsed.action_items.length > 0) {
        document += 'ACTION ITEMS\n';
        document += '='.repeat(50) + '\n';

        // Check if template has action items table structure
        const actionTable = template.structure?.tables.find((t) =>
          t.heading?.toLowerCase().includes('action'),
        );

        if (actionTable && actionTable.columns.length > 0) {
          // Use template's column structure
          document += `Columns: ${actionTable.columns.join(' | ')}\n`;
          document += '-'.repeat(50) + '\n';
        }

        parsed.action_items.forEach((item: any, index: number) => {
          document += `${index + 1}. ${item.description}\n`;
          document += `   Owner: ${item.owner}\n`;
          document += `   Due Date: ${item.due_date}\n`;
          if (item.status) document += `   Status: ${item.status}\n`;
          if (item.notes) document += `   Notes: ${item.notes}\n`;
          document += '\n';
        });
      }

      // Decisions Table
      if (parsed.decisions && parsed.decisions.length > 0) {
        document += 'DECISIONS\n';
        document += '='.repeat(50) + '\n';

        const decisionsTable = template.structure?.tables.find((t) =>
          t.heading?.toLowerCase().includes('decision'),
        );

        if (decisionsTable && decisionsTable.columns.length > 0) {
          document += `Columns: ${decisionsTable.columns.join(' | ')}\n`;
          document += '-'.repeat(50) + '\n';
        }

        parsed.decisions.forEach((decision: any, index: number) => {
          document += `${index + 1}. ${decision.description}\n`;
          if (decision.context) document += `   Context: ${decision.context}\n`;
          if (decision.rationale)
            document += `   Rationale: ${decision.rationale}\n`;
          document += '\n';
        });
      }

      // Risks and Issues
      if (parsed.risks_issues && parsed.risks_issues.length > 0) {
        document += 'RISKS AND ISSUES\n';
        document += '='.repeat(50) + '\n';
        parsed.risks_issues.forEach((risk: any, index: number) => {
          document += `${index + 1}. [${risk.type.toUpperCase()}] ${risk.description}\n`;
          if (risk.impact) document += `   Impact: ${risk.impact}\n`;
          if (risk.mitigation)
            document += `   Mitigation: ${risk.mitigation}\n`;
          document += '\n';
        });
      }

      // Open Questions
      if (parsed.open_questions && parsed.open_questions.length > 0) {
        document += 'OPEN QUESTIONS\n';
        document += '='.repeat(50) + '\n';
        parsed.open_questions.forEach((question: string, index: number) => {
          document += `${index + 1}. ${question}\n`;
        });
        document += '\n';
      }

      // Clarifications Needed
      if (
        parsed.clarifications_needed &&
        parsed.clarifications_needed.length > 0
      ) {
        document += 'CLARIFICATIONS NEEDED\n';
        document += '='.repeat(50) + '\n';
        parsed.clarifications_needed.forEach(
          (clarification: string, index: number) => {
            document += `${index + 1}. ${clarification}\n`;
          },
        );
        document += '\n';
      }

      return document;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return cleaned;
    }
  };

  const handleCopyPrompt = () => {
    const prompt = generatePrompt();
    navigator.clipboard.writeText(prompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const handleStartGemini = () => {
    if (!template.structure) {
      alert('Template structure not loaded. Please re-select the template.');
      return;
    }
    setShowGemini(true);
  };

  const handleSubmitGeminiOutput = () => {
    if (!geminiOutput.trim()) {
      alert('Please paste the output from Gemini first');
      return;
    }

    const cleanedOutput = cleanGeminiOutput(geminiOutput);

    const result: ProcessedResult = {
      formattedDocument: cleanedOutput,
      metadata: {
        templateUsed: template.name,
        notesSource: notes.fileName,
        generatedAt: new Date().toISOString(),
      },
    };

    onGenerate(result);
  };

  if (!showGemini) {
    return (
      <div
        className='card-section'
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <h3 className='card-title' style={{ color: 'white' }}>
          <Icon icon='automatic-updates' style={{ color: 'white' }} />
          Step 3: Use Gemini AI
        </h3>

        <Callout
          intent='none'
          icon='info-sign'
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            color: '#2c3e50',
          }}
        >
          <strong style={{ color: '#2c3e50' }}>Expert USACE Processing!</strong>
          <p style={{ marginTop: '0.5rem', marginBottom: 0, color: '#495057' }}>
            The AI will assume the role of a senior USACE professional with 25
            years of experience to transform your messy notes into a
            professional document following{' '}
            <strong>{template.displayName}</strong> exactly.
          </p>
        </Callout>

        {template.structure && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
            }}
          >
            <div
              style={{
                fontWeight: 700,
                marginBottom: '1rem',
                fontSize: '1rem',
              }}
            >
              Extracted Template Analysis:
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
              }}
            >
              <div>
                <Icon icon='list' size={14} style={{ marginRight: '0.5rem' }} />
                <strong>{template.structure.sections.length}</strong> sections
              </div>
              <div>
                <Icon icon='th' size={14} style={{ marginRight: '0.5rem' }} />
                <strong>{template.structure.tables.length}</strong> tables
              </div>
              <div>
                <Icon icon='tag' size={14} style={{ marginRight: '0.5rem' }} />
                <strong>{template.structure.placeholders.length}</strong>{' '}
                placeholders
              </div>
              <div>
                <Icon
                  icon='properties'
                  size={14}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong>{template.structure.lists.length}</strong> lists
              </div>
            </div>
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                Document Type:{' '}
                <strong>{template.structure.documentType.toUpperCase()}</strong>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleStartGemini}
          large
          fill
          intent='success'
          icon={<Icon icon='flash' size={20} />}
          disabled={!template.structure}
          style={{
            height: '60px',
            fontSize: '1.2rem',
            fontWeight: 700,
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
          }}
          className='generate-button-hover'
        >
          Start Expert USACE Workflow
        </Button>

        <style jsx global>{`
          .generate-button-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3) !important;
          }
          .generate-button-hover:active {
            transform: translateY(0);
          }
        `}</style>

        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <Icon icon='tick-circle' size={16} />
            <strong>Template:</strong> {template.displayName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon icon='tick-circle' size={16} />
            <strong>Notes:</strong> {notes.fileName}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='card-section'>
      <h3 className='card-title'>
        <Icon icon='chat' />
        Expert USACE Gemini Workflow
      </h3>

      <Callout
        intent='success'
        icon='endorsed'
        style={{ marginBottom: '2rem' }}
      >
        <strong>Senior USACE Expert Analysis!</strong>
        <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
          The prompt instructs Gemini to act as a senior USACE professional with
          25 years of experience, making logical connections from incomplete
          notes and formatting for senior leadership review.
        </p>
      </Callout>

      {/* Step 1: Copy Prompt */}
      <Card
        elevation={2}
        style={{
          marginBottom: '2rem',
          padding: '2rem',
          border: '2px solid #e9ecef',
          borderRadius: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            1
          </div>
          <h4
            style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#2c3e50',
            }}
          >
            Copy expert USACE prompt
          </h4>
        </div>

        <p
          style={{
            marginBottom: '1rem',
            color: '#495057',
            fontSize: '0.95rem',
          }}
        >
          This prompt includes the USACE expert persona, template structure, and
          formatting rules. Gemini will interpret messy notes like an
          experienced USACE professional.
        </p>

        <TextArea
          value={generatePrompt()}
          readOnly
          fill
          rows={14}
          style={{
            fontFamily: 'monospace',
            fontSize: '0.72rem',
            marginBottom: '1rem',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            color: '#212529',
          }}
        />

        <Button
          icon={promptCopied ? 'tick' : 'duplicate'}
          intent={promptCopied ? 'success' : 'primary'}
          text={
            promptCopied ? 'Copied to Clipboard!' : 'Copy Prompt to Clipboard'
          }
          onClick={handleCopyPrompt}
          large
          style={{
            height: '48px',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        />
      </Card>

      {/* Step 2: Go to Gemini */}
      <Card
        elevation={2}
        style={{
          marginBottom: '2rem',
          padding: '2rem',
          border: '2px solid #e9ecef',
          borderRadius: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            2
          </div>
          <h4
            style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#2c3e50',
            }}
          >
            Paste into GenAI.mil Gemini
          </h4>
        </div>

        <p
          style={{
            marginBottom: '1.5rem',
            color: '#495057',
            fontSize: '0.95rem',
            lineHeight: '1.6',
          }}
        >
          Open <strong>GenAI.mil</strong>, navigate to Gemini Enterprise, and
          paste the expert USACE prompt. Gemini will analyze your notes with 25
          years of USACE experience.
        </p>

        <Button
          icon='share'
          text='Open GenAI.mil in New Tab'
          onClick={() => window.open('https://genai.mil', '_blank')}
          large
          intent='primary'
          style={{
            height: '48px',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        />
      </Card>

      {/* Step 3: Paste Response */}
      <Card
        elevation={2}
        style={{
          marginBottom: '2rem',
          padding: '2rem',
          border: '2px solid #e9ecef',
          borderRadius: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            3
          </div>
          <h4
            style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#2c3e50',
            }}
          >
            Paste Gemini's professional output here
          </h4>
        </div>

        <p
          style={{
            marginBottom: '1rem',
            color: '#495057',
            fontSize: '0.95rem',
          }}
        >
          Copy the JSON-formatted document from Gemini. The expert analysis will
          have clarified messy notes and organized them according to your
          template.
        </p>

        <TextArea
          value={geminiOutput}
          onChange={(e) => setGeminiOutput(e.target.value)}
          placeholder='Paste the JSON response here...

Should start with:
{
  "title": "...",
  "document_type": "...",
  "metadata": { ... },
  "sections": [ ... ]
}'
          fill
          growVertically
          rows={12}
          style={{
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            border: '2px solid #dee2e6',
            color: '#212529',
            lineHeight: '1.6',
          }}
        />

        <Button
          icon='tick'
          intent='success'
          text='Submit Expert-Formatted Document'
          onClick={handleSubmitGeminiOutput}
          disabled={!geminiOutput.trim()}
          large
          fill
          style={{
            height: '56px',
            fontSize: '1.1rem',
            fontWeight: 700,
          }}
        />
      </Card>

      <Button
        minimal
        icon='arrow-left'
        text='Back to Previous Step'
        onClick={() => setShowGemini(false)}
        style={{ marginTop: '0.5rem' }}
        large
      />
    </div>
  );
}
