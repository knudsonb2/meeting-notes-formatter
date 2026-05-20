# AI Assistant Context: Meeting Notes Formatter

**Purpose:** This document provides AI assistants with essential project context for future development work.

---

## Project Overview

### What It Does

The Meeting Notes Formatter transforms messy meeting notes into professionally formatted USACE documents using Gemini Enterprise AI through a manual GenAI.mil workflow.

### Core Workflow

1. User uploads or selects a Word template (`.docx`).
2. Template is analyzed, including sections, tables, and placeholders.
3. User pastes raw meeting notes.
4. App generates a detailed Gemini prompt.
5. User copies the prompt, pastes it into GenAI.mil, and receives a formatted response.
6. User pastes the Gemini response back into the app.
7. App generates a downloadable Word document with highlighting.

### Key Constraint

There are **no API costs**. The tool uses a manual copy/paste workflow with GenAI.mil, creating a hybrid AI approach.

---

## Technology Stack and Rationale

### Framework

**Next.js 14.2.3 — App Router**

- Modern React framework with server-side rendering and API routes.
- Optimized for deployment.
- Uses the `src/app/` directory structure.
- Does **not** use the legacy Pages Router.

### Language

**TypeScript**

- Provides type safety.
- Improves developer experience.
- Catches errors at compile time.

### UI

**Blueprint.js + Tailwind CSS v3**

- **Blueprint.js:** Palantir component library used for buttons, cards, text areas, icons, and related UI elements.
- **Tailwind CSS v3:** Utility-first CSS framework.
- **Important:** Do not use Tailwind v4; it previously caused PostCSS errors.
- **Custom CSS:** `src/app/globals.css` contains custom card styles.

### Document Processing

- **mammoth:** Parses Word `.docx` files and extracts text/HTML.
- **docx:** Generates Word documents programmatically.
- **file-saver:** Handles browser downloads.

### Deployment

**Vercel**

- Auto-deploys from GitHub when changes are pushed to the `main` branch.
- No environment variables are needed.
- The app is fully client-side from the user's perspective.

---

## Architecture Decisions

### Client-Side Only

- No backend storage.
- All processing happens in the browser.
- No database.
- Templates are stored in `public/templates/`.
- Privacy compliant: files never leave the user's browser.

### Component Structure

#### Main Page

`src/app/page.tsx`

- Three-step workflow UI.
- Prominent green privacy banner.
- Two-column layout:
  - Left: controls.
  - Right: preview.

#### Components

1. `TemplateAnalyzer.tsx` — Template selection/upload; calls `/api/analyze-template`.
2. `MeetingNotesInput.tsx` — Text area with tabs for pasted text or uploaded file.
3. `GenerateButton.tsx` — Generates Gemini prompt and handles response processing.
4. `PreviewPanel.tsx` — Sticky preview that remains visible on scroll.
5. `DownloadButton.tsx` — Generates `.docx` files with the highlight system.

#### API Route

`src/app/api/analyze-template/route.ts`

- Server-side template parsing with `mammoth`.
- Extracts sections, tables, placeholders, and lists.
- Returns structured JSON.

---

## Key Files and Their Roles

```text
src/
├── app/
│   ├── page.tsx              # Main UI: three-step workflow
│   ├── layout.tsx            # Root layout; imports Blueprint CSS
│   ├── globals.css           # Custom styles, including .card-section
│   └── api/
│       └── analyze-template/
│           └── route.ts      # Template parsing API
├── components/
│   ├── TemplateAnalyzer.tsx  # Step 1: template selection
│   ├── MeetingNotesInput.tsx # Step 2: notes input
│   ├── PreviewPanel.tsx      # Right sidebar preview
│   ├── GenerateButton.tsx    # Gemini prompt generation
│   └── DownloadButton.tsx    # Word document generation
└── types/
    └── documents.ts          # TypeScript interfaces
```

---

## Important Implementation Details

### Highlighting System

Bracketed placeholders such as `[TBD]`, `[Owner TBD]`, and `[Date TBD]` are automatically highlighted yellow in the Word output.

- Implemented in `DownloadButton.tsx`.
- Core helper: `createTextRunsWithHighlights()`.
- Uses the `docx` library's `TextRun` with `highlight: 'yellow'`.

### Template Analysis

The app detects headers using multiple heuristics:

- All-caps lines.
- Numbered sections, such as `1.`, `2.`, `I.`, and `II.`.
- Common keywords such as `MEMORANDUM`, `SUBJECT`, and `DATE`.
- HTML table extraction.
- Regex-based placeholder detection.

### Mammoth API Usage

Important implementation notes:

- `mammoth.convertToHtml({ buffer })` takes **one object**, not two parameters.
- Do **not** use `styleMap`; it is not included in the TypeScript definitions.
- Extract raw text separately with `mammoth.extractRawText({ buffer })`.

### File-Saver Usage

```typescript
const fileSaver = await import('file-saver');
fileSaver.saveAs(blob, filename);
```

Use simple import and direct usage. Avoid complex conditional checks.

---

## Development Workflow

### Local Development Commands

```powershell
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build
npm run lint      # Run linter
```

### Common Issues

#### 1. Build Cache Corruption

```powershell
Remove-Item -Recurse -Force .next
npm run build
```

#### 2. TypeScript Errors

- Always generate entire files.
- Run `npm run build` before committing.
- Vercel uses stricter checks than local builds.

#### 3. Import Errors

- Check whether packages are installed:

```powershell
npm install
```

- Blueprint CSS should be imported in `layout.tsx`.
- Types should be defined in `src/types/documents.ts`.

---

## User Preferences

1. Always generate entire files. Do not provide partial edits.
2. Use PowerShell. The user is working in a Windows environment.
3. Test builds locally. Run `npm run build` before pushing.
4. Commit frequently with clear commit messages.

---

## Code Patterns

### Component Structure

```typescript
'use client';

import { useState } from 'react';
import { Button, Card } from '@blueprintjs/core';

interface ComponentProps {
  // Props
}

export default function Component({ props }: ComponentProps) {
  // Component logic
}
```

### API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    // Process

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: 'Message' }, { status: 500 });
  }
}
```

---

## Project Evolution

### Version 0.1.0 — Current

- Started with a multi-step template-based workflow.
- Removed unused components, including `DocumentPreview`, `MetadataForm`, and others.
- Simplified to a three-step process.
- Added sticky preview panel.
- Implemented privacy banner.
- Fixed Tailwind v3 compatibility issues.
- Deployed to Vercel.

### Removed or Deprecated

- `src/lib/documentGeneration.ts` — Logic moved to `DownloadButton`.
- `src/lib/hybridAI.ts` — Not used; manual workflow only.
- `src/lib/simpleProcessor.ts` — Removed.
- `src/lib/templateAnalysis.ts` — Logic moved into API route.
- `src/components/DocumentPreview.tsx` — Old version.
- `src/components/MetadataForm.tsx` — Not needed.

---

## Future Enhancements / Roadmap

### High Priority

- Batch processing multiple notes.
- Save/load custom templates.
- Enhanced error handling.

### Medium Priority

- PDF export option.
- Custom template builder UI.
- Template library/sharing.

### Low Priority

- Direct GenAI.mil API integration, if/when available.
- User authentication.
- Cloud template storage.

---

## Security and Compliance

- No data storage.
- Everything is client-side.
- No external APIs.
- Manual GenAI.mil workflow.
- USACE-approved approach supported by the privacy banner.
- Government use only; internal tool, not public.

---

## Testing and Validation

### Before Committing

1. Run `npm run build` locally.
2. Check for TypeScript errors.
3. Test in browser at `localhost:3000`.
4. Verify template analysis works.
5. Test Word document generation.

### Deployment Checklist

1. Confirm local build succeeds.
2. Commit with a clear message.
3. Push to GitHub.
4. Monitor Vercel deployment.
5. Test the live URL.

---

## Known Quirks

1. **Vercel build cache:** Sometimes needs a manual redeploy with cache cleared.
2. **Notepad line endings:** Use UTF-8 encoding for files.
3. **Git status on Windows:** May show line-ending changes.
4. **VS Code GitLens:** Sometimes shows path errors; usually harmless.
5. **Mammoth TypeScript types:** Type definitions are limited; use carefully.

---

## Critical Code Snippets

### Type Definitions

File: `src/types/documents.ts`

Key interfaces used throughout the application:

```typescript
export interface TemplateStructure {
  title?: string;
  documentType: string;
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

export interface ProcessedResult {
  formattedDocument: string;
  metadata: {
    templateUsed: string;
    notesSource: string;
    generatedAt: string;
  };
}
```

### Highlight System Pattern

File: `DownloadButton.tsx`

Core logic for highlighting bracketed text in Word documents:

```typescript
const createTextRunsWithHighlights = (text: string) => {
  if (!text.includes('[') || !text.includes(']')) {
    return [{ text }];
  }

  const parts = text.split(/(\[[^\]]+\])/g);
  const runs: any[] = [];

  for (const part of parts) {
    if (part.match(/^\[.*\]$/)) {
      // Bracketed text - highlight it
      runs.push({
        text: part,
        bold: true,
        color: '8B4513',
        highlight: 'yellow',
      });
    } else if (part) {
      runs.push({ text: part });
    }
  }

  return runs;
};
```

### Mammoth API Pattern

File: `analyze-template/route.ts`

Correct way to use `mammoth` for Word document parsing:

```typescript
const buffer = fs.readFileSync(fullPath);

// Extract raw text
const textResult = await mammoth.extractRawText({ buffer });
const rawText = textResult.value;

// Extract HTML: one object parameter, no styleMap
const htmlResult = await mammoth.convertToHtml({ buffer });
const html = htmlResult.value;
```

### Document Generation Pattern

File: `DownloadButton.tsx`

Creating Word documents with the `docx` library:

```typescript
const { Document, Paragraph, TextRun, HeadingLevel, Packer } = docx;

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: paragraphs,
    },
  ],
});

const blob = await Packer.toBlob(doc);
fileSaver.saveAs(blob, filename);
```

---

## Getting Help

### Documentation

- Next.js: <https://nextjs.org/docs>
- Blueprint.js: <https://blueprintjs.com/docs>
- Tailwind CSS: <https://tailwindcss.com/docs>
- mammoth: <https://github.com/mwilliamson/mammoth.js>
- docx: <https://docx.js.org>

### Repository and Deployment

- GitHub: <https://github.com/knudsonb2/meeting-notes-formatter>
- Deployed app: <https://meeting-notes-formatter.vercel.app>

---

## Quick Start for AI Assistants

When resuming work on this project:

1. Read this file first to understand architecture and decisions.
2. Check `package.json` to verify dependencies.
3. Review `src/app/page.tsx` for the main UI structure.
4. Check recent commits:

```powershell
git log --oneline -10
```

5. Ask about user goals: what feature or fix is needed?
6. Load specific files as needed using `Get-Content`.
7. Always generate complete files.
8. Test before committing:

```powershell
npm run build
```

---

## Document Metadata

- **Last Updated:** May 20, 2026
- **Project Version:** 0.1.0
- **Maintainer:** U.S. Army Corps of Engineers
