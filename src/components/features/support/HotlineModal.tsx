import React from 'react';
import { PhoneCall } from 'lucide-react';
import { Modal } from '../../Modal';

interface HotlineModalProps {
  isOpen: boolean;
  isAr: boolean;
  onClose: () => void;
}

export const HotlineModal: React.FC<HotlineModalProps> = ({ isOpen, isAr, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAr ? 'الرقم المجاني' : 'Toll-Free Hotline'}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.14))',
            color: 'var(--brand-green, #7FE87F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
          }}
        >
          <PhoneCall size={28} />
        </div>
        <h4
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 6px 0',
            direction: 'ltr',
          }}
        >
          800-123-QTPAY
        </h4>
        <p style={{ fontSize: '12.5px', color: '#8E9BAE', margin: '0 0 20px 0' }}>
          {isAr
            ? 'متاح على مدار الساعة بالعربية والإنجليزية (مجاني داخل المملكة)'
            : 'Available 24x7 in Arabic and English (Toll-Free in KSA)'}
        </p>
        <a
          href="tel:80012378729"
          className="interactive-tap"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            backgroundColor: 'var(--brand-green, #7FE87F)',
            color: 'var(--brand-green-ink, #080C14)',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '13px',
            textDecoration: 'none',
          }}
        >
          {isAr ? 'اتصال الآن' : 'Call Now'}
        </a>
      </div>
    </Modal>
  );
};
