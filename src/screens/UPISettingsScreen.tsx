import React, { useState } from 'react';
import { Copy, ShieldCheck, Key, QrCode, Check, Landmark, RefreshCw, EyeOff } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { ListRow } from '../components/ListRow';
import { Modal } from '../components/Modal';
import { SamaLogo } from '../components/SamaLogo';
import { useApp } from '../state/AppContext';
import { translateText } from '../utils/i18n';

export const UPISettingsScreen: React.FC = () => {
  const { user, bankAccounts, setPrimaryBank, navigateTo, language, t, verifyUserPin, setUserPin } = useApp();
  const isAr = language === 'العربية' || language === 'ar';
  const [copied, setCopied] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isBankSwitchOpen, setIsBankSwitchOpen] = useState(false);
  const [maskIban, setMaskIban] = useState(true);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const primaryBank = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(user.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (oldPin.length !== 4) {
      setPinError(translateText('Old PIN must be 4 digits', language));
      return;
    }
    if (!verifyUserPin(oldPin)) {
      setPinError(language === 'العربية' ? 'الرمز القديم غير صحيح' : 'Old PIN is incorrect');
      return;
    }
    if (newPin.length !== 4) {
      setPinError(translateText('New PIN must be 4 digits', language));
      return;
    }
    if (newPin !== confirmPin) {
      setPinError(translateText('New PIN and Confirm PIN do not match', language));
      return;
    }

    setUserPin(newPin);
    setPinSuccess(true);
    setTimeout(() => {
      setPinSuccess(false);
      setIsPinModalOpen(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    }, 1200);
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#080c14', minHeight: '100%', paddingBottom: '96px', color: '#FFFFFF' }}>
      <AppHeader title={isAr ? 'إعدادات المعرّف وسريع' : 'Alias & Sarie Settings'} showBack showSettings={false} />

      <div style={{ padding: '20px' }}>
        {/* Active Alias / VPA Card */}
        <div
          style={{
            backgroundColor: '#111726',
            border: '1px solid rgba(127, 232, 127, 0.35)',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '20px',
            color: '#FFFFFF',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11.5px', color: '#7FE87F', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 800 }}>
              {isAr ? 'معرّف الدفع (Alias)' : 'Payment Alias'}
            </div>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: '#7FE87F',
                backgroundColor: 'rgba(127, 232, 127, 0.14)',
                padding: '3px 8px',
                borderRadius: '8px',
                border: '1px solid rgba(127, 232, 127, 0.22)',
              }}
            >
              {isAr ? 'موثق عبر سريع' : 'Sarie Verified'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '17px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.01em', direction: 'ltr' }}>
              {user.upiId}
            </span>
            <button
              onClick={handleCopy}
              className="interactive-tap"
              style={{
                backgroundColor: '#7FE87F',
                border: 'none',
                color: '#080c14',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 12px rgba(127, 232, 127, 0.22)',
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? translateText('Copied', language) : t('copy')}
            </button>
          </div>

          {/* Mapped Bank Portability Sub-bar */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={15} color="#7FE87F" />
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                {isAr ? 'مرتبط حالياً بـ:' : 'Mapped to:'}{' '}
                <strong style={{ color: '#FFFFFF' }}>{primaryBank?.bankName || 'Al Rajhi Bank'}</strong>
              </div>
            </div>
            <button
              onClick={() => setIsBankSwitchOpen(true)}
              className="interactive-tap"
              style={{
                background: 'none',
                border: 'none',
                color: '#7FE87F',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RefreshCw size={12} /> {isAr ? 'تبديل الحساب' : 'Switch Bank'}
            </button>
          </div>
        </div>

        {/* Alias Privacy & Tokenization Setting */}
        <div
          style={{
            backgroundColor: '#111726',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: '#182236',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EyeOff size={18} color="#7FE87F" />
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>
                {isAr ? 'إخفاء رقم الآيبان عبر المعرّف' : 'Mask IBAN with Alias'}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                {isAr ? 'استقبال الأموال دون مشاركة رقم حسابك البنكي' : 'Receive payments without sharing bank details'}
              </div>
            </div>
          </div>

          <div
            onClick={() => setMaskIban(!maskIban)}
            role="button"
            tabIndex={0}
            className="interactive-tap"
            style={{
              width: '46px',
              height: '26px',
              borderRadius: '13px',
              backgroundColor: maskIban ? '#7FE87F' : '#182236',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: maskIban ? '#080c14' : '#9ca3af',
                position: 'absolute',
                top: '2px',
                left: maskIban ? '22px' : '3px',
                transition: 'all 0.2s ease',
              }}
            />
          </div>
        </div>

        {/* Config Menu Items */}
        <div style={{ backgroundColor: '#111726', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', overflow: 'hidden', boxShadow: 'none' }}>
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
        <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <SamaLogo height={12} themeMode="green" />
          <span style={{ fontSize: '10.5px', color: '#9ca3af', fontWeight: 600 }}>
            {isAr ? 'بنية تحتية مشفرة • نظام سريع المعتمد من البنك المركزي' : 'Tokenized Rails • SAMA & Sarie Authenticated'}
          </span>
        </div>
      </div>

      {/* Switch Bank Portability Modal */}
      {isBankSwitchOpen && (
        <Modal
          isOpen={isBankSwitchOpen}
          onClose={() => setIsBankSwitchOpen(false)}
          title={isAr ? 'تبديل الحساب المرتبط بالمعرّف' : 'Switch Alias Receiving Bank'}
        >
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px', lineHeight: '1.4' }}>
              {isAr
                ? 'اختر الحساب البنكي الذي ترغب في استقبال الحوالات عليه مباشرة عبر معرّفك.'
                : 'Choose which bank account receives transfers sent to your @qtpay alias.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {bankAccounts.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setPrimaryBank(b.id);
                    setIsBankSwitchOpen(false);
                  }}
                  className="interactive-tap"
                  style={{
                    backgroundColor: b.isPrimary ? 'rgba(127, 232, 127, 0.14)' : '#182236',
                    border: b.isPrimary ? '1.5px solid #7FE87F' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Landmark size={18} color="#7FE87F" />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>{b.bankName}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{b.accountNumberMasked}</div>
                    </div>
                  </div>
                  {b.isPrimary && <Check size={18} color="#7FE87F" />}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Change PIN Modal */}
      <Modal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} title={translateText('Change Payment PIN', language)}>
        {pinSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(127, 232, 127, 0.16)',
                color: '#7FE87F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <Check size={28} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>{translateText('Payment PIN Updated', language)}</h4>
          </div>
        ) : (
          <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {pinError && (
              <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: '#182236', border: '1px solid #FF4757', color: '#FF4757', fontSize: '12px', fontWeight: 700 }}>
                {pinError}
              </div>
            )}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                {translateText('Current 4-Digit PIN', language)}
              </label>
              <input
                type="password"
                maxLength={4}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: '#182236', color: '#FFFFFF', fontSize: '18px', textAlign: 'center', letterSpacing: '8px', outline: 'none', direction: 'ltr', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                {translateText('New 4-Digit PIN', language)}
              </label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: '#182236', color: '#FFFFFF', fontSize: '18px', textAlign: 'center', letterSpacing: '8px', outline: 'none', direction: 'ltr', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                {translateText('Confirm New PIN', language)}
              </label>
              <input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: '#182236', color: '#FFFFFF', fontSize: '18px', textAlign: 'center', letterSpacing: '8px', outline: 'none', direction: 'ltr', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              className="action-btn interactive-tap"
              style={{
                marginTop: '10px',
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: '#7FE87F',
                color: '#080c14',
                border: 'none',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(127, 232, 127, 0.22)',
              }}
            >
              {translateText('Update PIN', language)}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};


