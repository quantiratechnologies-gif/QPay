import React from 'react';
import { Lightbulb, Building2, ChevronRight } from 'lucide-react';
import { useApp } from '../../../state/AppContext';

interface SmartInsightsCardProps {
  deltaPercent: number;
}

export const SmartInsightsCard: React.FC<SmartInsightsCardProps> = ({ deltaPercent }) => {
  const { navigateTo, language, isRtl } = useApp();
  const isAr = language === 'العربية';

  return (
    <>
      {/* 1. Smart Insight Tip */}
      <div
        style={{
          backgroundColor: '#0f1623',
          borderRadius: '18px',
          border: '1px solid #1e293b',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Lightbulb size={18} color="#10b981" />
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.45' }}>
          {isAr
            ? `وفرت ${Math.abs(deltaPercent)}٪ في مصاريف هذا الشهر مقارنة بالشهر السابق. استمر في هذا الأداء الرائع!`
            : `You spent ${Math.abs(deltaPercent)}% less this month compared to last month. Keep up the great pace!`}
        </div>
      </div>

      {/* 2. Linked Bank Accounts Shortcut */}
      <div
        onClick={() => navigateTo('BANK_ACCOUNTS')}
        className="interactive-tap"
        style={{
          backgroundColor: '#0f1623',
          borderRadius: '18px',
          border: '1px solid #1e293b',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={18} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
              {isAr ? 'الحسابات البنكية المرتبطة' : 'Linked Bank Accounts'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {isAr ? 'عرض أرصدة وبطاقات البنوك السعودية' : 'View Saudi bank cards & balances'}
            </div>
          </div>
        </div>

        <ChevronRight size={18} color="#64748b" style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
      </div>
    </>
  );
};
