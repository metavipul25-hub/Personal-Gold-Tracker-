import { describe, it, expect } from 'vitest';
import { TransactionService } from '../../services/TransactionService';
import { TransactionHistoryRecord } from '../../types';

describe('TransactionService', () => {
  describe('validateTransaction', () => {
    it('requires a transaction type', () => {
      const error = TransactionService.validateTransaction({ type: '' as any, weightGrams: 10 }, false, []);
      expect(error).toBe('Transaction type is required.');
    });

    it('requires an asset ID for existing asset transactions', () => {
      const error = TransactionService.validateTransaction({ type: 'SALE', weightGrams: 10 }, false, []);
      expect(error).toBe('Asset ID is required for this transaction type.');
    });
    
    it('requires weight to be greater than zero', () => {
      const error = TransactionService.validateTransaction({ type: 'SALE', assetId: 'AST-1', weightGrams: 0 }, false, []);
      expect(error).toBe('Weight must be greater than zero.');
    });

    it('returns null (no error) for valid transactions', () => {
      // Add a purchase so there is available inventory
      const txs = [
        { txId: 'TX-1', date: '2026-01-01', assetId: 'AST-1', type: 'PURCHASE', quantity: 10, weightGrams: 100, grossWeightGrams: 100, purity: '24K' }
      ] as any as TransactionHistoryRecord[];
      const error = TransactionService.validateTransaction({ type: 'SALE', assetId: 'AST-1', quantity: 1, weightGrams: 10, grossWeightGrams: 10 }, false, txs);
      expect(error).toBeNull();
    });

    it('validates available quantity for withdrawal', () => {
      const txs = [
        { txId: 'TX-1', date: '2026-01-01', assetId: 'AST-1', type: 'PURCHASE', quantity: 1, weightGrams: 10, grossWeightGrams: 10, purity: '24K' }
      ] as any as TransactionHistoryRecord[];
      // Try to remove 2 quantity when only 1 is available
      const error = TransactionService.validateTransaction({ type: 'SALE', assetId: 'AST-1', quantity: 2, weightGrams: 10, grossWeightGrams: 10 }, false, txs);
      expect(error).toContain('Insufficient available quantity');
    });
  });
});
