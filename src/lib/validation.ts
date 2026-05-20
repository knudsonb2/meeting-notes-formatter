const MAX_FILE_SIZE =
  parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024;

export const ALLOWED_TEMPLATE_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf',
];

export const ALLOWED_NOTES_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf',
  'text/plain',
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateTemplateFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No template file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Template file too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (!ALLOWED_TEMPLATE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported template file type. Please upload .docx or .pdf',
    };
  }

  return { valid: true };
}

export function validateNotesFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No notes file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Notes file too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (!ALLOWED_NOTES_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported notes file type. Please upload .docx, .pdf, or .txt',
    };
  }

  return { valid: true };
}

export function validateNotesText(text: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Notes text cannot be empty' };
  }

  if (text.length < 10) {
    return {
      valid: false,
      error: 'Notes text is too short. Please provide more detailed notes.',
    };
  }

  return { valid: true };
}

export function validateMetadata(metadata: any): ValidationResult {
  return { valid: true };
}
