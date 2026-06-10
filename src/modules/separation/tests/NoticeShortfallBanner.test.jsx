import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoticeShortfallBanner from '../components/NoticeShortfallBanner';

const mockSnapshot = {
  applied: true,
  shortfall_days: 10,
  contractual_notice_days: 30,
  actual_notice_given_days: 20,
  daily_rate: "4000.00",
  deduction_amount: "40000.00"
};

describe('NoticeShortfallBanner', () => {
  it('renders nothing when snapshot is null', () => {
    const { container } = render(<NoticeShortfallBanner snapshot={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when applied is false', () => {
    const { container } = render(<NoticeShortfallBanner snapshot={{ ...mockSnapshot, applied: false }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders banner when applied is true', () => {
    render(<NoticeShortfallBanner snapshot={mockSnapshot} />);
    
    expect(screen.getByText(/Notice Period Shortfall Deduction/i)).toBeInTheDocument();
    expect(screen.getByText('10 days')).toBeInTheDocument();
    expect(screen.getByText('₹40000.00')).toBeInTheDocument();
  });

  it('displays all row labels', () => {
    render(<NoticeShortfallBanner snapshot={mockSnapshot} />);
    
    expect(screen.getByText('Required notice')).toBeInTheDocument();
    expect(screen.getByText('Notice served')).toBeInTheDocument();
    expect(screen.getByText('Shortfall')).toBeInTheDocument();
    expect(screen.getByText('Daily rate')).toBeInTheDocument();
    expect(screen.getByText('Total deducted')).toBeInTheDocument();
  });
});
