import React, { useState } from 'react';
import { X, Check, Calendar, Users, ShieldCheck } from 'lucide-react';
import { PrimaryButton } from '../../PrimaryButton';
import { SecondaryButton } from '../../SecondaryButton';
import { formatSaudiCurrency } from '../../../utils/i18n';
import type { TravelItem } from './types';

interface TravelBookingModalProps {
  item: TravelItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingDetails: { travelDate: string; guestCount: number }) => void;
  language: string;
  isAr: boolean;
  isRtl: boolean;
}

export const TravelBookingModal: React.FC<TravelBookingModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
  language,
  isAr,
  isRtl,
}) => {
  const [bookingStep, setBookingStep] = useState<'details' | 'review'>('details');
  const [travelDate, setTravelDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [guestCount, setGuestCount] = useState<number>(1);

  if (!isOpen) return null;

  const totalToPay = item.price * guestCount;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 15, 25, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 2600,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--color-surface, #111726)',
          borderTop: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '24px 20px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--brand-green, #7FE87F)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {bookingStep === 'details'
                ? isAr
                  ? '?????? ????? ?????????'
                  : 'Step 1: Select Details'
                : isAr
                ? '?????? ?????? ?????'
                : 'Step 2: Review & Confirm'}
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '4px 0 0 0' }}>{item.title}</h3>
            <div style={{ fontSize: '12px', color: '#8E9BAE' }}>{item.provider}</div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              border: 'none',
              color: '#8E9BAE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {bookingStep === 'details' ? (
          /* STEP 1: DETAILS & SELECTION */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Highlights */}
            <div style={{ backgroundColor: 'var(--color-surface-elevated, #182236)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                {isAr ? '??????? ???????? ?? ?????' : 'Package Inclusions & Benefits'}
              </div>
              {item.highlights.map((h, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '12px',
                    color: '#C8E6C9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px',
                  }}
                >
                  <Check size={14} color="var(--brand-green, #7FE87F)" /> <span>{h}</span>
                </div>
              ))}
            </div>

            {/* Date Selection */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#8E9BAE',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                {isAr ? '????? ????? / ?????' : 'Travel / Check-in Date'}
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                  borderRadius: '12px',
                  padding: '12px 14px',
                }}
              >
                <Calendar size={18} color="var(--brand-green, #7FE87F)" />
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 700,
                    outline: 'none',
                    width: '100%',
                    colorScheme: 'dark',
                  }}
                />
              </div>
            </div>

            {/* Guest Selector */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#8E9BAE',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                {isAr ? '??? ????????? / ??????' : 'Number of Guests / Passengers'}
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                  borderRadius: '12px',
                  padding: '8px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color="var(--brand-green, #7FE87F)" />
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                    {guestCount} {isAr ? '???' : 'Person(s)'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#2C2C44',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    -
                  </button>
                  <button
                    onClick={() => setGuestCount(guestCount + 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: 'var(--brand-green, #7FE87F)',
                      color: '#080C14',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total Price Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: 'rgba(127, 232, 127, 0.08)',
                border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
                borderRadius: '14px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                {isAr ? '?????? ?????? ???????' : 'Total Amount'}
              </span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
                {formatSaudiCurrency(totalToPay, language)}
              </span>
            </div>

            <PrimaryButton onClick={() => setBookingStep('review')}>
              {isAr ? '?????? ?????? ?????' : 'Review Booking'} ?
            </PrimaryButton>
          </div>
        ) : (
          /* STEP 2: REVIEW & CONFIRM */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                backgroundColor: 'var(--color-surface-elevated, #182236)',
                borderRadius: '16px',
                padding: '18px',
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', color: '#8E9BAE' }}>{isAr ? '??????' : 'Service'}</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{item.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', color: '#8E9BAE' }}>{isAr ? '???? ??????' : 'Provider'}</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{item.provider}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', color: '#8E9BAE' }}>{isAr ? '????? ?????' : 'Date'}</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{travelDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', color: '#8E9BAE' }}>{isAr ? '?????' : 'Guests'}</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{guestCount}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px dashed var(--color-border, rgba(255, 255, 255, 0.12))',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                  {isAr ? '?????? ????????' : 'Total to Pay'}
                </span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
                  {formatSaudiCurrency(totalToPay, language)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <SecondaryButton onClick={() => setBookingStep('details')}>
                {isAr ? '?????' : 'Back'}
              </SecondaryButton>
              <div style={{ flex: 2 }}>
                <PrimaryButton onClick={() => onConfirm({ travelDate, guestCount })}>
                  <ShieldCheck size={18} /> {isAr ? '????? ????? ?????? ??????' : 'Confirm & Pay Now'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
