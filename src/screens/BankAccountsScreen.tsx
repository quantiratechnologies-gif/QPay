import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Star,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { SamaLogo } from '../components/SamaLogo';
import { Modal } from '../components/Modal';
import { useApp } from '../state/AppContext';
import { formatCurrency } from '../utils/formatters';

export const BankAccountsScreen: React.FC = () => {
  const {
    bankAccounts,
    toggleShowBalance,
    setPrimaryBank,
    removeBankAccount,
    setIsAddBankModalOpen,
    openPinModal,
    t,
    language,
  } = useApp();

  const [bankToRemove, setBankToRemove] = useState<string | null>(null);
  const [bankForPin, setBankForPin] = useState<string | null>(null);
  const [newBankPin, setNewBankPin] = useState('');
  const [confirmBankPin, setConfirmBankPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (newBankPin.length !== 4) {
      setPinError(language === 'العربية' ? 'يجب أن يتكون الرمز من ٤ أرقام' : 'PIN must be 4 digits');
      return;
    }
    if (newBankPin !== confirmBankPin) {
      setPinError(language === 'العربية' ? 'الرمز الجديد وتأكيد الرمز غير متطابقين' : 'PINs do not match');
      return;
    }

    setPinSuccess(true);
    setTimeout(() => {
      setPinSuccess(false);
      setBankForPin(null);
      setNewBankPin('');
      setConfirmBankPin('');
    }, 1200);
  };

  const confirmRemove = () => {
    if (bankToRemove) {
      removeBankAccount(bankToRemove);
      setBankToRemove(null);
    }
  };

  const handleBalanceCheck = (bank: typeof bankAccounts[0]) => {
    const displayBankName = t(bank.bankName, bank.bankName);
    const displayAccType = t(bank.accountType, bank.accountType);

    if (bank.showBalance) {
      toggleShowBalance(bank.id);
    } else {
      openPinModal({
        title: `${t('banks.check_balance', 'Check Balance')} - ${displayBankName}`,
        subTitle: `${displayAccType} • ${bank.accountNumberMasked}`,
        amount: bank.balance,
        onSuccess: () => toggleShowBalance(bank.id),
      });
    }
  };

  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#07090E',
        minHeight: '100%',
        paddingBottom: '96px',
        color: '#F3F6F9',
      }}
    >
      <AppHeader title={t('banks.title', 'Bank Accounts')} showBack showSettings />

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Overview Hero Banner */}
        <section
          style={{
            background: 'linear-gradient(135deg, rgba(20, 64, 42, 0.45) 0%, rgba(10, 15, 24, 0.95) 100%)',
            border: '1px solid rgba(127, 232, 127, 0.22)',
            borderRadius: '24px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div
                style={{
                  background: 'rgba(127, 232, 127, 0.12)',
                  border: '1px solid rgba(127, 232, 127, 0.25)',
                  color: '#7FE87F',
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Landmark size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#F3F6F9', marginBottom: '2px' }}>
                  {t('banks.linked', 'Linked Saudi Accounts')}
                </h2>
                <div style={{ fontSize: '10px', color: '#8A9BB0', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {language === 'العربية' ? 'شبكة مالية موثقة' : 'SECURE FINANCIAL NETWORK'}
                </div>
              </div>
            </div>

            <span
              style={{
                background: 'rgba(127, 232, 127, 0.12)',
                color: '#7FE87F',
                fontSize: '10.5px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '20px',
                letterSpacing: '0.04em',
                border: '1px solid rgba(127, 232, 127, 0.25)',
              }}
            >
              {language === 'العربية' ? `${bankAccounts.length} نشطة` : `${bankAccounts.length} ACTIVE`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8A9BB0', fontWeight: 500 }}>
            <Zap size={14} color="#7FE87F" />
            <span>{language === 'العربية' ? 'محمي عبر البنية التحتية لسريع' : 'Sarie Instant Rails Secured'}</span>
          </div>

          <button
            onClick={() => setIsAddBankModalOpen(true)}
            className="interactive-tap"
            style={{
              background: '#7FE87F',
              color: '#04120A',
              border: 'none',
              fontWeight: 800,
              padding: '13px',
              borderRadius: '14px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '13px',
              letterSpacing: '-0.1px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(127, 232, 127, 0.25)',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{t('banks.add_bank', 'Add Bank Account')}</span>
          </button>
        </section>

        {/* Accounts List Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {bankAccounts.length === 0 ? (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(14, 38, 26, 0.35) 0%, rgba(10, 15, 24, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '22px',
                padding: '36px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(127, 232, 127, 0.12)',
                  color: '#7FE87F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Landmark size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F3F6F9' }}>
                  {language === 'العربية' ? 'لا توجد حسابات بنكية مرتبطة بعد' : 'No bank accounts linked yet'}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#8A9BB0', marginTop: '4px', maxWidth: '280px' }}>
                  {language === 'العربية'
                    ? 'اربط حسابك البنكي السعودي للبدء في إرسال واستلام الأموال فورياً عبر سريع.'
                    : 'Link your Saudi bank account to start sending and receiving instant payments via Sarie.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddBankModalOpen(true)}
                className="interactive-tap"
                style={{
                  background: 'rgba(127, 232, 127, 0.12)',
                  border: '1px solid rgba(127, 232, 127, 0.3)',
                  color: '#7FE87F',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  marginTop: '6px',
                }}
              >
                + {t('banks.add_bank', 'Link Bank Account')}
              </button>
            </div>
          ) : (
            bankAccounts.map((bank) => {
              const rawNumbers = bank.accountNumberMasked.replace(/[^0-9]/g, '') || '034821';
              const lastDigits = rawNumbers.slice(-6);
              const displayBankName = t(bank.bankName, bank.bankName);
              const displayAccType = t(bank.accountType, bank.accountType);

              return (
                <article
                  key={bank.id}
                  style={{
                    background: bank.isPrimary
                      ? 'linear-gradient(135deg, rgba(20, 64, 42, 0.75) 0%, rgba(11, 20, 32, 0.96) 100%)'
                      : 'linear-gradient(135deg, rgba(14, 38, 26, 0.5) 0%, rgba(10, 15, 24, 0.92) 100%)',
                    border: bank.isPrimary
                      ? '1px solid rgba(127, 232, 127, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '22px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.35)',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div
                        style={{
                          background: 'rgba(127, 232, 127, 0.12)',
                          border: '1px solid rgba(127, 232, 127, 0.25)',
                          color: '#7FE87F',
                          width: '38px',
                          height: '38px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Landmark size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#F3F6F9', letterSpacing: '-0.1px', margin: 0 }}>
                          {displayBankName}
                        </h3>
                        <div style={{ fontSize: '10px', color: '#8A9BB0', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '1px' }}>
                          {displayAccType}
                        </div>
                      </div>
                    </div>

                    {bank.isPrimary && (
                      <span
                        style={{
                          background: 'rgba(127, 232, 127, 0.12)',
                          color: '#7FE87F',
                          fontSize: '9.5px',
                          fontWeight: 800,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(127, 232, 127, 0.25)',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {t('banks.primary', 'PRIMARY')}
                      </span>
                    )}
                  </div>

                  {/* Account Digits */}
                  <div style={{ fontSize: '13px', letterSpacing: '2px', color: '#8A9BB0', fontWeight: 500, direction: 'ltr' }}>
                    <span>•••• &nbsp; •••• &nbsp; •••• &nbsp; </span>
                    <strong style={{ color: '#F3F6F9', fontWeight: 700 }}>{lastDigits}</strong>
                  </div>

                  {/* Balance Section Module */}
                  <div
                    style={{
                      background: 'rgba(4, 8, 14, 0.55)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '9px',
                          color: '#52637A',
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          marginBottom: '3px',
                          display: 'block',
                        }}
                      >
                        {t('home.total_balance', 'TOTAL AVAILABLE BALANCE')}
                      </span>
                      <div
                        className="tabular-nums"
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 800,
                          color: '#7FE87F',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {bank.showBalance ? formatCurrency(bank.balance, language) : (language === 'العربية' ? '•••••••• ر.س' : 'SAR ••••••••')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleBalanceCheck(bank)}
                      className="interactive-tap"
                      style={{
                        background: 'rgba(127, 232, 127, 0.08)',
                        border: '1px solid rgba(127, 232, 127, 0.2)',
                        color: '#7FE87F',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '7px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'background 0.2s',
                      }}
                    >
                      {bank.showBalance ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{bank.showBalance ? t('home.hide', 'Hide') : t('banks.check_balance', 'Check')}</span>
                    </button>
                  </div>

                  {/* Card Footer Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
                    {bank.isPrimary ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#7FE87F', fontWeight: 600 }}>
                          <CheckCircle2 size={14} color="#7FE87F" />
                          <span>{language === 'العربية' ? 'الحساب الافتراضي للاستلام' : 'Default for receiving money'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setBankForPin(bank.id)}
                            className="interactive-tap"
                            style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#F3F6F9',
                              padding: '7px 12px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <span>{language === 'العربية' ? 'تعيين الرمز' : 'Set PIN'}</span>
                          </button>
                          <button
                            onClick={() => setBankToRemove(bank.id)}
                            className="interactive-tap"
                            style={{
                              background: 'rgba(255, 75, 75, 0.06)',
                              border: '1px solid rgba(255, 75, 75, 0.18)',
                              color: '#FF5C5C',
                              padding: '7px 12px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Trash2 size={12} />
                            <span>{language === 'العربية' ? 'حذف' : 'Remove'}</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <button
                          onClick={() => setPrimaryBank(bank.id)}
                          className="interactive-tap"
                          style={{
                            background: 'rgba(127, 232, 127, 0.12)',
                            border: '1px solid rgba(127, 232, 127, 0.25)',
                            color: '#7FE87F',
                            flex: 1.5,
                            padding: '9px 12px',
                            borderRadius: '10px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                          }}
                        >
                          <Star size={13} color="#7FE87F" />
                          <span>{language === 'العربية' ? 'تعيين كأساسي' : 'Set Primary'}</span>
                        </button>
                        <button
                          onClick={() => setBankForPin(bank.id)}
                          className="interactive-tap"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#F3F6F9',
                            flex: 1,
                            padding: '9px 12px',
                            borderRadius: '10px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span>{language === 'العربية' ? 'تعيين الرمز' : 'Set PIN'}</span>
                        </button>
                        <button
                          onClick={() => setBankToRemove(bank.id)}
                          className="interactive-tap"
                          style={{
                            background: 'rgba(255, 75, 75, 0.06)',
                            border: '1px solid rgba(255, 75, 75, 0.18)',
                            color: '#FF5C5C',
                            flex: 1,
                            padding: '9px 12px',
                            borderRadius: '10px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                        >
                          <Trash2 size={12} />
                          <span>{language === 'العربية' ? 'حذف' : 'Remove'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* SAMA Trust Footer */}
        <div
          style={{
            marginTop: '8px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
          }}
        >
          <SamaLogo height={12} themeMode="green" />
          <span style={{ fontSize: '11px', color: '#8A9BB0', fontWeight: 600 }}>
            &bull; {language === 'العربية' ? 'مدفوعات فورية آمنة خاضعة لإشراف البنك المركزي السعودي (ساما)' : 'Secured under Saudi Central Bank (SAMA) Regulations'}
          </span>
        </div>
      </div>

      {/* Bank PIN Setup Modal */}
      <Modal
        isOpen={Boolean(bankForPin)}
        onClose={() => {
          setBankForPin(null);
          setNewBankPin('');
          setConfirmBankPin('');
          setPinError('');
          setPinSuccess(false);
        }}
        title={language === 'العربية' ? 'تعيين الرمز السري للبنك' : 'Set Bank PIN'}
      >
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
              <CheckCircle2 size={28} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>{language === 'العربية' ? 'تم تعيين الرمز بنجاح' : 'PIN Set Successfully'}</h4>
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
                {language === 'العربية' ? 'الرمز الجديد (٤ أرقام)' : 'New 4-Digit PIN'}
              </label>
              <input
                type="password"
                maxLength={4}
                value={newBankPin}
                onChange={(e) => setNewBankPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: '#182236', color: '#FFFFFF', fontSize: '18px', textAlign: 'center', letterSpacing: '8px', outline: 'none', direction: 'ltr', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                {language === 'العربية' ? 'تأكيد الرمز' : 'Confirm PIN'}
              </label>
              <input
                type="password"
                maxLength={4}
                value={confirmBankPin}
                onChange={(e) => setConfirmBankPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: '#182236', color: '#FFFFFF', fontSize: '18px', textAlign: 'center', letterSpacing: '8px', outline: 'none', direction: 'ltr', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              className="interactive-tap"
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '8px',
                backgroundColor: '#7FE87F',
                color: '#080C14',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {language === 'العربية' ? 'حفظ الرمز السري' : 'Save PIN'}
            </button>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      {bankToRemove && (
        <Modal
          isOpen={Boolean(bankToRemove)}
          onClose={() => setBankToRemove(null)}
          title={language === 'العربية' ? 'إلغاء ربط الحساب البنكي' : 'Remove Bank Account'}
        >
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ color: '#8A9BB0', fontSize: '13.5px', marginBottom: '20px', lineHeight: '20px' }}>
              {language === 'العربية'
                ? 'هل أنت متأكد من رغبتك في إلغاء ربط هذا الحساب البنكي من كيو تي باي؟'
                : 'Are you sure you want to unlink this bank account from QTPay?'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setBankToRemove(null)}
                className="interactive-tap"
                style={{
                  flex: 1,
                  backgroundColor: '#182236',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {t('btn.cancel', 'Cancel')}
              </button>
              <button
                onClick={confirmRemove}
                className="interactive-tap"
                style={{
                  flex: 1,
                  backgroundColor: '#FF4757',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {language === 'العربية' ? 'تأكيد الحذف' : 'Unlink Account'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
