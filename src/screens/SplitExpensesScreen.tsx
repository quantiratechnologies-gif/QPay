import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { translateText } from '../utils/i18n';
import type { Contact } from '../types';
import {
  SplitTabs,
  ActiveSplitCard,
  CreateSplitForm,
} from '../components/features/split';

export const SplitExpensesScreen: React.FC = () => {
  const { splitExpenses, createSplitExpense, markSplitMemberPaid, contacts, user, language, isRtl } = useApp();
  const isAr = language === '???????' || language === 'ar';

  const [activeTab, setActiveTab] = useState<'active' | 'create'>('active');
  const [title, setTitle] = useState('');
  const [totalAmountStr, setTotalAmountStr] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isCreatedSuccess, setIsCreatedSuccess] = useState(false);

  const numTotal = parseFloat(totalAmountStr) || 0;
  const participantCount = selectedContactIds.length + 1; // Selected contacts + user self
  const splitPerPerson = numTotal > 0 && participantCount > 0 ? numTotal / participantCount : 0;

  const toggleContact = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const handleCreateSplit = () => {
    if (!title.trim() || numTotal <= 0 || selectedContactIds.length === 0) return;

    const selectedMembers = selectedContactIds.map((cId) => {
      const contact = contacts.find((c) => c.id === cId) || {
        id: cId,
        name: 'Friend',
        upiId: 'friend@sarie',
        mobile: '+966 50 000 0000',
        avatarInitials: 'FR',
      };
      return { contact, amount: splitPerPerson };
    });

    const selfContact: Contact = {
      id: 'self',
      name: `${user.name} (${translateText('You', language)})`,
      upiId: user.upiId,
      mobile: user.mobile,
      avatarInitials: user.avatarInitials,
    };
    selectedMembers.push({ contact: selfContact, amount: splitPerPerson });

    createSplitExpense({
      title,
      totalAmount: numTotal,
      members: selectedMembers,
    });

    setIsCreatedSuccess(true);
    setTimeout(() => {
      setIsCreatedSuccess(false);
      setTitle('');
      setTotalAmountStr('');
      setSelectedContactIds([]);
      setActiveTab('active');
    }, 1200);
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#080c14', minHeight: '100%', paddingBottom: '96px', color: '#FFFFFF' }}>
      <AppHeader title={translateText('Split Expenses', language)} showBack />

      <div style={{ padding: '20px' }}>
        <SplitTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          splitsCount={splitExpenses.length}
          isAr={isAr}
        />

        {activeTab === 'create' ? (
          <CreateSplitForm
            title={title}
            onTitleChange={setTitle}
            totalAmountStr={totalAmountStr}
            onTotalAmountChange={setTotalAmountStr}
            contacts={contacts}
            selectedContactIds={selectedContactIds}
            onToggleContact={toggleContact}
            splitPerPerson={splitPerPerson}
            isCreatedSuccess={isCreatedSuccess}
            onSubmit={handleCreateSplit}
            language={language}
            isAr={isAr}
            isRtl={isRtl}
          />
        ) : (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {splitExpenses.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  backgroundColor: 'var(--color-surface, #111726)',
                  borderRadius: '16px',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                  padding: '48px 24px',
                }}
              >
                <Users size={36} color="var(--brand-green, #7FE87F)" style={{ margin: '0 auto 12px auto' }} />
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
                  {isAr ? '?? ???? ??????? ?????? ????' : 'No Active Split Expenses'}
                </div>
                <p style={{ fontSize: '13px', color: '#A2A2BA', marginTop: '6px' }}>
                  {isAr
                    ? '????? ????? ???????? ????????? ?????? ?? ???????? ?????? ????? ???? ?????.'
                    : 'Easily split bills with friends and send real-time Sarie payment requests.'}
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="interactive-tap"
                  style={{
                    marginTop: '16px',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--brand-green, #7FE87F)',
                    color: '#080C14',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  + {isAr ? '????? ????? ????' : 'Create New Split'}
                </button>
              </div>
            ) : (
              splitExpenses.map((exp) => (
                <ActiveSplitCard
                  key={exp.id}
                  expense={exp}
                  onMarkPaid={markSplitMemberPaid}
                  language={language}
                  isAr={isAr}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default SplitExpensesScreen;
