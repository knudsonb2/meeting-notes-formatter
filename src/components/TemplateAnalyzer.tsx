'use client';

import { useState, useEffect } from 'react';
import { Button, Callout, Spinner, Icon } from '@blueprintjs/core';
import type { TemplateMetadata, TemplateStructure } from '@/types/documents';

interface TemplateAnalyzerProps {
  onTemplateSelect: (template: TemplateMetadata) => void;
}

export default function TemplateAnalyzer({
  onTemplateSelect,
}: TemplateAnalyzerProps) {
  const [templates, setTemplates] = useState<TemplateMetadata[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeTemplate = async (template: TemplateMetadata) => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templatePath: template.path }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze template');
      }

      const data = await response.json();
      const structure: TemplateStructure = data.structure;

      const templateWithStructure: TemplateMetadata = {
        ...template,
        structure,
      };

      setSelectedTemplate(templateWithStructure);
      onTemplateSelect(templateWithStructure);
    } catch (error) {
      console.error('Error analyzing template:', error);
      alert(
        'Failed to analyze template structure. The template may be corrupted or in an unsupported format.',
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTemplateClick = (template: TemplateMetadata) => {
    analyzeTemplate(template);
  };

  return (
    <div className='card-section'>
      <h3 className='card-title'>
        <Icon icon='document' />
        Step 1: Select Template
      </h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Spinner size={50} />
          <p style={{ marginTop: '1rem', color: '#868e96' }}>
            Loading templates...
          </p>
        </div>
      ) : templates.length === 0 ? (
        <Callout intent='warning' icon='warning-sign'>
          <strong>No templates found.</strong>
          <p style={{ marginTop: '0.5rem' }}>
            Place .docx files in the <code>public/templates</code> folder to see
            them here.
          </p>
        </Callout>
      ) : (
        <>
          <Callout
            intent='primary'
            icon='info-sign'
            style={{ marginBottom: '1rem' }}
          >
            Select a template to analyze its structure. The tool will extract
            sections, headings, and placeholders to format your meeting notes
            accordingly.
          </Callout>

          {analyzing && (
            <Callout
              intent='none'
              style={{ marginBottom: '1rem', background: '#f8f9ff' }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <Spinner size={20} />
                <span>Analyzing template structure...</span>
              </div>
            </Callout>
          )}

          <div className='template-list'>
            {templates.map((template) => (
              <div
                key={template.name}
                className={`template-item ${selectedTemplate?.name === template.name ? 'selected' : ''}`}
                onClick={() => !analyzing && handleTemplateClick(template)}
                style={{ cursor: analyzing ? 'wait' : 'pointer' }}
              >
                <Icon
                  icon='document'
                  size={24}
                  color={
                    selectedTemplate?.name === template.name
                      ? '#667eea'
                      : '#868e96'
                  }
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {template.displayName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#868e96' }}>
                    {selectedTemplate?.name === template.name
                      ? 'Template analyzed and ready'
                      : 'Click to analyze and select'}
                  </div>
                </div>
                {selectedTemplate?.name === template.name && (
                  <Icon icon='tick-circle' size={24} color='#51cf66' />
                )}
              </div>
            ))}
          </div>

          {selectedTemplate?.structure && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#f0fdf4',
                borderRadius: '8px',
                border: '1px solid #86efac',
              }}
            >
              <h4
                style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.95rem',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Icon icon='tick-circle' size={16} color='#16a34a' />
                Template Structure Detected
              </h4>
              <div style={{ fontSize: '0.85rem', color: '#15803d' }}>
                <div>
                  <strong>Sections found:</strong>{' '}
                  {selectedTemplate.structure.sections.length}
                </div>
                <div>
                  <strong>Placeholders found:</strong>{' '}
                  {selectedTemplate.structure.placeholders.length}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
