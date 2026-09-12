import { describe, it, expect } from 'vitest';
import { 
  calculateAssetAvailableQuantity,
  calculateAssetAvailableGrossWeight
} from '../../utils/calculations';

describe('Asset Inventory Calculations', () => {
  const asset = {
    assetId: 'AST-1',
    quantity: 10,
    grossWeight: 100
  };

  describe('calculateAssetAvailableQuantity', () => {
    it('returns calculated quantity from transactions (0 if none)', () => {
      // The function calculates pure delta from transactions
      expect(calculateAssetAvailableQuantity('AST-1', [], asset)).toBe(0);
    });

    it('handles REVERSAL properly (reversing a PURCHASE)', () => {
      const txs = [
        { txId: 'TX-1', assetId: 'AST-1', type: 'PURCHASE', quantity: 10 },
        { txId: 'TX-2', assetId: 'AST-1', type: 'PURCHASE', quantity: 2 },
        { txId: 'TX-3', assetId: 'AST-1', type: 'REVERSAL', originalTxId: 'TX-2', quantity: 0 }
      ];
      expect(calculateAssetAvailableQuantity('AST-1', txs)).toBe(10);
    });

    it('handles ASSET SPLIT and MERGE properly', () => {
      const txs = [
        { txId: 'TX-1', assetId: 'AST-1', type: 'OPENING BALANCE', quantity: 10 },
        { txId: 'TX-2', assetId: 'AST-1', type: 'ASSET SPLIT', quantity: 2 },
      ];
      expect(calculateAssetAvailableQuantity('AST-1', txs)).toBe(12);
    });
  });

  describe('calculateAssetAvailableGrossWeight', () => {
    it('returns calculated weight from transactions (0 if none)', () => {
      expect(calculateAssetAvailableGrossWeight(asset, [])).toBe(0);
    });

    it('handles REVERSAL of weight transactions (reversing a PURCHASE)', () => {
      const txs = [
        { txId: 'TX-1', assetId: 'AST-1', type: 'OPENING BALANCE', grossWeightGrams: 100 },
        { txId: 'TX-2', assetId: 'AST-1', type: 'PURCHASE', grossWeightGrams: 20 },
        { txId: 'TX-3', assetId: 'AST-1', type: 'REVERSAL', originalTxId: 'TX-2', grossWeightGrams: 0 },
      ];
      expect(calculateAssetAvailableGrossWeight(asset, txs)).toBe(100);
    });
  });
});
