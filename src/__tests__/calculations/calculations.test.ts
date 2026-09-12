import { describe, it, expect } from 'vitest';
import { 
  calculateNetGoldWeight, 
  calculatePureGoldWeight, 
  parsePurityToFineness,
  getTransactionImpactMultiplier
} from '../../utils/calculations';

describe('Calculations', () => {
  describe('calculateNetGoldWeight', () => {
    it('subtracts stone and other weight from gross weight', () => {
      expect(calculateNetGoldWeight(10, 2, 1)).toBe(7);
      expect(calculateNetGoldWeight(10, 2)).toBe(8);
      expect(calculateNetGoldWeight(10)).toBe(10);
    });

    it('returns 0 if deduction exceeds gross weight', () => {
      expect(calculateNetGoldWeight(10, 12)).toBe(0);
    });

    it('handles floating point values properly', () => {
      expect(calculateNetGoldWeight(10.55, 2.1)).toBeCloseTo(8.45);
    });
  });

  describe('calculatePureGoldWeight', () => {
    it('calculates pure gold based on karat string', () => {
      expect(calculatePureGoldWeight(10, '24K')).toBe(9.99);
      expect(calculatePureGoldWeight(10, '22K')).toBeCloseTo(9.16);
      expect(calculatePureGoldWeight(10, '18K')).toBeCloseTo(7.5);
    });

    it('calculates pure gold based on fineness number (like 916)', () => {
      expect(calculatePureGoldWeight(10, 916)).toBeCloseTo(9.16);
      expect(calculatePureGoldWeight(10, 999)).toBeCloseTo(9.99);
    });

    it('calculates pure gold based on numeric karat (like 22)', () => {
      expect(calculatePureGoldWeight(10, 22)).toBeCloseTo(9.167);
    });

    it('returns 0 for invalid inputs', () => {
      expect(calculatePureGoldWeight(0, '22K')).toBe(0);
    });
  });

  describe('parsePurityToFineness', () => {
    it('returns fineness for standard karats', () => {
      expect(parsePurityToFineness('24K')).toBe(0.999);
      expect(parsePurityToFineness('22K')).toBe(0.916);
      expect(parsePurityToFineness('18K')).toBe(0.750);
    });

    it('returns 0 for unknown/invalid purity', () => {
      expect(parsePurityToFineness('invalid')).toBe(0);
      expect(parsePurityToFineness(null)).toBe(0);
      expect(parsePurityToFineness(undefined)).toBe(0);
    });
  });

  describe('getTransactionImpactMultiplier', () => {
    it('returns 1 for acquisition types', () => {
      expect(getTransactionImpactMultiplier('PURCHASE')).toBe(1);
      expect(getTransactionImpactMultiplier('OPENING BALANCE')).toBe(1);
      expect(getTransactionImpactMultiplier('GIFT RECEIVED')).toBe(1);
      expect(getTransactionImpactMultiplier('INHERITANCE RECEIVED')).toBe(1);
    });

    it('returns -1 for disposal types', () => {
      expect(getTransactionImpactMultiplier('SALE')).toBe(-1);
      expect(getTransactionImpactMultiplier('GIFT GIVEN')).toBe(-1);
      expect(getTransactionImpactMultiplier('INHERITANCE TRANSFERRED')).toBe(-1);
    });

    it('returns 1 for neutral types where impact applies as delta', () => {
      expect(getTransactionImpactMultiplier('ASSET SPLIT')).toBe(1);
      expect(getTransactionImpactMultiplier('ASSET MERGE')).toBe(1);
    });
  });
});
