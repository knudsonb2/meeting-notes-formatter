'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Callout, Intent, H2, Spinner } from '@blueprintjs/core';
import { RewrittenContent } from '@/types/documents';
import { generateDocx, generatePreviewHtml } from '@/lib/documentGeneration';

interface DocumentPreviewProps {
  onCreateAnother: () => void;
}

export default function DocumentPreview({
  onCreateAnother,
}: DocumentPreviewProps) {
  const [content, setContent] = useState<RewrittenContent | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Load the rewritten content from localStorage
    const stored = localStorage.getItem('rewrittenContent');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setContent(parsed);
        const html = generatePreviewHtml(parsed);
        setPreviewHtml(html);
      } catch (err) {
        console.error('Error parsing stored content:', err);
      }
    }
  }, []);

  const handleDownload = async () => {
    if (!content) return;

    setDownloading(true);
    try {
      const blob = await generateDocx(content);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.title || 'meeting-notes'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating document:', err);
      alert('Error generating document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!content) {
    return (
      <Card style={{ padding: '30px', textAlign: 'center' }}>
        <Spinner size={50} />
        <p style={{ marginTop: '20px' }}>Loading preview...</p>
      </Card>
    );
  }

  return (
    <Card style={{ padding: '30px', marginBottom: '20px' }}>
      <H2>3. Download Document</H2>

      <Callout intent={Intent.SUCCESS} style={{ marginBottom: '20px' }}>
        <strong>Document Ready!</strong> Preview your document below and
        download when ready.
      </Callout>

      {/* Preview */}
      <div
        style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '5px',
          padding: '20px',
          marginBottom: '20px',
          maxHeight: '600px',
          overflow: 'auto',
        }}
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button
          intent={Intent.SUCCESS}
          large
          icon='download'
          onClick={handleDownload}
          disabled={downloading}
          style={{ flex: 1 }}
        >
          {downloading ? (
            <>
              <Spinner size={20} style={{ marginRight: '10px' }} />
              Generating...
            </>
          ) : (
            'Download Word Document'
          )}
        </Button>
        <Button intent={Intent.PRIMARY} large onClick={onCreateAnother}>
          Create Another Document
        </Button>
      </div>

      <Callout intent={Intent.PRIMARY} style={{ marginTop: '20px' }}>
        <strong>Next Steps:</strong>
        <ol style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
          <li>Download the Word document</li>
          <li>Open it in Microsoft Word</li>
          <li>
            Use Ctrl+F (Find) to search for "[" to locate all items needing
            review
          </li>
          <li>Replace highlighted placeholders with actual information</li>
          <li>Remove the highlighting after making changes</li>
        </ol>
      </Callout>
    </Card>
  );
}
