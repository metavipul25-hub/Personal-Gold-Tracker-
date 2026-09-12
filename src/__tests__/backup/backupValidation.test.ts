import { describe, it, expect } from 'vitest';
import { validateAppBackup } from '../../utils/backupValidation';

describe('Backup Validation', () => {
  it('rejects non-object backups', () => {
    expect(validateAppBackup(null).valid).toBe(false);
    expect(validateAppBackup('string').valid).toBe(false);
  });

  it('rejects unsupported versions', () => {
    const backup = {
      version: 2,
      data: {}
    };
    expect(validateAppBackup(backup).error).toContain('Unsupported backup version');
  });

  it('rejects missing data object', () => {
    expect(validateAppBackup({ version: 1 }).error).toContain('Missing or invalid "data" object');
  });

  it('rejects invalid arrays in data', () => {
    const backup = {
      version: 1,
      data: { assets: 'not_an_array' }
    };
    expect(validateAppBackup(backup).error).toContain('Missing or invalid "assets" array');
  });

  it('accepts valid backup', () => {
    const backup = {
      version: 1,
      data: { assets: [], transactions: [], lifeGoals: [], sipPlans: [] }
    };
    expect(validateAppBackup(backup).valid).toBe(true);
  });
});
