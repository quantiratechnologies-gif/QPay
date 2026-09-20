import React from 'react';
import { CreditCard, ShieldCheck, Building, Car } from 'lucide-react';
import { ServiceCard } from '../../ServiceCard';
import { translateText } from '../../../utils/i18n';
import type { ServiceOpenParam } from './UtilitiesGrid';

interface FinanceGridProps {
  language: string;
  onNavigate: (screen: any) => void;
  onOpenService: (param: ServiceOpenParam) => void;
}

export const FinanceGrid: React.FC<FinanceGridProps> = ({
  language,
  onNavigate,
  onOpenService,
}) => {
  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          color: '#8E9BAE',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '8px',
          marginInlineStart: '4px',
        }}
      >
        {translateText('Banking & Finance (SAMA)', language)}
      </div>
      <div
        style={{
          backgroundColor: 'var(--color-surface, #111726)',
          border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
          borderRadius: '16px',
          padding: '16px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <ServiceCard
            label={translateText('mada Cards', language)}
            icon={<CreditCard size={20} />}
            onClick={() => onNavigate('PAYMENT_METHODS')}
          />
          <ServiceCard
            label={translateText('Insurance', language)}
            icon={<ShieldCheck size={20} />}
            onClick={() =>
              onOpenService({
                title: translateText('Tawuniya Insurance', language),
                subTitle: translateText('Motor & Health', language),
                defaultAmount: 1250,
                placeholder: translateText('Policy / National ID', language),
                icon: <ShieldCheck size={20} />,
              })
            }
          />
          <ServiceCard
            label={translateText('Finance EMI', language)}
            icon={<Building size={20} />}
            onClick={() =>
              onOpenService({
                title: translateText('Finance Installment', language),
                subTitle: translateText('Al Rajhi / SNB Finance', language),
                defaultAmount: 2150,
                placeholder: translateText('Contract / IBAN No', language),
                icon: <Building size={20} />,
              })
            }
          />
          <ServiceCard
            label={translateText('Mawgif', language)}
            icon={<Car size={20} />}
            onClick={() =>
              onOpenService({
                title: translateText('Mawgif Parking', language),
                subTitle: translateText('Riyadh & Jeddah Parking', language),
                defaultAmount: 50,
                placeholder: translateText('Plate / Mobile No', language),
                icon: <Car size={20} />,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
