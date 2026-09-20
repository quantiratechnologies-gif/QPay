import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { BottomSheet } from '../../BottomSheet';
import { formatCurrency } from '../../../utils/formatters';
import type { Transaction } from '../../../types';

interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onReportDispute: (id: string) => void;
  language: string;
  isRtl?: boolean;
}

export const TransactionDetailSheet: React.FC<TransactionDetailSheetProps> = ({
  transaction,
  isOpen,
  onClose,
  onReportDispute,
  language,
}) => {
  const [isDisputing, setIsDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Duplicate Charge');
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  if (!transaction) return null;

  const isAr = language === 'العربية' || language === 'ar';

  const handleClose = () => {
    setIsDisputing(false);
    setDisputeSubmitted(false);
    onClose();
  };

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    onReportDispute(transaction.id);
    setDisputeSubmitted(true);
    setTimeout(() => {
      handleClose();
    }, 2200);
  };

  const reasons = [
    { en: 'Duplicate Charge', ar: 'خصم مكرر لنفس العملية' },
    { en: 'Incorrect Amount Debited', ar: 'خصم مبلغ غير صحيح' },
    { en: 'Beneficiary Not Credited', ar: 'لم يتم إيداع المبلغ للمستفيد' },
    { en: 'Unauthorized / Fraud', ar: 'عملية غير مصرح بها' },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={isAr ? 'إيصال العملية' : 'Receipt'}>
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
                {transaction.type === 'received' ? '+' : '-'}
                {formatCurrency(transaction.amount, language)}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: transaction.isReported ? '#FFB300' : 'var(--brand-green, #7FE87F)',
                  fontWeight: 700,
                  marginTop: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                {transaction.isReported ? <AlertTriangle size={14} /> : null}
                {transaction.isReported
                  ? isAr
                    ? 'تم رفع طلب اعتراض'
                    : 'Dispute Reported'
                  : isAr
                  ? 'عملية مكتملة'
                  : 'Transfer Complete'}
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
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {transaction.type === 'received' ? (isAr ? 'من' : 'From') : isAr ? 'إلى' : 'To'}
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF' }}>{transaction.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? 'المرجع البنكي' : 'Reference'}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-green, #7FE87F)', fontFamily: 'monospace' }}>
                  {transaction.utr}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? 'التاريخ' : 'Date'}</span>
                <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>{transaction.date || 'TODAY'} • 14:22</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isAr ? 'طريقة الدفع' : 'Payment'}</span>
                <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 700 }}>
                  {isAr ? 'معرّف الدفع (@sarie)' : 'Alias (@sarie)'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {!transaction.isReported && (
                <button
                  type="button"
                  onClick={() => setIsDisputing(true)}
                  className="interactive-tap"
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--color-surface, #111726)',
                    border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                    borderRadius: '14px',
                    padding: '13px',
                    color: '#FFFFFF',
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
              )}

              <button
                type="button"
                onClick={handleClose}
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
                {reasons.map((reason) => (
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
              <div style={{ fontSize: '11.5px', color: '#FFFFFF', lineHeight: 1.4 }}>
                {isAr ? 'البت في النزاع واسترداد المبلغ يتم خلال ٤٨ ساعة عمل حسب لائحة ساما' : 'Resolution and refund SLA within 48 business hours per SAMA regulation'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsDisputing(false)}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.1))',
                  borderRadius: '14px',
                  padding: '12px',
                  color: '#9ca3af',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                style={{
                  flex: 2,
                  backgroundColor: '#EF4444',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '12px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isAr ? 'تأكيد رفع النزاع' : 'Submit Dispute'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }} className="fade-in">
            <CheckCircle2 size={48} color="var(--brand-green, #7FE87F)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
              {isAr ? 'تم تسجيل طلب الاعتراض بنجاح' : 'Dispute Logged Successfully'}
            </h4>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              {isAr ? 'رقم التذكرة: SAMA-DISP-89214 • سيصلك إشعار بالنتيجة' : 'Case Ref: SAMA-DISP-89214 • Notification will follow'}
            </p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
