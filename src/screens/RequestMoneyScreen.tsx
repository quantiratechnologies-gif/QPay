import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import { translateText } from '../utils/i18n';
import type { Contact } from '../types';
import {
  RequestRecipientPicker,
  RequestAmountCard,
  RequestSuccessView,
} from '../components/features/requests';

export interface RequestMoneyScreenProps {
  initialContacts?: Contact[];
}

export const RequestMoneyScreen: React.FC<RequestMoneyScreenProps> = ({ initialContacts }) => {
  const { contacts: appContextContacts, addMoneyRequest, language, t } = useApp();
  const contacts =
    initialContacts && initialContacts.length > 0 ? initialContacts : appContextContacts;
  const isAr = language === 'العربية' || language === 'ar';
  const [selectedContact, setSelectedContact] = useState<Contact>(
    contacts[0] || {
      id: 'c1',
      name: 'Sara Al-Mansoor',
      upiId: 'sara@sarie',
      avatarInitials: 'SM',
      mobile: '+966 55 876 5432',
    }
  );
  const [amountStr, setAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSendRequest = () => {
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) return;

    addMoneyRequest({
      name: selectedContact.name,
      upiId: selectedContact.upiId,
      amount,
      note: note || undefined,
    });

    setIsSuccess(true);
  };

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
      <AppHeader title={t('home.request_money', 'Request Money')} showBack />

      <div style={{ padding: '20px' }}>
        {isSuccess ? (
          <RequestSuccessView
            amountStr={amountStr}
            selectedContact={selectedContact}
            isAr={isAr}
            language={language}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <RequestRecipientPicker
              contacts={contacts}
              selectedContact={selectedContact}
              language={language}
              onSelectContact={setSelectedContact}
            />

            <RequestAmountCard
              amountStr={amountStr}
              note={note}
              isAr={isAr}
              language={language}
              onAmountChange={setAmountStr}
              onNoteChange={setNote}
            />

            <PrimaryButton
              onClick={handleSendRequest}
              disabled={!amountStr || parseFloat(amountStr) <= 0}
            >
              {translateText('Send Payment Request', language)}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};
