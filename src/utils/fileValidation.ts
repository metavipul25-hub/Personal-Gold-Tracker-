export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface FileValidationOptions {
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxSizeBytes?: number;
}

export const validateUploadedFile = (
  file: File | null | undefined,
  options: FileValidationOptions
): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }
  
  const maxSize = options.maxSizeBytes || MAX_FILE_SIZE;
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds the ${(maxSize / 1024 / 1024).toFixed(1)}MB limit.` };
  }
  
  // Ensure MIME type is present and allowed
  if (!file.type || !options.allowedMimeTypes.includes(file.type)) {
     return { valid: false, error: 'Unsupported file type.' };
  }
  
  // Validate extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !options.allowedExtensions.includes(`.${ext}`)) {
    return { valid: false, error: 'Unsupported file extension.' };
  }
  
  // Filename safety: check for path traversal patterns or dangerous characters
  if (/[<>:"/\\|?*\x00-\x1F]/.test(file.name) || file.name.includes('..')) {
      return { valid: false, error: 'Invalid characters in filename.' };
  }
  
  return { valid: true };
};

export const sanitizeFilename = (filename: string): string => {
  // Replace anything that is not alphanumeric, dot, dash, or underscore with underscore
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
};
