'use client';

import { useState } from 'react';
import { Callout, Icon } from '@blueprintjs/core';
import TemplateAnalyzer from '@/components/TemplateAnalyzer';
import MeetingNotesInput from '@/components/MeetingNotesInput';
import PreviewPanel from '@/components/PreviewPanel';
import GenerateButton from '@/components/GenerateButton';
import DownloadButton from '@/components/DownloadButton';
import type {
  TemplateMetadata,
  MeetingNotesData,
  ProcessedResult,
} from '@/types/documents';

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateMetadata | null>(null);
  const [meetingNotes, setMeetingNotes] = useState<MeetingNotesData | null>(
    null,
  );
  const [processedResult, setProcessedResult] =
    useState<ProcessedResult | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const handleTemplateSelect = (template: TemplateMetadata) => {
    setSelectedTemplate(template);
    setCurrentStep(2);
  };

  const handleNotesSubmit = (notes: MeetingNotesData) => {
    setMeetingNotes(notes);
    setCurrentStep(3);
  };

  const handleGenerate = (result: ProcessedResult) => {
    setProcessedResult(result);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Security Notice Banner */}
        <Callout
          intent='success'
          icon={<Icon icon='shield' size={20} />}
          style={{
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '1.05rem', color: '#166534' }}>
                🔒 Privacy & Security Notice
              </strong>
              <p
                style={{
                  margin: '0.25rem 0 0 0',
                  color: '#15803d',
                  fontSize: '0.95rem',
                }}
              >
                <strong>No data is saved, stored, or shared.</strong> All
                processing occurs locally in your browser. Your meeting notes
                and documents remain private and are never transmitted to
                external servers.
              </p>
            </div>
          </div>
        </Callout>

        <header className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-800 mb-2'>
            Meeting Notes Template Formatter
          </h1>
          <p className='text-gray-600'>
            Hybrid AI Tool - Uses Gemini Enterprise (No API costs!)
          </p>
        </header>

        {/* Progress Steps */}
        <div className='flex justify-center items-center mb-8 space-x-4'>
          <StepIndicator
            number={1}
            label='Upload Files'
            active={currentStep === 1}
            completed={currentStep > 1}
          />
          <div className='w-12 h-0.5 bg-gray-300'></div>
          <StepIndicator
            number={2}
            label='Use Gemini'
            active={currentStep === 2}
            completed={currentStep > 2}
          />
          <div className='w-12 h-0.5 bg-gray-300'></div>
          <StepIndicator
            number={3}
            label='Download'
            active={currentStep === 3}
            completed={false}
          />
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='space-y-6'>
            <TemplateAnalyzer onTemplateSelect={handleTemplateSelect} />

            {currentStep >= 2 && (
              <MeetingNotesInput onNotesSubmit={handleNotesSubmit} />
            )}

            {currentStep >= 3 && selectedTemplate && meetingNotes && (
              <GenerateButton
                template={selectedTemplate}
                notes={meetingNotes}
                onGenerate={handleGenerate}
              />
            )}

            {processedResult && <DownloadButton result={processedResult} />}
          </div>

          <div className='sticky top-6 self-start'>
            <PreviewPanel
              template={selectedTemplate}
              notes={meetingNotes}
              result={processedResult}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className='flex flex-col items-center'>
      <div
        className={`
        w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg
        ${completed ? 'bg-green-500 text-white' : ''}
        ${active ? 'bg-indigo-600 text-white ring-4 ring-indigo-200' : ''}
        ${!active && !completed ? 'bg-gray-300 text-gray-600' : ''}
      `}
      >
        {completed ? '✓' : number}
      </div>
      <span
        className={`mt-2 text-sm font-medium ${active ? 'text-indigo-600' : 'text-gray-500'}`}
      >
        {label}
      </span>
    </div>
  );
}
