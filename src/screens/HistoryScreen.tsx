import React, { useState } from 'react';
import { Search, X, Receipt, ShieldAlert, CheckCircle2, Clock, AlertTriangle, ArrowRight, Download, FileText } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { TransactionRow } from '../components/TransactionRow';
import { BottomSheet } from '../components/BottomSheet';
import { SamaLogo } from '../components/SamaLogo';
import { useApp } from '../state/AppContext';
import { formatCurrency } from '../utils/formatters';
import type { Transaction } from '../types';

import { pdfGenerator } from '../utils/pdfGenerator';

type FilterType = 'all' | 'sent' | 'received' | 'pending';

export const HistoryScreen: React.FC = () => {
  const { transactions, t, isRtl, language, user, bankAccounts } = useApp();
  const isAr = language === 'العربية' || language === 'ar';
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isDisputing, setIsDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Duplicate Charge');
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);
  const [statementSuccess, setStatementSuccess] = useState(false);

  const handleDownloadStatement = () => {
    const primaryAccount = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0];
    const iban = primaryAccount?.iban || 'SA03 8000 0000 6080 1014 4821';
    const bankName = primaryAccount?.bankName || 'Al Rajhi Bank';
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const rowsHtml = filteredTransactions
      .map(
        (txn) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-size: 13px;">${txn.date || 'TODAY'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-size: 13px; font-family: monospace;">${txn.utr}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-size: 13px; font-weight: 600;">${txn.title}<br/><span style="font-size: 11px; color: #6B7280;">${txn.subTitle || ''}</span></td>
          <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-size: 13px; text-transform: uppercase;">${txn.type}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-size: 13px; font-weight: bold; text-align: right; color: ${txn.type === 'received' ? '#059669' : '#111827'};">
            ${txn.type === 'received' ? '+' : '-'} SAR ${txn.amount.toFixed(2)}
          </td>
        </tr>`
      )
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>QTPay SAMA Statement - ${dateStr}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px; color: #111827; background: #fff; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #10B981; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: 800; color: #065F46; }
    .meta { font-size: 12px; color: #4B5563; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; background: #F9FAFB; padding: 16px; border-radius: 8px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #F3F4F6; padding: 10px; text-align: left; font-size: 12px; font-weight: 700; color: #374151; border-bottom: 1px solid #D1D5DB; }
    .footer { margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 16px; font-size: 11px; color: #9CA3AF; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">QTPay • SAMA Statement</div>
      <div class="meta">Saudi Arabian Monetary Authority (SAMA) Sarie IPS Clearing</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold; font-size: 14px;">Official Account Statement</div>
      <div class="meta">Issued on: ${dateStr}</div>
    </div>
  </div>

  <div class="grid">
    <div>
      <div><strong>Account Holder:</strong> ${user?.name || 'Authorized Customer'}</div>
      <div><strong>Linked Mobile:</strong> ${user?.phone || '+966 50 123 4567'}</div>
    </div>
    <div>
      <div><strong>Primary Bank:</strong> ${bankName}</div>
      <div><strong>IBAN:</strong> ${iban}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Sarie UTR Ref</th>
        <th>Description / Beneficiary</th>
        <th>Type</th>
        <th style="text-align: right;">Amount (SAR)</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer">
    This is an electronically generated statement certified by QTPay Financial Systems compliant with Saudi Central Bank (SAMA) Fast Payment Network (Sarie) Regulations.
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QTPay_Statement_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStatementSuccess(true);
    setTimeout(() => setStatementSuccess(false), 3000);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'sent'
        ? t.type === 'sent'
        : filter === 'received'
        ? t.type === 'received'
        : t.type === 'pending';

    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.subTitle && t.subTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.utr.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const groupedByDate: Record<string, typeof transactions> = {};
  filteredTransactions.forEach((t) => {
    const key = t.date || 'TODAY';
    if (!groupedByDate[key]) groupedByDate[key] = [];
    groupedByDate[key].push(t);
  });

  const getFilterLabel = (f: FilterType) => {
    if (isAr) {
      if (f === 'all') return 'الكل';
      if (f === 'sent') return 'المدفوعات';
      if (f === 'received') return 'المستلمة';
      if (f === 'pending') return 'قيد الانتظار';
    }
    return f;
  };

  const handleDownloadStatement = () => {
    pdfGenerator.downloadHistoryPdf(filteredTransactions, user.name, 'SA03 •••• 4821', isAr);
    setDownloadSuccessToast(true);
    setTimeout(() => setDownloadSuccessToast(false), 3000);
  };

  const handleOpenReceipt = (txn: Transaction) => {
    setSelectedTxn(txn);
    setIsDisputing(false);
    setDisputeSubmitted(false);
  };

  const handleCloseModal = () => {
    setSelectedTxn(null);
    setIsDisputing(false);
    setDisputeSubmitted(false);
  };

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    setDisputeSubmitted(true);
  };

  return (
    <div className="fade-in" style={{ backgroundColor: '#080c14', minHeight: '100%', paddingBottom: '96px', color: '#FFFFFF' }}>
      <AppHeader
        title={t('history.title', 'Transactions')}
        showSearch
        onSearchClick={() => setShowSearchInput(!showSearchInput)}
        showSettings
      />

      {/* Download Toast */}
      {downloadSuccessToast && (
        <div
          className="fade-in"
          style={{
            margin: '0 20px 14px 20px',
            backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.16))',
            border: '1px solid var(--brand-green, #7FE87F)',
            borderRadius: '12px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--brand-green, #7FE87F)',
            fontSize: '12.5px',
            fontWeight: 800,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{isAr ? 'تم إنشاء وتحميل كشف الحساب بنجاح (PDF)' : 'Statement generated & downloaded successfully (PDF)'}</span>
        </div>
      )}

      {showSearchInput && (
        <div style={{ padding: '0 20px', marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--color-surface, #111726)',
              border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
              borderRadius: '14px',
              padding: '11px 14px',
            }}
          >
            <Search size={16} color="var(--brand-green, #7FE87F)" />
            <input
              type="text"
              placeholder={isAr ? 'البحث بالاسم أو المرجع البنكي (SARIE UTR)...' : 'Search by name or SARIE UTR...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                width: '100%',
                textAlign: isRtl ? 'right' : 'left',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs / Chips & Statement Download Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px',
          marginBottom: '18px',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            flex: 1,
          }}
        >
          {(['all', 'sent', 'received', 'pending'] as FilterType[]).map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="interactive-tap"
                style={{
                  backgroundColor: isActive ? 'var(--brand-green, #7FE87F)' : 'var(--color-surface, #111726)',
                  border: isActive ? '1px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                  color: isActive ? 'var(--brand-green-ink, #080C14)' : '#9ca3af',
                  borderRadius: '20px',
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {getFilterLabel(f)}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleDownloadStatement}
          className="interactive-tap"
          title="Download Statement"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid rgba(127, 232, 127, 0.3)',
            color: 'var(--brand-green, #7FE87F)',
            borderRadius: '20px',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Download size={14} />
          <span>{isAr ? 'كشف الحساب' : 'Statement'}</span>
        </button>
      </div>

      {statementSuccess && (
        <div
          style={{
            margin: '0 20px 16px 20px',
            backgroundColor: 'var(--brand-green, #7FE87F)',
            color: 'var(--brand-green-ink, #080C14)',
            padding: '10px 16px',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{isAr ? 'تم تنزيل كشف الحساب المعتمد بنجاح' : 'SAMA Statement downloaded successfully'}</span>
        </div>
      )}

      {/* Grouped Transaction Lists */}
      <div style={{ padding: '0 20px', marginBottom: '24px' }}>
        {Object.keys(groupedByDate).length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              backgroundColor: 'var(--color-surface, #111726)',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              borderRadius: '20px',
              padding: '40px 20px',
              color: '#9ca3af',
              boxShadow: 'none',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-surface-elevated, #182236)',
                color: 'var(--brand-green, #7FE87F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <Receipt size={24} />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
              {isAr ? 'لا توجد عمليات' : 'No transactions'}
            </div>
            <div style={{ fontSize: '13px', marginTop: '4px', color: '#9ca3af' }}>
              {isAr ? 'جرّب تعديل البحث أو الفلاتر' : 'Try adjusting your search or filters'}
            </div>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateLabel, items]) => (
            <div key={dateLabel} style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#9ca3af',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  marginInlineStart: '4px',
                }}
              >
                {t(dateLabel, dateLabel)}
              </div>
              <div
                style={{
                  backgroundColor: 'var(--color-surface, #111726)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  padding: 0,
                  boxShadow: 'none',
                }}
              >
                {items.map((txn, idx) => (
                  <TransactionRow
                    key={txn.id}
                    transaction={txn}
                    isLast={idx === items.length - 1}
                    onClick={() => handleOpenReceipt(txn)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transaction Details & Dispute Modal */}
      {selectedTxn && (
        <BottomSheet
          isOpen={Boolean(selectedTxn)}
          onClose={handleCloseModal}
          title={isAr ? 'إيصال العملية' : 'Receipt'}
        >
          <div style={{ paddingBottom: '12px' }}>
            {!isDisputing ? (
              <div>
                {/* Status Hero */}
                <div style={{ textAlign: 'center', padding: '10px 0 18px 0' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto',
                    }}
                  >
                    <CheckCircle2 size={28} color="var(--brand-green, #7FE87F)" />
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '26px', fontWeight: 900, color: '#FFFFFF' }}>
                    {selectedTxn.type === 'received' ? '+' : '-'}{formatCurrency(selectedTxn.amount, language)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--brand-green, #7FE87F)', fontWeight: 700, marginTop: '3px' }}>
                    {isAr ? 'عملية مكتملة' : 'Transfer Complete'}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-elevated, #182236)',
                    borderRadius: '16px',
                    border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                    padding: '16px',
                    marginBottom: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{selectedTxn.type === 'received' ? (isAr ? 'من' : 'From') : (isAr ? 'إلى' : 'To')}</span>
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF' }}>{selectedTxn.title}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? 'المرجع البنكي' : 'Reference'}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-green, #7FE87F)', fontFamily: 'monospace' }}>
                      {selectedTxn.utr}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? 'التاريخ' : 'Date'}</span>
                    <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>{selectedTxn.date} • 14:22</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? 'طريقة الدفع' : 'Payment'}</span>
                    <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 700 }}>
                      {isAr ? 'معرّف الدفع (@qtpay)' : 'Alias (@qtpay)'}
                    </span>
                  </div>
                </div>

                {/* Actions: Dispute / SLA button */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setIsDisputing(true)}
                    className="interactive-tap"
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255, 71, 87, 0.12)',
                      border: '1px solid rgba(255, 71, 87, 0.3)',
                      borderRadius: '14px',
                      padding: '13px',
                      color: '#FF4757',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <ShieldAlert size={16} />
                    <span>{isAr ? 'الإبلاغ عن مشكلة' : 'Report an Issue'}</span>
                  </button>

                  <button
                    onClick={handleCloseModal}
                    className="action-btn interactive-tap"
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--brand-green, #7FE87F)',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '13px',
                      color: 'var(--brand-green-ink, #080C14)',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {isAr ? 'تم' : 'Done'}
                  </button>
                </div>
              </div>
            ) : !disputeSubmitted ? (
              <form onSubmit={handleSubmitDispute} className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <AlertTriangle size={20} color="#FFB300" />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                      {isAr ? 'طلب نزاع مالي أو استرداد' : 'File Transaction Dispute'}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {isAr ? 'معالجة مباشرة وفق معايير البنك المركزي السعودي' : 'SAMA SLA-Backed Dispute Protection'}
                    </span>
                  </div>
                </div>

                {/* Dispute Reason Picker */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                    {isAr ? 'سبب الاعتراض' : 'Dispute Reason'}
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { en: 'Duplicate Charge', ar: 'خصم مكرر لنفس العملية' },
                      { en: 'Incorrect Amount Debited', ar: 'خصم مبلغ غير صحيح' },
                      { en: 'Beneficiary Not Credited', ar: 'لم يتم إيداع المبلغ للمستفيد' },
                      { en: 'Unauthorized / Fraud', ar: 'عملية غير مصرح بها' },
                    ].map((reason) => (
                      <div
                        key={reason.en}
                        onClick={() => setDisputeReason(reason.en)}
                        className="interactive-tap"
                        style={{
                          backgroundColor: disputeReason === reason.en ? 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))' : 'var(--color-surface-elevated, #182236)',
                          border: disputeReason === reason.en ? '1px solid var(--brand-green, #7FE87F)' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                          borderRadius: '12px',
                          padding: '11px 14px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: disputeReason === reason.en ? 'var(--brand-green, #7FE87F)' : '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        {isAr ? reason.ar : reason.en}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SLA Guarantee Card */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-elevated, #182236)',
                    border: '1px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Clock size={18} color="var(--brand-green, #7FE87F)" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--brand-green, #7FE87F)' }}>
                      {isAr ? 'اتفاقية مستوى الخدمة (SLA): ٢٤ - ٤٨ ساعة' : 'Resolution SLA: 24 - 48 Hours'}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#9ca3af', marginTop: '1px' }}>
                      {isAr ? 'تتبع فوري مع إشعار بالنتيجة وإعادة المبلغ' : 'Automated bank investigation & instant refund on validation'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsDisputing(false)}
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--color-surface-elevated, #182236)',
                      border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                      borderRadius: '14px',
                      padding: '13px',
                      color: '#9ca3af',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="action-btn interactive-tap"
                    style={{
                      flex: 2,
                      backgroundColor: 'var(--brand-green, #7FE87F)',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '13px',
                      color: 'var(--brand-green-ink, #080C14)',
                      fontWeight: 800,
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{isAr ? 'تأكيد ورفع النزاع' : 'Submit Dispute'}</span>
                    <ArrowRight size={16} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="fade-in" style={{ textAlign: 'center', padding: '14px 0' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px auto',
                  }}
                >
                  <CheckCircle2 size={30} color="var(--brand-green, #7FE87F)" />
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                  {isAr ? 'تم تسجيل الاعتراض بنجاح' : 'Dispute Claim Registered'}
                </h4>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 16px 0' }}>
                  {isAr
                    ? 'رقم التذكرة #DSP-89421 • جاري التحقق من البنك المصدر وسيتم تحديثك خلال ٢٤ ساعة.'
                    : 'Ticket #DSP-89421 • Bank investigation initiated. You will receive updates within 24 hours.'}
                </p>

                <button
                  onClick={handleCloseModal}
                  className="action-btn interactive-tap"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--brand-green, #7FE87F)',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '13px',
                    color: 'var(--brand-green-ink, #080C14)',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {isAr ? 'حسناً ومتابعة' : 'Done & Return'}
                </button>
              </div>
            )}

            {/* SAMA Protection Footer */}
            <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <SamaLogo height={12} themeMode="green" />
              <span style={{ fontSize: '10.5px', color: '#9ca3af', fontWeight: 600 }}>
                {isAr ? 'محمي ومراقب بنظام حماية العملاء التابع لساما' : 'SAMA Financial Consumer Protection Regulated'}
              </span>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};
