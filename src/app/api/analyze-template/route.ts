import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { templatePath } = await request.json();

    if (!templatePath) {
      return NextResponse.json(
        { error: 'Template path is required' },
        { status: 400 },
      );
    }

    const fullPath = path.join(process.cwd(), 'public', templatePath);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Template file not found' },
        { status: 404 },
      );
    }

    const buffer = fs.readFileSync(fullPath);

    // Extract raw text
    const textResult = await mammoth.extractRawText({ buffer });
    const rawText = textResult.value;

    // Extract HTML with styling to get structure
    const htmlResult = await mammoth.convertToHtml({
      buffer,
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Title'] => h1.title:fresh",
      ],
    });
    const html = htmlResult.value;

    // Parse comprehensive structure
    const structure = parseTemplateStructure(html, rawText);

    return NextResponse.json({ structure });
  } catch (error) {
    console.error('Error analyzing template:', error);
    return NextResponse.json(
      { error: 'Failed to analyze template', details: String(error) },
      { status: 500 },
    );
  }
}

function parseTemplateStructure(html: string, rawText: string) {
  const sections: any[] = [];
  const tables: any[] = [];
  const placeholders: any[] = [];
  const lists: any[] = [];

  // Parse HTML structure
  const lines = rawText.split('\n');
  let currentSection: any = null;
  let sectionOrder = 0;

  // Extract sections with formatting detection
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Detect headers (multiple heuristics)
    const isHeader =
      // All caps
      (line === line.toUpperCase() && line.length > 3 && line.length < 100) ||
      // Numbered sections (1. 2. 3. or I. II. III.)
      line.match(/^([IVXLCDM]+\.|[\d]+\.)\s+[A-Z]/) ||
      // Common document headers
      line.match(
        /^(MEMORANDUM|SUBJECT|FROM|TO|DATE|PURPOSE|SUMMARY|DISCUSSION|DECISIONS|ACTION ITEMS|RISKS|QUESTIONS|NEXT STEPS|BACKGROUND|ATTENDEES|AGENDA)/i,
      ) ||
      // Short lines that appear to be headers (heuristic)
      (line.length < 60 &&
        !line.endsWith('.') &&
        !line.endsWith(',') &&
        line[0] === line[0].toUpperCase());

    if (isHeader) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }

      // Determine heading level
      let level = 1;
      if (line.match(/^[\d]+\./)) level = 2;
      else if (line.match(/^[a-z]\./i)) level = 3;
      else if (line === line.toUpperCase()) level = 1;

      currentSection = {
        heading: line,
        level,
        content: '',
        formatting: {
          isBold: true, // Assume headers are bold
          isUnderlined: line === line.toUpperCase(),
          isAllCaps: line === line.toUpperCase(),
        },
        subsections: [],
        hasTable: false,
        hasList: false,
        order: sectionOrder++,
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  // Extract tables from HTML
  const tableRegex = /<table>(.*?)<\/table>/gs;
  let tableMatch;
  let tableIndex = 0;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableHtml = tableMatch[1];
    const rows: string[][] = [];

    // Extract rows
    const rowRegex = /<tr>(.*?)<\/tr>/gs;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const rowHtml = rowMatch[1];
      const cells: string[] = [];

      // Extract cells (both th and td)
      const cellRegex = /<t[hd]>(.*?)<\/t[hd]>/gs;
      let cellMatch;

      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
      }

      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    if (rows.length > 0) {
      const columns = rows[0]; // First row is headers
      const dataRows = rows.slice(1);

      tables.push({
        heading: sections[Math.min(tableIndex, sections.length - 1)]?.heading,
        columns,
        rows: dataRows,
        purpose: `Table with ${columns.length} columns and ${dataRows.length} rows`,
        sectionIndex: Math.min(tableIndex, sections.length - 1),
      });

      // Mark section as having table
      if (sections[tableIndex]) {
        sections[tableIndex].hasTable = true;
      }

      tableIndex++;
    }
  }

  // Extract placeholders with context
  const placeholderPatterns = [
    { regex: /\[([^\]]+)\]/g, type: 'bracket' },
    { regex: /_{3,}/g, type: 'underscore' },
    { regex: /\{\{([^}]+)\}\}/g, type: 'curly' },
    { regex: /<([^>]+)>/g, type: 'angle' },
  ];

  for (const pattern of placeholderPatterns) {
    let match;
    while ((match = pattern.regex.exec(rawText)) !== null) {
      const text = match[1] || match[0];
      const contextStart = Math.max(0, match.index - 50);
      const contextEnd = Math.min(
        rawText.length,
        match.index + text.length + 50,
      );
      const context = rawText.substring(contextStart, contextEnd);

      // Find which section this belongs to
      let sectionIndex = 0;
      let charCount = 0;
      for (let i = 0; i < sections.length; i++) {
        charCount += sections[i].heading.length + sections[i].content.length;
        if (charCount > match.index) {
          sectionIndex = i;
          break;
        }
      }

      placeholders.push({
        text,
        type: pattern.type,
        context,
        sectionIndex,
      });
    }
  }

  // Extract lists
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const content = section.content;

    // Detect bullet lists
    const bulletItems = content.match(/^[\-\*•]\s+.+$/gm);
    if (bulletItems && bulletItems.length > 0) {
      lists.push({
        type: 'bullet',
        items: bulletItems.map((item) => item.replace(/^[\-\*•]\s+/, '')),
        sectionIndex: i,
      });
      section.hasList = true;
    }

    // Detect numbered lists
    const numberedItems = content.match(/^\d+\.\s+.+$/gm);
    if (numberedItems && numberedItems.length > 0) {
      lists.push({
        type: 'numbered',
        items: numberedItems.map((item) => item.replace(/^\d+\.\s+/, '')),
        sectionIndex: i,
      });
      section.hasList = true;
    }
  }

  // Detect document type
  let documentType = 'document';
  const titleLower = rawText.toLowerCase();
  if (
    titleLower.includes('memorandum for record') ||
    titleLower.includes('mfr')
  ) {
    documentType = 'mfr';
  } else if (
    titleLower.includes('meeting minutes') ||
    titleLower.includes('meeting notes')
  ) {
    documentType = 'minutes';
  } else if (titleLower.includes('memorandum') || titleLower.includes('memo')) {
    documentType = 'memo';
  } else if (titleLower.includes('report')) {
    documentType = 'report';
  }

  return {
    title: sections[0]?.heading || 'Untitled',
    documentType,
    sections,
    tables,
    placeholders,
    lists,
    rawText,
    metadata: {
      hasHeader:
        rawText.substring(0, 200).includes('MEMORANDUM') ||
        rawText.substring(0, 200).includes('SUBJECT'),
      hasFooter: false, // Would need more sophisticated detection
      totalSections: sections.length,
      totalTables: tables.length,
      totalPlaceholders: placeholders.length,
    },
  };
}
