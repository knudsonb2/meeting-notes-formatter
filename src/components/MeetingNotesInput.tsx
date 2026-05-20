'use client';

import { useState } from 'react';
import {
  Button,
  TextArea,
  FileInput,
  Card,
  Tabs,
  Tab,
  Callout,
} from '@blueprintjs/core';
import type { MeetingNotesData } from '@/types/documents';

interface MeetingNotesInputProps {
  onNotesSubmit: (data: MeetingNotesData) => void;
}

export default function MeetingNotesInput({
  onNotesSubmit,
}: MeetingNotesInputProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [pastedNotes, setPastedNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePasteSubmit = () => {
    if (!pastedNotes.trim()) {
      alert('Please paste your meeting notes first');
      return;
    }

    onNotesSubmit({
      rawText: pastedNotes,
      fileName: 'Pasted Notes',
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const text = await file.text();
      onNotesSubmit({
        rawText: text,
        fileName: file.name,
      });
    } catch (error) {
      console.error('Error reading file:', error);
      alert(
        'Failed to read file. Please try a .txt file or paste the content instead.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className='p-4'>
      <h3 className='text-lg font-semibold mb-4'>
        2. Enter Your Meeting Notes
      </h3>

      <Tabs
        id='input-tabs'
        selectedTabId={activeTab}
        onChange={(tabId) => setActiveTab(tabId as 'paste' | 'upload')}
        className='mb-4'
      >
        <Tab id='paste' title='Paste Text' />
        <Tab id='upload' title='Upload File' />
      </Tabs>

      {activeTab === 'paste' ? (
        <div>
          <Callout intent='primary' className='mb-3'>
            Copy your meeting notes from any source and paste them here.
          </Callout>
          <TextArea
            value={pastedNotes}
            onChange={(e) => setPastedNotes(e.target.value)}
            placeholder='Paste your meeting notes here...&#10;&#10;Example:&#10;Meeting with John about Q4 planning&#10;- Discussed budget allocation&#10;- Reviewed timeline&#10;...'
            fill
            growVertically
            rows={12}
            className='mb-3'
            style={{ fontFamily: 'monospace', fontSize: '13px' }}
          />
          <Button
            intent='primary'
            icon='arrow-right'
            text='Continue with These Notes'
            onClick={handlePasteSubmit}
            disabled={!pastedNotes.trim()}
            large
          />
        </div>
      ) : (
        <div>
          <Callout intent='primary' className='mb-3'>
            Upload a .txt, .docx, or other text file containing your meeting
            notes.
          </Callout>
          <FileInput
            text={uploadedFile?.name || 'Choose file...'}
            onInputChange={handleFileUpload}
            fill
            disabled={isProcessing}
            className='mb-3'
            inputProps={{
              accept: '.txt,.docx,.doc,text/*',
            }}
          />
          {isProcessing && (
            <Callout intent='warning' className='mt-3'>
              Processing file...
            </Callout>
          )}
        </div>
      )}
    </Card>
  );
}
