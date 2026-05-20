# Meeting Notes Formatter

A Next.js web application that helps U.S. Army Corps of Engineers (USACE) personnel convert rough meeting notes into professionally formatted Word documents using Gemini Enterprise AI through GenAI.mil.

**Live Demo:** https://meeting-notes-formatter.vercel.app

---

## Overview

Meeting Notes Formatter analyzes Word document templates, extracts their structure, and generates a detailed formatting prompt for Gemini Enterprise. Users copy the generated prompt into GenAI.mil, paste Gemini’s formatted response back into the app, and export a polished Word document ready for review.

The workflow is intentionally manual and privacy-focused. It does not require an AI API key, does not store user data, and keeps document processing within the user’s browser.

---

## Key Features

- **Template analysis** — Extracts sections, headings, tables, placeholders, and formatting from `.docx` templates.
- **Hybrid AI workflow** — Uses Gemini Enterprise through manual copy/paste with GenAI.mil.
- **Smart formatting** — Generates Word documents with structured headings, USACE-style formatting, and clear organization.
- **Placeholder highlighting** — Automatically highlights bracketed placeholders such as `[TBD]`, `[Owner TBD]`, or `[Date TBD]`.
- **Multiple export options** — Supports `.docx`, `.txt`, and clipboard copy.
- **Privacy-first design** — Includes a visible privacy banner confirming that data is not saved, stored, or shared.
- **Responsive interface** — Built with Blueprint.js components and Tailwind CSS.

---

## Tech Stack

| Category            | Technology                 |
| ------------------- | -------------------------- |
| Framework           | Next.js 14.2.3, App Router |
| Language            | TypeScript                 |
| UI Library          | Blueprint.js               |
| Styling             | Tailwind CSS v3            |
| Document Processing | mammoth, docx, file-saver  |
| Deployment          | Vercel                     |
| Version Control     | Git and GitHub             |

---

## Installation and Local Development

### Prerequisites

Make sure the following are installed:

- Node.js 18.x or higher
- npm 8.x or higher
- Git

### Setup

Clone the repository:

```bash
git clone https://github.com/knudsonb2/meeting-notes-formatter.git
cd meeting-notes-formatter
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:3000
```

---

## Build Commands

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

Run linting:

```bash
npm run lint
```

---

## How to Use

### Step 1: Upload a Template

1. Click **Upload Template** or select a preloaded template.
2. The app analyzes the document structure, including sections, tables, headings, and placeholders.
3. Review the detected structure in the preview panel.

### Step 2: Format Notes with Gemini Enterprise

1. Paste raw meeting notes into the meeting notes text area.
2. Click **Generate Gemini Prompt**.
3. Copy the generated prompt.
4. Open GenAI.mil using Gemini Enterprise.
5. Paste the prompt into Gemini.
6. Copy Gemini’s formatted response.
7. Paste the response into the **Paste Gemini's Response** area.
8. Click **Process Response**.

### Step 3: Download the Document

1. Preview the formatted output.
2. Click **Download as Word Document (.docx)**.
3. Open the document in Microsoft Word.
4. Use `Ctrl + F` and search for `[` to find placeholders needing review.
5. Replace highlighted placeholders with actual information.
6. Remove highlighting after final review.

---

## Project Structure

```text
meeting-notes-formatter/
├── public/
│   └── templates/
│       └── MFR Template.docx
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze-template/
│   │   │       └── route.ts
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── TemplateAnalyzer.tsx
│   │   ├── MeetingNotesInput.tsx
│   │   ├── PreviewPanel.tsx
│   │   ├── GenerateButton.tsx
│   │   └── DownloadButton.tsx
│   └── types/
│       └── documents.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── README.md
```

---

## Adding Custom Templates

To add a custom Word template:

1. Place the `.docx` file in the `public/templates/` folder.
2. Reload the app.
3. The template should be detected automatically.
4. Use clear section headings for best results.

Recommended template sections include:

- `SUBJECT`
- `DATE`
- `ATTENDEES`
- `DISCUSSION`
- `DECISIONS`
- `ACTION ITEMS`
- `FOLLOW-UP ITEMS`

For best results, use uppercase headings or numbered headings such as `1. Purpose`, `2. Discussion`, and `3. Action Items`.

---

## Privacy and Security

This app is designed around a no-storage, user-controlled workflow.

- **No backend storage** — The app does not save uploaded templates or meeting notes.
- **No API keys required** — The app uses a manual GenAI.mil workflow instead of direct AI API calls.
- **No data retention** — User content remains in the browser during the session.
- **Visible privacy notice** — A green banner confirms that data is not saved, stored, or shared.
- **USACE-oriented workflow** — Designed to support a controlled official-use workflow.

---

## Deployment to Vercel

### Automatic Deployment

Push changes to GitHub:

```bash
git add .
git commit -m "Update application"
git push
```

Then connect the repository to Vercel:

1. Go to Vercel.
2. Import the GitHub repository.
3. Allow Vercel to auto-detect the Next.js project.
4. Deploy.

### Vercel Settings

No special configuration is required.

| Setting               | Value           |
| --------------------- | --------------- |
| Build Command         | `npm run build` |
| Output Directory      | `.next`         |
| Environment Variables | None required   |

---

## Troubleshooting

### Build Cache Issues

If build errors occur, clear the Next.js cache and rebuild.

Windows PowerShell:

```powershell
Remove-Item -Recurse -Force .next
npm run build
```

macOS or Linux:

```bash
rm -rf .next
npm run build
```

### TypeScript Errors

Make sure all dependencies are installed:

```bash
npm install
```

Then rebuild:

```bash
npm run build
```

### Template Not Analyzing

Check the following:

- The template is a valid `.docx` file.
- The template uses clear section headings.
- Headings are uppercase, numbered, or otherwise visually distinct.
- The document does not rely on overly complex nested formatting.

### Word Document Download Issues

If the Word document does not download:

1. Try **Download as Text**.
2. Check the browser console for errors.
3. Confirm that `docx` and `file-saver` are installed.
4. Reinstall dependencies if needed:

```bash
npm install
```

---

## Future Enhancements

Potential improvements include:

- Batch processing for multiple meeting note files
- Custom template builder interface
- Direct GenAI.mil API integration if available in the future
- PDF export option
- Shared template library
- User authentication and saved templates
- Improved mobile responsiveness
- Expanded placeholder detection and validation
- Action item extraction and tracking

---

## License

Internal USACE tool. Not for public distribution.

Developed for official U.S. Government use only.

---

## Support

### Technical Issues

Open a GitHub issue and include:

- Error messages
- Screenshots
- Browser and operating system information
- Steps to reproduce the issue

### Feature Requests

Submit a GitHub issue and include:

- The requested feature
- The use case
- The expected benefit to users or project teams

---

## Version

**Version:** 0.1.0  
**Last Updated:** May 20, 2026
