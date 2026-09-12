import { describe, it, expect } from 'vitest';
import { sanitizeExcelString } from '../../utils/excelExport';

describe('Excel Export Security', () => {
  describe('sanitizeExcelString', () => {
    it('prepends a single quote to strings starting with =', () => {
      expect(sanitizeExcelString('=SUM(A1:A2)')).toBe("'=SUM(A1:A2)");
      expect(sanitizeExcelString('  =CMD()')).toBe("'  =CMD()");
    });

    it('prepends a single quote to strings starting with +', () => {
      expect(sanitizeExcelString('+1+2')).toBe("'+1+2");
    });

    it('prepends a single quote to strings starting with -', () => {
      expect(sanitizeExcelString('-100')).toBe("'-100");
    });

    it('prepends a single quote to strings starting with @', () => {
      expect(sanitizeExcelString('@malicious')).toBe("'@malicious");
    });

    it('returns normal strings unmodified', () => {
      expect(sanitizeExcelString('Hello World')).toBe('Hello World');
      expect(sanitizeExcelString('12345')).toBe('12345');
      expect(sanitizeExcelString('Gold Coin')).toBe('Gold Coin');
    });

    it('returns non-string values unmodified', () => {
      expect(sanitizeExcelString(100)).toBe(100);
      expect(sanitizeExcelString(true)).toBe(true);
      expect(sanitizeExcelString(null)).toBe(null);
      expect(sanitizeExcelString(undefined)).toBe(undefined);
    });
  });
});
