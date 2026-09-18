import React, { useState } from 'react';
import { Users, Check } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import { formatSaudiCurrency, translateText } from '../utils/i18n';
import type { Contact } from '../types';

export const SplitExpensesScreen: React.FC = () => {
  const { splitExpenses, createSplitExpense, markSplitMemberPaid, contacts, user, language, isRtl } = useApp();
  const isAr = language === 'العربية' || language === 'ar';

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

    // Also include self
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
        {/* Navigation Switcher: Active Splits vs Create New Split */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '20px',
          }}
        >
          <button
            onClick={() => setActiveTab('active')}
            className="interactive-tap"
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'active' ? 'var(--brand-green, #7FE87F)' : 'transparent',
              color: activeTab === 'active' ? 'var(--brand-green-ink, #080C14)' : '#A2A2BA',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isAr ? 'المصروفات المشتركة' : 'Active Splits'} ({splitExpenses.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className="interactive-tap"
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'create' ? 'var(--brand-green, #7FE87F)' : 'transparent',
              color: activeTab === 'create' ? 'var(--brand-green-ink, #080C14)' : '#A2A2BA',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            + {isAr ? 'تقسيم فاتورة جديدة' : 'New Split Bill'}
          </button>
        </div>

        {activeTab === 'create' ? (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Expense Title & Total Amount */}
            <div style={{ backgroundColor: 'var(--color-surface, #111726)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))', borderRadius: '16px', padding: '20px' }}>
              <label style={{ fontSize: '11px', color: '#A2A2BA', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                {isAr ? 'عنوان المصروف' : 'Expense Title'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isAr ? 'مثال: عشاء في مطعم، إيجار الشاليه، قهوة...' : 'e.g. Dinner, Chalet Rent, Groceries'}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  marginBottom: '16px',
                }}
              />

              <label style={{ fontSize: '11px', color: '#A2A2BA', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                {isAr ? 'إجمالي المبلغ' : 'Total Amount (SAR)'}
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--color-surface-elevated, #182236)',
                  border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
                  borderRadius: '14px',
                  padding: '12px 16px',
                }}
              >
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)', marginInlineEnd: '8px' }}>
                  {isAr ? 'ر.س' : 'SAR'}
                </span>
                <input
                  type="number"
                  value={totalAmountStr}
                  onChange={(e) => setTotalAmountStr(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '26px',
                    fontWeight: 900,
                    outline: 'none',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
              </div>
            </div>

            {/* Select Participants */}
            <div style={{ backgroundColor: 'var(--color-surface, #111726)', border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                    {isAr ? 'إضافة الأصدقاء للتقسيم' : 'Select Friends to Split With'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#A2A2BA', marginTop: '2px' }}>
                    {isAr ? `المحدد: ${selectedContactIds.length} أصدقاء + أنت` : `Selected: ${selectedContactIds.length} friends + You`}
                  </div>
                </div>
                {numTotal > 0 && selectedContactIds.length > 0 && (
                  <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                    <div style={{ fontSize: '11px', color: '#A2A2BA', fontWeight: 700 }}>{isAr ? 'نصيب الفرد' : 'Per Person'}</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
                      {formatSaudiCurrency(splitPerPerson, language)}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {contacts.map((c) => {
                  const isSelected = selectedContactIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => toggleContact(c.id)}
                      className="interactive-tap"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: isSelected ? 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))' : 'var(--color-surface-elevated, #182236)',
                        border: isSelected ? '1px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: isSelected ? 'var(--brand-green, #7FE87F)' : '#2A2F45',
                            color: isSelected ? '#080C14' : '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '14px',
                          }}
                        >
                          {c.avatarInitials}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{c.name}</div>
                          <div style={{ fontSize: '11.5px', color: '#A2A2BA' }}>{c.upiId}</div>
                        </div>
                      </div>

                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: isSelected ? 'var(--brand-green, #7FE87F)' : 'transparent',
                          border: isSelected ? 'none' : '2px solid #5A6075',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#080C14',
                        }}
                      >
                        {isSelected && <Check size={16} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <PrimaryButton
              onClick={handleCreateSplit}
              disabled={!title.trim() || numTotal <= 0 || selectedContactIds.length === 0}
            >
              <Users size={18} />{' '}
              {isCreatedSuccess
                ? (isAr ? '✓ تم إنشاء التقسيم بنجاح' : '✓ Split Created Successfully')
                : (isAr
                    ? `إرسال طلبات التقسيم (${formatSaudiCurrency(splitPerPerson, language)} لكل فرد)`
                    : `Send Split Requests (${formatSaudiCurrency(splitPerPerson, language)} / each)`)}
            </PrimaryButton>
          </div>
        ) : (
          /* Active Split Expenses View */
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
                  {isAr ? 'لا توجد مصروفات مشتركة نشطة' : 'No Active Split Expenses'}
                </div>
                <p style={{ fontSize: '13px', color: '#A2A2BA', marginTop: '6px' }}>
                  {isAr
                    ? 'يمكنك تقسيم الفواتير والمصاريف بسهولة مع الأصدقاء وإرسال طلبات سداد فورية.'
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
                  + {isAr ? 'إنشاء تقسيم جديد' : 'Create New Split'}
                </button>
              </div>
            ) : (
              splitExpenses.map((exp) => {
                const paidCount = exp.members.filter((m) => m.hasPaid).length;
                const totalMembers = exp.members.length;
                const progressPct = totalMembers > 0 ? (paidCount / totalMembers) * 100 : 0;

                return (
                  <div
                    key={exp.id}
                    style={{
                      backgroundColor: 'var(--color-surface, #111726)',
                      border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                      borderRadius: '18px',
                      padding: '20px',
                    }}
                  >
                    {/* Header: Title, Status and Total */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>{exp.title}</span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: exp.status === 'settled' ? 'rgba(127, 232, 127, 0.16)' : 'rgba(245, 158, 11, 0.16)',
                              color: exp.status === 'settled' ? '#7FE87F' : '#F59E0B',
                              textTransform: 'uppercase',
                            }}
                          >
                            {exp.status === 'settled' ? (isAr ? 'مكتمل ومسدد' : 'Settled') : (isAr ? 'قيد السداد' : 'In Progress')}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#A2A2BA', marginTop: '2px' }}>
                          {exp.date} • {isAr ? `${paidCount} من ${totalMembers} تم الدفع` : `${paidCount} of ${totalMembers} Paid`}
                        </div>
                      </div>

                      <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-green, #7FE87F)' }}>
                        {formatSaudiCurrency(exp.totalAmount, language)}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-surface-elevated, #182236)', borderRadius: '999px', overflow: 'hidden', marginBottom: '16px' }}>
                      <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: 'var(--brand-green, #7FE87F)', borderRadius: '999px', transition: 'width 0.3s ease' }} />
                    </div>

                    {/* Members List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {exp.members.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            backgroundColor: 'var(--color-surface-elevated, #182236)',
                            borderRadius: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: m.hasPaid ? 'rgba(127, 232, 127, 0.18)' : '#2C2C44',
                                color: m.hasPaid ? '#7FE87F' : '#A2A2BA',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '12px',
                              }}
                            >
                              {m.avatarInitials}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{m.name}</div>
                              <div style={{ fontSize: '11px', color: '#8E9BAE' }}>{m.upiId}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                              {formatSaudiCurrency(m.amount, language)}
                            </span>
                            {m.hasPaid ? (
                              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)', backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))', padding: '2px 8px', borderRadius: '6px' }}>
                                ✓ {isAr ? 'مسدد' : 'Paid'}
                              </span>
                            ) : (
                              <button
                                onClick={() => markSplitMemberPaid(exp.id, m.id)}
                                className="interactive-tap"
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  color: '#080C14',
                                  backgroundColor: 'var(--brand-green, #7FE87F)',
                                  border: 'none',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                }}
                              >
                                {isAr ? 'تأكيد السداد' : 'Mark Paid'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
