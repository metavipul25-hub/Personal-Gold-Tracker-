import { describe, it, expect } from 'vitest';
import { validateUploadedFile, sanitizeFilename, MAX_FILE_SIZE } from '../../utils/fileValidation';

describe('File Validation', () => {
  const defaultOptions = {
    allowedMimeTypes: ['image/jpeg', 'application/pdf'],
    allowedExtensions: ['.jpg', '.pdf'],
    maxSizeBytes: MAX_FILE_SIZE
  };

  describe('validateUploadedFile', () => {
    it('rejects null/undefined files', () => {
      expect(validateUploadedFile(null, defaultOptions).valid).toBe(false);
      expect(validateUploadedFile(undefined, defaultOptions).valid).toBe(false);
    });

    it('rejects empty files', () => {
      const emptyFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      expect(validateUploadedFile(emptyFile, defaultOptions).error).toBe('File is empty.');
    });

    it('rejects files larger than max size', () => {
      const largeContent = new Uint8Array(6 * 1024 * 1024); // 6MB
      const largeFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
      expect(validateUploadedFile(largeFile, defaultOptions).valid).toBe(false);
      expect(validateUploadedFile(largeFile, defaultOptions).error).toContain('exceeds');
    });

    it('rejects unauthorized MIME types', () => {
      const exeFile = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
      expect(validateUploadedFile(exeFile, defaultOptions).error).toBe('Unsupported file type.');
    });

    it('rejects unauthorized extensions', () => {
      // Trick MIME type, bad extension
      const badExtFile = new File(['content'], 'test.exe', { type: 'application/pdf' });
      expect(validateUploadedFile(badExtFile, defaultOptions).error).toBe('Unsupported file extension.');
    });

    it('detects and rejects path traversal patterns in filename', () => {
      const badFile1 = new File(['content'], '../test.pdf', { type: 'application/pdf' });
      const badFile2 = new File(['content'], 'C:\\windows\\test.pdf', { type: 'application/pdf' });
      expect(validateUploadedFile(badFile1, defaultOptions).error).toBe('Invalid characters in filename.');
      expect(validateUploadedFile(badFile2, defaultOptions).error).toBe('Invalid characters in filename.');
    });

    it('accepts valid files', () => {
      const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      expect(validateUploadedFile(validFile, defaultOptions).valid).toBe(true);
    });
  });

  describe('sanitizeFilename', () => {
    it('replaces special characters with underscores', () => {
      expect(sanitizeFilename('my file(1).pdf')).toBe('my_file_1_.pdf');
      expect(sanitizeFilename('test@#$name.jpg')).toBe('test___name.jpg');
    });

    it('preserves valid characters', () => {
      expect(sanitizeFilename('valid-file_name.123.pdf')).toBe('valid-file_name.123.pdf');
    });
  });
});
