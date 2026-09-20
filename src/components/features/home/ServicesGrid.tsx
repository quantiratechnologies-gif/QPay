import React from 'react';
import { Zap, Smartphone, Droplets, Car, ChevronRight } from 'lucide-react';
import { useApp } from '../../../state/AppContext';

export const ServicesGrid: React.FC = () => {
  const { navigateTo, t, isRtl } = useApp();

  const services = [
    {
      id: 'electricity',
      label: t('home.electricity', 'Electricity'),
      icon: <Zap size={22} color="var(--brand-green)" />,
      onClick: () => navigateTo('ELECTRICITY'),
    },
    {
      id: 'telecom',
      label: t('home.telecom', 'Telecom'),
      icon: <Smartphone size={22} color="var(--brand-green)" />,
      onClick: () => navigateTo('ALL_SERVICES'),
    },
    {
      id: 'water',
      label: t('home.water', 'Water'),
      icon: <Droplets size={22} color="var(--brand-green)" />,
      onClick: () => navigateTo('ALL_SERVICES'),
    },
    {
      id: 'traffic',
      label: t('home.traffic_fines', 'Traffic Fines'),
      icon: <Car size={22} color="var(--brand-green)" />,
      onClick: () => navigateTo('ALL_SERVICES'),
    },
  ];

  return (
    <div style={{ padding: '14px 20px 0 20px' }}>
      <div
        style={{
          backgroundColor: '#151524',
          border: '1px solid #2C2C44',
          borderRadius: '18px',
          padding: '18px 16px',
          boxShadow: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
            {t('home.utilities_services', 'Bills & Utilities')}
          </h3>

          <button
            type="button"
            onClick={() => navigateTo('ALL_SERVICES')}
            className="interactive-tap"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-green)',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              boxShadow: 'none',
              padding: 0,
            }}
          >
            <span>{t('home.view_all', 'View All')}</span>
            <ChevronRight size={15} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {services.map((svc) => (
            <div
              key={svc.id}
              onClick={svc.onClick}
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
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--brand-green-tint)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                }}
              >
                {svc.icon}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center' }}>
                {svc.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
