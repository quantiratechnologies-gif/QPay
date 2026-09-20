import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface TransferSecurityFooterProps {
  language: string;
}

export const TransferSecurityFooter: React.FC<TransferSecurityFooterProps> = ({ language }) => {
  return (
    <div
      style={{
        marginTop: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
      }}
    >
      <ShieldCheck size={14} color="#7FE87F" />
      <span style={{ fontSize: '11.5px', color: '#9ca3af', fontWeight: 600 }}>
        {language === 'العربية'
          ? 'تحويل فوري عبر سريع • بدون رسوم • مدعوم بحماية مدى'
          : 'Sarie Real-Time • 0 SAR Fee • mada Fallback Active'}
      </span>
    </div>
  );
};
