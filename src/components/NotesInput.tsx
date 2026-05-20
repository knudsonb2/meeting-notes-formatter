import React, { useState } from 'react';

interface NotesInputProps {
  onNotesTextChange: (text: string) => void;
  onNotesFileChange: (file: File | null) => void;
}

export default function NotesInput({
  onNotesTextChange,
  onNotesFileChange,
}: NotesInputProps) {
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');

  return (
    <div className='form-group'>
      <label>Meeting Notes*</label>

      <div style={{ marginBottom: '10px' }}>
        <button
          type='button'
          onClick={() => setInputMode('text')}
          className={inputMode === 'text' ? 'tab-button active' : 'tab-button'}
        >
          Paste Text
        </button>
        <button
          type='button'
          onClick={() => setInputMode('file')}
          className={inputMode === 'file' ? 'tab-button active' : 'tab-button'}
        >
          Upload File
        </button>
      </div>

      {inputMode === 'text' ? (
        <textarea
          placeholder='Paste your rough meeting notes here...&#10;Example: • Discussed Q2 budget - need to cut 15% • Jim to review vendor contracts by Friday • Risk: timeline might slip if procurement delayed • Decision: move forward with option B'
          className='form-control'
          rows={10}
          onChange={(e) => onNotesTextChange(e.target.value)}
        />
      ) : (
        <input
          type='file'
          accept='.txt,.docx,.pdf'
          className='form-control'
          onChange={(e) => onNotesFileChange(e.target.files?.[0] || null)}
        />
      )}

      <p className='help-text'>
        Paste your rough meeting notes, bullets, or transcript excerpts.
      </p>
    </div>
  );
}
