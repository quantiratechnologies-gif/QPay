import React, { useState } from 'react';
import { Check, Copy, CheckCheck } from 'lucide-react';
import { PrimaryButton } from '../../PrimaryButton';
import { formatSaudiCurrency, translateText } from '../../../utils/i18n';
import type { ConfirmedBooking } from './types';

interface TravelConfirmationModalProps {
  booking: ConfirmedBooking | null;
  onClose: () => void;
  language: string;
  isAr: boolean;
  isRtl: boolean;
}

export const TravelConfirmationModal: React.FC<TravelConfirmationModalProps> = ({
  booking,
  onClose,
  language,
  isAr,
  isRtl,
}) => {
  const [copiedPnr, setCopiedPnr] = useState(false);

  if (!booking) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 15, 25, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 2600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--color-surface, #111726)',
          border: '1.5px solid var(--brand-green, #7FE87F)',
          borderRadius: '24px',
          padding: '28px 22px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
            color: 'var(--brand-green, #7FE87F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}
        >
          <Check size={36} strokeWidth={3} />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          {isAr ? '?? ????? ????? ?????!' : 'Booking Confirmed!'}
        </h3>
        <div style={{ fontSize: '13px', color: '#8E9BAE', marginTop: '4px', marginBottom: '20px' }}>
          {booking.item.title}
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-surface-elevated, #182236)',
            borderRadius: '16px',
            padding: '16px',
            textAlign: isRtl ? 'right' : 'left',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: '#8E9BAE' }}>
              {translateText('Booking Reference (PNR)', language)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)', fontFamily: 'monospace' }}>
                {booking.pnr}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(booking.pnr);
                  setCopiedPnr(true);
                  setTimeout(() => setCopiedPnr(false), 2000);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copiedPnr ? 'var(--brand-green, #7FE87F)' : '#8E9BAE',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                }}
                title="Copy PNR"
              >
                {copiedPnr ? <CheckCheck size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#8E9BAE' }}>{isAr ? '?????? ??????' : 'UTR Ref'}</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace' }}>
              {booking.utr}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#8E9BAE' }}>{isAr ? '????? ?????' : 'Travel Date'}</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
              {booking.travelDate}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px dashed var(--color-border, rgba(255, 255, 255, 0.12))',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{isAr ? '?????? ???????' : 'Total Paid'}</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
              {formatSaudiCurrency(booking.totalPaid, language)}
            </span>
          </div>
        </div>

        <PrimaryButton onClick={onClose}>
          {isAr ? '????? ???? ???????' : 'Done & View E-Ticket'}
        </PrimaryButton>
      </div>
    </div>
  );
};
