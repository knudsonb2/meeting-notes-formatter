'use client';

import { Card, Callout, Icon } from '@blueprintjs/core';
import type {
  TemplateMetadata,
  MeetingNotesData,
  ProcessedResult,
} from '@/types/documents';

interface PreviewPanelProps {
  template: TemplateMetadata | null;
  notes: MeetingNotesData | null;
  result: ProcessedResult | null;
}

export default function PreviewPanel({
  template,
  notes,
  result,
}: PreviewPanelProps) {
  if (!result) {
    return (
      <div className='card-section' style={{ minHeight: '400px' }}>
        <h3 className='card-title'>
          <Icon icon='eye-open' />
          Preview
        </h3>

        <Callout intent='none' icon='info-sign'>
          Your formatted document will appear here after processing with Gemini.
        </Callout>

        <div
          style={{
            marginTop: '2rem',
            padding: '3rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6',
            textAlign: 'center',
            color: '#868e96',
          }}
        >
          <Icon
            icon='document'
            size={60}
            color='#dee2e6'
            style={{ marginBottom: '1rem' }}
          />
          <p>Waiting for document generation...</p>
          {template && (
            <p style={{ fontSize: '0.9rem' }}>
              Template: {template.displayName}
            </p>
          )}
          {notes && (
            <p style={{ fontSize: '0.9rem' }}>Notes: {notes.fileName}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='card-section'>
      <h3 className='card-title'>
        <Icon icon='eye-open' />
        Preview
      </h3>

      <Callout
        intent='success'
        icon='tick-circle'
        style={{ marginBottom: '1.5rem' }}
      >
        <strong>Document Generated Successfully!</strong>
        <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
          Your formatted document is ready for review and download.
        </p>
      </Callout>

      <div
        style={{
          marginBottom: '0.5rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#495057',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        DOCUMENT PREVIEW
      </div>

      <div
        style={{
          background: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '2rem',
          maxHeight: '600px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
      >
        {result.formattedDocument}
      </div>

      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: '#868e96',
        }}
      >
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>Template:</strong> {result.metadata.templateUsed}
        </div>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>Source:</strong> {result.metadata.notesSource}
        </div>
        <div>
          <strong>Generated:</strong>{' '}
          {new Date(result.metadata.generatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
