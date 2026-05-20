import React from 'react';

interface FileUploadProps {
  label: string;
  accept: string;
  required?: boolean;
  onFileSelect: (file: File | null) => void;
  helpText?: string;
}

export default function FileUpload({
  label,
  accept,
  required,
  onFileSelect,
  helpText,
}: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  return (
    <div className='form-group'>
      <label>
        {label}
        {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <input
        type='file'
        accept={accept}
        onChange={handleFileChange}
        className='form-control'
        required={required}
      />
      {helpText && <p className='help-text'>{helpText}</p>}
    </div>
  );
}
