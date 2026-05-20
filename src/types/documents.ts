export interface TemplateMetadata {
  name: string;
  displayName: string;
  path: string;
  structure?: TemplateStructure;
}

export interface TemplateStructure {
  title?: string;
  documentType: string; // 'memo', 'minutes', 'mfr', 'report', etc.
  sections: TemplateSection[];
  tables: TemplateTable[];
  placeholders: TemplatePlaceholder[];
  lists: TemplateList[];
  rawText: string;
  metadata: {
    hasHeader: boolean;
    hasFooter: boolean;
    totalSections: number;
    totalTables: number;
    totalPlaceholders: number;
  };
}

export interface TemplateSection {
  heading: string;
  level: number; // 1 = h1, 2 = h2, etc.
  content: string;
  formatting: {
    isBold: boolean;
    isUnderlined: boolean;
    isAllCaps: boolean;
  };
  subsections: TemplateSection[];
  hasTable: boolean;
  hasList: boolean;
  order: number; // Position in document
}

export interface TemplateTable {
  heading?: string;
  columns: string[];
  rows: string[][];
  purpose?: string;
  sectionIndex: number; // Which section this table belongs to
}

export interface TemplatePlaceholder {
  text: string;
  type: 'bracket' | 'underscore' | 'curly' | 'angle'; // [text], ____, {{text}}, <text>
  context?: string; // Surrounding text for context
  sectionIndex: number;
}

export interface TemplateList {
  type: 'bullet' | 'numbered';
  items: string[];
  sectionIndex: number;
}

export interface MeetingNotesData {
  rawText: string;
  fileName: string;
}

export interface ProcessedResult {
  formattedDocument: string;
  metadata: {
    templateUsed: string;
    notesSource: string;
    generatedAt: string;
  };
}
