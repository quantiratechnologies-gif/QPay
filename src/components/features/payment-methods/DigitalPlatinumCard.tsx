import React from 'react';
import { ShieldCheck, Wifi } from 'lucide-react';

interface DigitalPlatinumCardProps {
  displayName: string;
  t: (key: string, fallback?: string) => string;
}

export const DigitalPlatinumCard: React.FC<DigitalPlatinumCardProps> = ({ displayName, t }) => {
  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          color: '#C8E6C9',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '10px',
          marginInlineStart: '4px',
        }}
      >
        {t('cards.digital_mada', 'Digital Debit Card (mada & Apple Pay)')}
      </div>

      <div
        style={{
          background:
            'linear-gradient(135deg, #052e16 0%, #064e3b 40%, #031c12 75%, #0e0e18 100%)',
          border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
          borderRadius: '20px',
          padding: '22px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '175px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Top Row: QTPay emblem + Contactless wave */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={18} color="var(--brand-green, #7FE87F)" />
            </div>
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                }}
              >
                {t('cards.platinum', 'QTPay Platinum')}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--brand-green, #7FE87F)',
                  fontWeight: 700,
                }}
              >
                {t('cards.instant_debit', 'Sarie Instant Debit')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wifi
              size={18}
              color="var(--brand-green, #7FE87F)"
              style={{ transform: 'rotate(90deg)' }}
            />
          </div>
        </div>

        {/* Middle Row: Card Number */}
        <div style={{ margin: '14px 0 8px 0', direction: 'ltr' }}>
          <div
            className="tabular-nums"
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.18em',
              fontFamily: 'monospace',
            }}
          >
            •••• &nbsp;•••• &nbsp;•••• &nbsp;5192
          </div>
        </div>

        {/* Bottom Row: Holder Name, Expiry & mada Logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div
              style={{
                fontSize: '9px',
                color: '#A2E6A2',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
              }}
            >
              {t('cards.cardholder', 'Cardholder')}
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#FFFFFF',
                marginTop: '2px',
              }}
            >
              {displayName}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '9px',
                color: '#A2E6A2',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
              }}
            >
              {t('cards.expires', 'Expires')}
            </div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#FFFFFF',
                marginTop: '2px',
                fontFamily: 'monospace',
              }}
            >
              08/29
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 900,
                color: 'var(--brand-green, #7FE87F)',
                letterSpacing: '0.05em',
              }}
            >
              mada
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
