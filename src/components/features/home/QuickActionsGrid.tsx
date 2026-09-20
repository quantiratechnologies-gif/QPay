import React from 'react';
import { Camera, Send, QrCode, Landmark } from 'lucide-react';
import { useApp } from '../../../state/AppContext';

export const QuickActionsGrid: React.FC = () => {
  const { navigateTo, setIsScanModalOpen, t, isRtl } = useApp();

  const actions = [
    {
      id: 'scan',
      label: t('home.scan_qr', 'Scan QR'),
      icon: <Camera size={22} color="var(--brand-green)" />,
      onClick: () => setIsScanModalOpen(true),
    },
    {
      id: 'send',
      label: t('home.send_money', 'Send Money'),
      icon: <Send size={22} color="var(--brand-green)" style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />,
      onClick: () => navigateTo('PAY_ANYONE'),
    },
    {
      id: 'receive',
      label: t('home.receive', 'Receive'),
      icon: <QrCode size={22} color="var(--brand-green)" />,
      onClick: () => navigateTo('RECEIVE'),
    },
    {
      id: 'accounts',
      label: t('home.accounts', 'Accounts'),
      icon: <Landmark size={22} color="var(--brand-green)" />,
      onClick: () => navigateTo('BANK_ACCOUNTS'),
    },
  ];

  return (
    <div style={{ padding: '14px 20px 0 20px' }}>
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '18px',
          padding: '18px 16px',
          boxShadow: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
            {t('home.quick_actions', 'Quick Actions')}
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {actions.map((act) => (
            <div
              key={act.id}
              onClick={act.onClick}
              className="interactive-tap"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--brand-green-tint)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                }}
              >
                {act.icon}
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                {act.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
