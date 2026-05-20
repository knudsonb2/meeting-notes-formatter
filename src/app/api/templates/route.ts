import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'public', 'templates');

    console.log('Looking for templates in:', templatesDir);

    // Create directory if it doesn't exist
    if (!fs.existsSync(templatesDir)) {
      console.log('Templates directory does not exist!');
      fs.mkdirSync(templatesDir, { recursive: true });
      return NextResponse.json({ templates: [] });
    }

    const files = fs.readdirSync(templatesDir);
    console.log('All files found:', files);

    const templates = files
      .filter((file) => {
        const matches = file.endsWith('.docx') || file.endsWith('.doc');
        console.log(`File: ${file}, Matches: ${matches}`);
        return matches;
      })
      .map((file) => ({
        name: file,
        displayName: file.replace(/\.(docx|doc)$/, ''),
        path: `/templates/${file}`,
      }));

    console.log('Templates found:', templates);

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error reading templates:', error);
    return NextResponse.json({ templates: [], error: String(error) });
  }
}
