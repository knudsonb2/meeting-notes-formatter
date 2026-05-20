import React, { useState } from 'react';
import { MeetingMetadata } from '@/types/documents';

interface MetadataFormProps {
  onMetadataChange: (metadata: MeetingMetadata) => void;
}

export default function MetadataForm({ onMetadataChange }: MetadataFormProps) {
  const [metadata, setMetadata] = useState<MeetingMetadata>({});

  const handleChange = (
    field: keyof MeetingMetadata,
    value: string | string[],
  ) => {
    const updated = { ...metadata, [field]: value };
    setMetadata(updated);
    onMetadataChange(updated);
  };

  const handleAttendeesChange = (value: string) => {
    const attendees = value
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    handleChange('attendees', attendees);
  };

  return (
    <div>
      <p style={{ marginBottom: '15px', color: '#7f8c8d', fontSize: '0.9rem' }}>
        Provide meeting details to include in the generated document.
      </p>

      <div className='form-group'>
        <label>Meeting Title</label>
        <input
          type='text'
          placeholder='e.g., Weekly Project Status Meeting'
          className='form-control'
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </div>

      <div className='form-group'>
        <label>Date</label>
        <input
          type='date'
          className='form-control'
          onChange={(e) => handleChange('date', e.target.value)}
        />
      </div>

      <div className='form-group'>
        <label>Project/Program</label>
        <input
          type='text'
          placeholder='e.g., Phoenix Modernization'
          className='form-control'
          onChange={(e) => handleChange('project', e.target.value)}
        />
      </div>

      <div className='form-group'>
        <label>Prepared By</label>
        <input
          type='text'
          placeholder='Your name'
          className='form-control'
          onChange={(e) => handleChange('author', e.target.value)}
        />
      </div>

      <div className='form-group'>
        <label>Organization</label>
        <input
          type='text'
          placeholder='e.g., Engineering Department'
          className='form-control'
          onChange={(e) => handleChange('organization', e.target.value)}
        />
      </div>

      <div className='form-group'>
        <label>Attendees</label>
        <textarea
          placeholder='Enter names separated by commas, semicolons, or new lines'
          className='form-control'
          rows={3}
          onChange={(e) => handleAttendeesChange(e.target.value)}
        />
      </div>
    </div>
  );
}
