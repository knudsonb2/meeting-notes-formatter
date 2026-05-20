'use client';

import { useState } from 'react';
import { Button, Icon } from '@blueprintjs/core';
import type { ProcessedResult } from '@/types/documents';

interface DownloadButtonProps {
  result: ProcessedResult;
}

export default function DownloadButton({ result }: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper function to split text and highlight brackets
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

  const handleDownloadWord = async () => {
    setIsGenerating(true);
    try {
      console.log('Starting Word document generation...');

      const docx = await import('docx');
      console.log('docx imported successfully');

      const fileSaverModule = await import('file-saver');
      const saveAs =
        fileSaverModule.default || fileSaverModule.saveAs || fileSaverModule;
      console.log('file-saver imported successfully', typeof saveAs);

      const {
        Document,
        Paragraph,
        TextRun,
        HeadingLevel,
        AlignmentType,
        Packer,
        BorderStyle,
      } = docx;

      console.log('Creating document structure...');

      const lines = result.formattedDocument.split('\n');
      const paragraphs: any[] = [];
      let i = 0;

      while (i < lines.length) {
        const line = lines[i];
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          paragraphs.push(new Paragraph({ text: '' }));
          i++;
          continue;
        }

        // Check if next line is === (major section header)
        if (i + 1 < lines.length && lines[i + 1].trim().match(/^=+$/)) {
          const runs = createTextRunsWithHighlights(trimmedLine);
          paragraphs.push(
            new Paragraph({
              children: runs.map((r) => new TextRun(r)),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 200 },
              thematicBreak: true,
              style: 'Heading1',
            }),
          );
          i += 2;
          continue;
        }

        // Check if next line is --- (minor section header)
        if (i + 1 < lines.length && lines[i + 1].trim().match(/^-+$/)) {
          const runs = createTextRunsWithHighlights(trimmedLine);
          paragraphs.push(
            new Paragraph({
              children: runs.map((r) => new TextRun(r)),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 240, after: 120 },
              style: 'Heading2',
            }),
          );
          i += 2;
          continue;
        }

        // Skip lines that are just === or ---
        if (trimmedLine.match(/^[=\-]+$/)) {
          i++;
          continue;
        }

        // Key-value pairs (Date:, Owner:, etc.) - with inline highlighting
        if (trimmedLine.match(/^[A-Za-z\s]+:/)) {
          const colonIndex = trimmedLine.indexOf(':');
          const key = trimmedLine.substring(0, colonIndex);
          const value = trimmedLine.substring(colonIndex + 1).trim();

          const children = [
            new TextRun({ text: key + ': ', bold: true }),
            ...createTextRunsWithHighlights(value).map((r) => new TextRun(r)),
          ];

          paragraphs.push(
            new Paragraph({
              children,
              spacing: { before: 80, after: 80 },
            }),
          );
          i++;
          continue;
        }

        // Numbered items (1. 2. 3.) - with inline highlighting
        const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          const runs = createTextRunsWithHighlights(numberedMatch[2]);
          paragraphs.push(
            new Paragraph({
              children: runs.map((r) => new TextRun(r)),
              numbering: { reference: 'default-numbering', level: 0 },
              spacing: { before: 100, after: 100 },
            }),
          );

          // Check for sub-items (indented lines)
          i++;
          while (
            i < lines.length &&
            lines[i].startsWith('   ') &&
            lines[i].trim()
          ) {
            const subLine = lines[i].trim();
            if (subLine.includes(':')) {
              const subColonIndex = subLine.indexOf(':');
              const subKey = subLine.substring(0, subColonIndex);
              const subValue = subLine.substring(subColonIndex + 1).trim();

              const subChildren = [
                new TextRun({ text: '    ' + subKey + ': ', bold: true }),
                ...createTextRunsWithHighlights(subValue).map(
                  (r) => new TextRun(r),
                ),
              ];

              paragraphs.push(
                new Paragraph({
                  children: subChildren,
                  spacing: { before: 40, after: 40 },
                  indent: { left: 720 },
                }),
              );
            } else {
              const subRuns = createTextRunsWithHighlights('    ' + subLine);
              paragraphs.push(
                new Paragraph({
                  children: subRuns.map((r) => new TextRun(r)),
                  spacing: { before: 40, after: 40 },
                  indent: { left: 720 },
                }),
              );
            }
            i++;
          }
          continue;
        }

        // Bullet points (- or * or •) - with inline highlighting
        if (trimmedLine.match(/^[\-\*•]\s+/)) {
          const bulletText = trimmedLine.replace(/^[\-\*•]\s+/, '');
          const runs = createTextRunsWithHighlights(bulletText);
          paragraphs.push(
            new Paragraph({
              children: runs.map((r) => new TextRun(r)),
              bullet: { level: 0 },
              spacing: { before: 80, after: 80 },
            }),
          );
          i++;
          continue;
        }

        // All other text - always check for inline brackets
        const runs = createTextRunsWithHighlights(line);
        paragraphs.push(
          new Paragraph({
            children: runs.map((r) => new TextRun(r)),
            spacing: { before: 120, after: 120 },
          }),
        );
        i++;
      }

      console.log(`Created ${paragraphs.length} paragraphs`);
      console.log('Building Word document...');

      // Create the Word document with proper styling
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440,
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children: paragraphs,
          },
        ],
        numbering: {
          config: [
            {
              reference: 'default-numbering',
              levels: [
                {
                  level: 0,
                  format: 'decimal',
                  text: '%1.',
                  alignment: AlignmentType.LEFT,
                  style: {
                    paragraph: {
                      indent: { left: 720, hanging: 360 },
                    },
                  },
                },
              ],
            },
          ],
        },
        styles: {
          paragraphStyles: [
            {
              id: 'Heading1',
              name: 'Heading 1',
              basedOn: 'Normal',
              next: 'Normal',
              run: {
                size: 32,
                bold: true,
                allCaps: true,
                color: '000000',
              },
              paragraph: {
                spacing: { before: 300, after: 200 },
                thematicBreak: true,
              },
            },
            {
              id: 'Heading2',
              name: 'Heading 2',
              basedOn: 'Normal',
              next: 'Normal',
              run: {
                size: 28,
                bold: true,
                color: '000000',
              },
              paragraph: {
                spacing: { before: 240, after: 120 },
                border: {
                  bottom: {
                    color: '000000',
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
              },
            },
          ],
        },
      });

      console.log('Converting to blob...');
      const blob = await Packer.toBlob(doc);
      console.log('Blob created, size:', blob.size);

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
      const templateName = result.metadata.templateUsed.replace(
        /\.(docx|doc)$/,
        '',
      );
      const filename = `${templateName}_Formatted_${timestamp}.docx`;

      console.log('Saving file:', filename);

      if (typeof saveAs === 'function') {
        saveAs(blob, filename);
      } else if (typeof saveAs.saveAs === 'function') {
        saveAs.saveAs(blob, filename);
      } else {
        throw new Error('saveAs function not found in file-saver module');
      }

      alert('Word document generated successfully!');
    } catch (error) {
      console.error('Error generating Word document:', error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      alert(
        `Failed to generate Word document.\n\nError: ${errorMessage}\n\nPlease try "Download as Text" instead.`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadText = () => {
    try {
      const blob = new Blob([result.formattedDocument], {
        type: 'text/plain;charset=utf-8',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
      const templateName = result.metadata.templateUsed.replace(
        /\.(docx|doc)$/,
        '',
      );
      link.download = `${templateName}_Formatted_${timestamp}.txt`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading text document:', error);
      alert('Failed to download document.');
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(result.formattedDocument)
      .then(() => {
        alert('Document copied to clipboard!');
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        alert('Failed to copy to clipboard.');
      });
  };

  return (
    <div
      className='card-section success-box'
      style={{ border: '3px solid #51cf66' }}
    >
      <div style={{ textAlign: 'center' }}>
        <Icon
          icon='tick-circle'
          size={60}
          color='#51cf66'
          style={{ marginBottom: '1rem' }}
        />

        <h3
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#2c3e50',
            marginBottom: '0.5rem',
          }}
        >
          Professional Document Ready!
        </h3>

        <p
          style={{
            color: '#868e96',
            marginBottom: '1.5rem',
            fontSize: '1rem',
          }}
        >
          Your expertly formatted document has been generated with proper USACE
          styling.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Button
            onClick={handleDownloadWord}
            large
            fill
            intent='success'
            icon={<Icon icon='download' size={20} />}
            loading={isGenerating}
            style={{
              height: '60px',
              fontSize: '1.2rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(81, 207, 102, 0.3)',
              transition: 'all 0.3s ease',
            }}
            className='download-button-hover'
          >
            {isGenerating
              ? 'Generating Word Document...'
              : 'Download as Word Document (.docx)'}
          </Button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              onClick={handleDownloadText}
              large
              fill
              intent='primary'
              icon={<Icon icon='document' size={18} />}
              style={{
                height: '50px',
                fontSize: '0.95rem',
                fontWeight: 600,
                flex: 1,
              }}
            >
              Download as Text
            </Button>

            <Button
              onClick={handleCopyToClipboard}
              large
              fill
              intent='primary'
              icon={<Icon icon='duplicate' size={18} />}
              style={{
                height: '50px',
                fontSize: '0.95rem',
                fontWeight: 600,
                flex: 1,
              }}
            >
              Copy to Clipboard
            </Button>
          </div>
        </div>

        <style jsx global>{`
          .download-button-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(81, 207, 102, 0.4) !important;
          }
          .download-button-hover:active {
            transform: translateY(0);
          }
        `}</style>

        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#868e96',
            textAlign: 'left',
          }}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Template:</strong> {result.metadata.templateUsed}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Source:</strong> {result.metadata.notesSource}
          </div>
          <div>
            <strong>Generated:</strong>{' '}
            {new Date(result.metadata.generatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
