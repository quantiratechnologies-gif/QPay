import React, { useState, useRef } from 'react';
import { Landmark } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { useApp } from '../state/AppContext';
import { cleanSaudiIban } from '../utils/formatters';
import {
  BankSelectionStep,
  BankAuthorizeStep,
  SAUDI_MADA_BINS,
} from '../components/features/banking';
import type { MatchMethod, BankStep } from '../components/features/banking';

export const AddBankModal: React.FC = () => {
  const { isAddBankModalOpen, setIsAddBankModalOpen, addBankAccount, user, t, language, isRtl } = useApp();
  const isAr = language === '???????' || language === 'ar';

  const [step, setStep] = useState<BankStep>('SELECT_AND_MATCH');
  const [selectedBank, setSelectedBank] = useState<string>('Al Rajhi Bank');
  const [matchMethod, setMatchMethod] = useState<MatchMethod>('mobile');
  const [customIban, setCustomIban] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleClose = () => {
    if (isLoading) return;
    setIsAddBankModalOpen(false);
    setTimeout(() => {
      setStep('SELECT_AND_MATCH');
      setIsAuthorized(false);
      setErrorMessage('');
    }, 300);
  };

  const handleRequestOtp = () => {
    if (matchMethod === 'iban') {
      const cleanIban = cleanSaudiIban(customIban);
      if (!cleanIban || cleanIban.length === 0) {
        setErrorMessage(
          isAr
            ? '???? ????? ??? ??????? ??????? (SA...)'
            : 'Please enter a Saudi IBAN (starting with SA).'
        );
        return;
      }
      if (!cleanIban.startsWith('SA')) {
        setErrorMessage(
          isAr
            ? '???? ????? ??????? ???????: ??? ?? ???? ??? ??????? ?? SA'
            : 'SAMA Restriction: Saudi IBAN must start with SA.'
        );
        return;
      }
      if (cleanIban.length !== 24) {
        setErrorMessage(
          isAr
            ? `???? ??????? ???????: ??? ?? ????? ??????? ?? ?? ???? ?????? (??????: ${cleanIban.length} ????)`
            : `Saudi Banking Restriction: Saudi IBAN must be exactly 24 characters (Entered: ${cleanIban.length}).`
        );
        return;
      }
      if (!/^SA\d{2}[A-Z0-9]{20}$/.test(cleanIban)) {
        setErrorMessage(
          isAr
            ? '???? ??????? ??? ?????? ??????? ?????? ????????'
            : 'Invalid Saudi IBAN format for selected bank.'
        );
        return;
      }
    } else if (matchMethod === 'mobile') {
      const cleanMobile = user.mobile.replace(/\D/g, '');
      if (!cleanMobile.startsWith('9665') && !cleanMobile.startsWith('05') && !cleanMobile.startsWith('5')) {
        setErrorMessage(
          isAr
            ? '???? ?????: ??? ?????? ??? ?? ???? ??? ????? ???? ???? ?? 05'
            : 'Restriction: Mobile number must be a valid Saudi number starting with 05.'
        );
        return;
      }
    } else if (matchMethod === 'card') {
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 16) {
        setErrorMessage(
          isAr
            ? '???? ????? ??? ????? ??? ???? ?? ?? ?????'
            : 'Please enter a valid 16-digit card number.'
        );
        return;
      }
      const isMada = SAUDI_MADA_BINS.some((b) => cleanCard.startsWith(b));
      if (!isMada) {
        setErrorMessage(
          isAr
            ? '?????? ????? ??? ??????? ??? ??????? ?????? ???????? ???????? ?? ???? (SAMA).'
            : 'Unsupported card. Only Saudi mada cards and SAMA-regulated bank cards are accepted.'
        );
        return;
      }
    }
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAuthorized(false);
      setStep('AUTHORIZE_AND_CONNECT');
    }, 400);
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    
    // Handle paste or autofill
    if (cleanVal.length > 1) {
      const digits = cleanVal.slice(0, 4).split('');
      const newDigits = [...otpDigits];
      digits.forEach((d, i) => {
        if (i < 4) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(digits.length, 3);
      otpInputRefs[nextIndex].current?.focus();
      return;
    }

    // Handle single character typed
    const singleVal = cleanVal.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = singleVal;
    setOtpDigits(newDigits);

    if (singleVal && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const isOtpComplete = otpDigits.every((digit) => digit.length > 0);

  const handleVerifyOtpAndLink = async () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 4) {
      setErrorMessage(
        isAr
          ? 'يرجى إدخال رمز الأمان المكون من ٤ أرقام.'
          : 'Please enter the 4-digit verification code.'
      );
      return;
    }

    if (fullOtp !== '4829') {
      setErrorMessage(
        isAr
          ? 'رمز الأمان البنكي غير صحيح. (رمز العرض: 4829)'
          : 'Incorrect Bank OTP code. (Demo OTP: 4829)'
      );
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const generatedIban =
      matchMethod === 'iban' && customIban
        ? customIban.toUpperCase()
        : `SA${Math.floor(10 + Math.random() * 89)} •••• ${Math.floor(1000 + Math.random() * 9000)}`;

    const matchedValue =
      matchMethod === 'mobile'
        ? user.mobile
        : matchMethod === 'card'
        ? `mada •••• ${cardNumber.replace(/\s+/g, '').slice(-4)}`
        : generatedIban;

    await addBankAccount(selectedBank, {
      iban: generatedIban,
      accountType: matchMethod === 'card' ? 'mada Debit Card' : 'Primary Account',
      matchedWith: matchedValue,
    });

    setIsLoading(false);
    setIsAuthorized(true);
  };

  return (
    <BottomSheet
      isOpen={isAddBankModalOpen}
      onClose={handleClose}
      title={isAr ? '??? ?????? ??????' : 'Link Bank Account'}
    >
      <div style={{ paddingBottom: '8px' }}>
        {/* Header Bank Identity Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(127, 232, 127, 0.14)',
              border: '1px solid rgba(127, 232, 127, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Landmark size={20} color="#7FE87F" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              {isAr ? '???? ?????' : 'Select Bank'}
            </h3>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500, marginTop: '2px', display: 'block' }}>
              {isAr ? '??? ???? ??? ???? ????' : 'Instant linking with Sarie'}
            </span>
          </div>
        </div>

        {step === 'SELECT_AND_MATCH' && (
          <BankSelectionStep
            selectedBank={selectedBank}
            onSelectBank={setSelectedBank}
            matchMethod={matchMethod}
            onSelectMatchMethod={setMatchMethod}
            userMobile={user.mobile}
            cardNumber={cardNumber}
            onCardNumberChange={setCardNumber}
            cardExpiry={cardExpiry}
            onCardExpiryChange={setCardExpiry}
            cardCvv={cardCvv}
            onCardCvvChange={setCardCvv}
            customIban={customIban}
            onCustomIbanChange={setCustomIban}
            errorMessage={errorMessage}
            isLoading={isLoading}
            onRequestOtp={handleRequestOtp}
            isAr={isAr}
            isRtl={isRtl}
            t={t}
          />
        )}

        {step === 'AUTHORIZE_AND_CONNECT' && (
          <BankAuthorizeStep
            selectedBank={selectedBank}
            isAuthorized={isAuthorized}
            otpDigits={otpDigits}
            otpInputRefs={otpInputRefs}
            onOtpChange={handleOtpChange}
            onOtpKeyDown={handleOtpKeyDown}
            onVerifyAndLink={handleVerifyOtpAndLink}
            onBackToSelection={() => setStep('SELECT_AND_MATCH')}
            onClose={handleClose}
            errorMessage={errorMessage}
            isLoading={isLoading}
            userAlias={user.upiId}
            isAr={isAr}
            isRtl={isRtl}
            t={t}
          />
        )}
      </div>
    </BottomSheet>
  );
};
export default AddBankModal;
