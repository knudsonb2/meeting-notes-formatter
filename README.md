# Meeting Notes Formatter

A Next.js web application that helps U.S. Army Corps of Engineers (USACE) personnel transform messy meeting notes into professionally formatted documents using Gemini Enterprise AI (via GenAI.mil).

Live Demo: https://meeting-notes-formatter.vercel.app

## Overview

This tool analyzes Word document templates, extracts their structure (sections, tables, placeholders), and generates detailed formatting prompts for Gemini AI. Users copy the prompt to GenAI.mil, paste the AI-formatted response back into the app, and download a professional Word document ready for review.

## Key Features

- Template Analysis - Automatically extracts sections, headings, tables, and formatting from .docx templates
- Hybrid AI Workflow - Uses Gemini Enterprise via manual copy-paste (no API costs, no data retention)
- Smart Formatting - Generates Word documents with proper USACE styling, headings, and structure
- Highlight System - Brackets like [TBD], [Owner TBD] are automatically highlighted in yellow
- Multiple Export Options - Download as .docx, .txt, or copy to clipboard
- Privacy First - Green banner confirms no data is saved, stored, or shared
- Responsive UI - Built with Blueprint.js components

## Tech Stack

- Framework: Next.js 14.2.3 (App Router)
- Language: TypeScript
- UI Library: Blueprint.js (@blueprintjs/core, @blueprintjs/icons)
- Styling: Tailwind CSS v3
- Document Processing: mammoth, docx, file-saver
- Deployment: Vercel
- Version Control: Git & GitHub

## Installation and Local Development

### Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher
- Git

### Setup Instructions

1. Clone the repository:

git clone https://github.com/knudsonb2/meeting-notes-formatter.git
cd meeting-notes-formatter

2. Install dependencies:

npm install

3. Run the development server:

npm run dev

4. Open your browser to:

http://localhost:3000

### Build Commands

Production build:

npm run build
npm start

Linting:

npm run lint

## How to Use

### Step 1: Upload Template

1. Click "Upload Template" or select from pre-loaded templates
2. App analyzes document structure (sections, tables, placeholders)
3. Preview shows detected structure

### Step 2: Use Gemini

1. Paste your raw meeting notes into the text area
2. Click Generate Gemini Prompt
3. Copy the generated prompt
4. Go to GenAI.mil (Gemini Enterprise)
5. Paste the prompt and get AI-formatted response
6. Copy Gemini's response
7. Paste it into "Paste Gemini's Response" area
8. Click Process Response

### Step 3: Download Document

1. Preview the formatted document in the preview panel
2. Click Download as Word Document (.docx)
3. Open in Microsoft Word
4. Use Ctrl+F to find [ to locate items needing review
5. Replace highlighted placeholders with actual information
6. Remove highlighting after making changes

## Project Structure

meeting-notes-formatter/
├── public/
│ └── templates/  
│ └── MFR Template.docx  
├── src/
│ ├── app/
│ │ ├── api/
│ │ │ └── analyze-template/
│ │ │ └── route.ts  
│ │ ├── page.tsx  
│ │ ├── layout.tsx  
│ │ └── globals.css  
│ ├── components/
│ │ ├── TemplateAnalyzer.tsx
│ │ ├── MeetingNotesInput.tsx
│ │ ├── PreviewPanel.tsx
│ │ ├── GenerateButton.tsx
│ │ └── DownloadButton.tsx
│ └── types/
│ └── documents.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── README.md

## Adding Custom Templates

1. Place your .docx file in the public/templates/ folder
2. Templates are auto-detected on page load
3. Use clear section headings (UPPERCASE or numbered) for best results
4. Include structured sections like SUBJECT, DATE, ATTENDEES, DISCUSSION, ACTION ITEMS, DECISIONS

## Privacy and Security

- No backend storage - All processing happens client-side in your browser
- No API keys required - Uses manual GenAI.mil workflow
- No data retention - Files never leave your browser
- Green privacy banner - Visible security notice confirming data safety
- USACE-approved workflow - Compliant with security requirements

## Deployment to Vercel

### Automatic Deployment

1. Push your code to GitHub:

git add .
git commit -m "Your commit message"
git push

2. Connect repository to Vercel:
   - Go to vercel.com
   - Import your GitHub repository
   - Vercel auto-deploys on every push to main branch

3. No configuration needed:
   - Build command: npm run build
   - Output directory: .next
   - No environment variables required

## Troubleshooting

### Build Cache Issues

If you encounter build errors, delete the Next.js cache and rebuild:

Windows PowerShell:

Remove-Item -Recurse -Force .next
npm run build

Mac/Linux:

rm -rf .next
npm run build

### TypeScript Errors

Make sure all dependencies are installed:

npm install

### Template Not Analyzing

- Ensure the template has clear section headings
- Headers should be UPPERCASE or numbered (1., 2., etc.)
- Avoid complex nested formatting

### Word Document Download Issues

If the Word document won't download:

1. Try the "Download as Text" option instead
2. Check browser console for errors
3. Ensure docx and file-saver packages are installed

## Future Enhancements

- Batch processing for multiple meeting notes
- Custom template builder UI
- Direct GenAI.mil API integration (when available)
- PDF export option
- Template sharing library
- User authentication and saved templates
- Mobile-responsive design improvements

## License

Internal USACE tool - Not for public distribution

Developed for official U.S. Government use only.

## Support

Technical Issues:

- Open an issue on GitHub
- Include error messages and screenshots
- Describe steps to reproduce

Feature Requests:

- Submit via GitHub Issues
- Explain use case and benefits

---

Version: 0.1.0
Last Updated: May 20, 2026
