import React from 'react';
import './NoticeShortfallBanner.css';

export default function NoticeShortfallBanner({ snapshot }) {
  if (!snapshot || snapshot.applied === false) {
    return null;
  }

  const {
    contractual_notice_days,
    actual_notice_given_days,
    shortfall_days,
    daily_rate,
    deduction_amount,
  } = snapshot;

  return (
    <div className="notice-shortfall-banner">
      <div className="notice-shortfall-banner__heading">
        <span>⚠️</span> Notice Period Shortfall Deduction
      </div>
      <div className="notice-shortfall-banner__row">
        <span className="notice-shortfall-banner__label">Required notice</span>
        <span className="notice-shortfall-banner__value">{contractual_notice_days} days</span>
      </div>
      <div className="notice-shortfall-banner__row">
        <span className="notice-shortfall-banner__label">Notice served</span>
        <span className="notice-shortfall-banner__value">{actual_notice_given_days} days</span>
      </div>
      <div className="notice-shortfall-banner__row">
        <span className="notice-shortfall-banner__label">Shortfall</span>
        <span className="notice-shortfall-banner__value">{shortfall_days} days</span>
      </div>
      <div className="notice-shortfall-banner__row">
        <span className="notice-shortfall-banner__label">Daily rate</span>
        <span className="notice-shortfall-banner__value">₹{daily_rate}</span>
      </div>
      <div className="notice-shortfall-banner__divider" />
      <div className="notice-shortfall-banner__row notice-shortfall-banner__total-row">
        <span className="notice-shortfall-banner__label">Total deducted</span>
        <span className="notice-shortfall-banner__value">₹{deduction_amount}</span>
      </div>
    </div>
  );
}
