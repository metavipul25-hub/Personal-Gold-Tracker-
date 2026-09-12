import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { TransactionModal } from '../../components/modals/TransactionModal';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="icon-x" />,
  ArrowRight: () => <div data-testid="icon-arrow-right" />,
  ArrowLeft: () => <div data-testid="icon-arrow-left" />,
  Check: () => <div data-testid="icon-check" />,
  AlertTriangle: () => <div data-testid="icon-alert" />,
  ArrowRightLeft: () => <div data-testid="icon-arrows" />,
}));

test('TransactionModal dropdowns have dark text and white background classes for readability', () => {
  render(
    <TransactionModal 
      isOpen={true} 
      onClose={() => {}} 
      onSave={async () => {}} 
      existingTxCount={0} 
      assets={[{ assetId: 'AST-1', assetName: 'Test Asset' } as any]} 
      transactions={[]} 
    />
  );

  // Go to step 2 to see the dropdowns
  const nextBtn = screen.getByText('Continue');
  fireEvent.click(nextBtn);

  // Asset selection dropdown
  const assetSelects = screen.getAllByRole('combobox');
  
  // Verify that the select elements have the text-slate-900 and bg-white classes
  assetSelects.forEach(select => {
    expect(select.className).toContain('text-slate-900');
    expect(select.className).toContain('bg-white');
  });
});
