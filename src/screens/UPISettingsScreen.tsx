import React, { useState } from 'react';
import { ShieldCheck, Key, QrCode } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { ListRow } from '../components/ListRow';
import { SamaLogo } from '../components/SamaLogo';
import { useApp } from '../state/AppContext';
import {
  SarieAliasCard,
  MaskIbanCard,
  SwitchBankModal,
  ChangePinModal,
} from '../components/features/settings';

export const UPISettingsScreen: React.FC = () => {
  const { user, bankAccounts, setPrimaryBank, navigateTo, language, t } = useApp();
  const isAr = language === 'العربية' || language === 'ar';
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isBankSwitchOpen, setIsBankSwitchOpen] = useState(false);
  const [maskIban, setMaskIban] = useState(true);

  const primaryBank = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0];

  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#080c14',
        minHeight: '100%',
        paddingBottom: '96px',
        color: '#FFFFFF',
      }}
    >
      <AppHeader
        title={isAr ? 'إعدادات المعرّف وسريع' : 'Alias & Sarie Settings'}
        showBack
        showSettings={false}
      />

      <div style={{ padding: '20px' }}>
        {/* Active Alias / VPA Card */}
        <SarieAliasCard
          upiId={user.upiId}
          primaryBank={primaryBank}
          language={language}
          t={t}
          onOpenBankSwitch={() => setIsBankSwitchOpen(true)}
        />

        {/* Alias Privacy & Tokenization Setting */}
        <MaskIbanCard
          maskIban={maskIban}
          onToggle={() => setMaskIban(!maskIban)}
          language={language}
        />

        {/* Config Menu Items */}
        <div
          style={{
            backgroundColor: '#111726',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: 'none',
          }}
        >
          <ListRow
            icon={<QrCode size={18} color="#7FE87F" />}
            label={isAr ? 'رمز سريع QR الخاص بي' : 'My Sarie QR Code'}
            onClick={() => navigateTo('RECEIVE')}
          />
          <ListRow
            icon={<Key size={18} color="#7FE87F" />}
            label={isAr ? 'تغيير الرمز السري للتحويل' : 'Change Sarie Payment PIN'}
            onClick={() => setIsPinModalOpen(true)}
          />
          <ListRow
            icon={<ShieldCheck size={18} color="#7FE87F" />}
            label={isAr ? 'الحد اليومي للتحويل' : 'Daily Transfer Limit'}
            isLast={true}
            rightElement={
              <span
                style={{
                  fontSize: '11px',
                  color: '#7FE87F',
                  fontWeight: 800,
                  backgroundColor: '#182236',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                {isAr ? '٥٠,٠٠٠ ر.س / يومياً' : 'SAR 50,000 / day'}
              </span>
            }
          />
        </div>

        {/* Footer SAMA Regulation */}
        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <SamaLogo height={12} themeMode="green" />
          <span style={{ fontSize: '10.5px', color: '#9ca3af', fontWeight: 600 }}>
            {isAr
              ? 'بنية تحتية مشفرة • نظام سريع المعتمد من البنك المركزي'
              : 'Tokenized Rails • SAMA & Sarie Authenticated'}
          </span>
        </div>
      </div>

      {/* Switch Bank Portability Modal */}
      {isBankSwitchOpen && (
        <SwitchBankModal
          isOpen={isBankSwitchOpen}
          bankAccounts={bankAccounts}
          language={language}
          onClose={() => setIsBankSwitchOpen(false)}
          onSelectBank={(bankId) => setPrimaryBank(bankId)}
        />
      )}

      {/* Change PIN Modal */}
      <ChangePinModal
        isOpen={isPinModalOpen}
        language={language}
        onClose={() => setIsPinModalOpen(false)}
      />
    </div>
  );
};
