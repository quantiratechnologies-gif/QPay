import React from 'react';
import { EyeOff } from 'lucide-react';

interface MaskIbanCardProps {
  maskIban: boolean;
  onToggle: () => void;
  language: string;
}

export const MaskIbanCard: React.FC<MaskIbanCardProps> = ({ maskIban, onToggle, language }) => {
  const isAr = language === 'العربية' || language === 'ar';

  return (
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
            {isAr
              ? 'استقبال الأموال دون مشاركة رقم حسابك البنكي'
              : 'Receive payments without sharing bank details'}
          </div>
        </div>
      </div>

      <div
        onClick={onToggle}
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
  );
};
