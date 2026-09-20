import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { QRCodeView } from '../../QRCodeView';
import type { BankAccount } from '../../../types';

interface ReceiveQrCardProps {
  displayName: string;
  avatarUrl?: string;
  avatarInitials?: string;
  primaryBank?: BankAccount;
  upiQrString: string;
  isAr: boolean;
  t: (key: string, fallback?: string) => string;
}

export const ReceiveQrCard: React.FC<ReceiveQrCardProps> = ({
  displayName,
  avatarUrl,
  avatarInitials,
  primaryBank,
  upiQrString,
  isAr,
  t,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface, #111726)',
        border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
        borderRadius: '24px',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* User Avatar */}
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
          color: 'var(--brand-green, #7FE87F)',
          fontWeight: 800,
          fontSize: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '10px',
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : (
          avatarInitials
        )}
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
        {displayName}
      </h2>
      <div
        style={{
          fontSize: '12px',
          color: '#8E9BAE',
          marginTop: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <ShieldCheck size={14} color="var(--brand-green, #7FE87F)" />
        <span>
          {primaryBank ? t(primaryBank.bankName, primaryBank.bankName) : 'Al Rajhi Bank'} •{' '}
          {isAr ? 'حساب معتمد' : 'Verified Sarie Account'}
        </span>
      </div>

      {/* QR Code Container */}
      <div
        style={{
          padding: '12px',
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          margin: '20px 0',
        }}
      >
        <QRCodeView value={upiQrString} size={180} />
      </div>

      <div style={{ fontSize: '11.5px', color: '#8E9BAE', fontWeight: 600 }}>
        {isAr
          ? 'امسح الرمز للدفع الفوري عبر أي تطبيق بنكي سعودي'
          : 'Scan to pay instantly via any Saudi Banking App'}
      </div>
    </div>
  );
};
