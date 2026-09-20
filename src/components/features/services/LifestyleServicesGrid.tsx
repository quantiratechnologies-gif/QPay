import React from 'react';
import { Plane, Gift, FileText } from 'lucide-react';
import { ServiceCard } from '../../ServiceCard';
import { translateText } from '../../../utils/i18n';
import type { ServiceOpenParam } from './UtilitiesGrid';

interface LifestyleServicesGridProps {
  language: string;
  onOpenService: (param: ServiceOpenParam) => void;
}

export const LifestyleServicesGrid: React.FC<LifestyleServicesGridProps> = ({
  language,
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
        {translateText('Travel & Lifestyle', language)}
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
            label={translateText('Saudia', language)}
            icon={<Plane size={20} />}
            onClick={() =>
              onOpenService({
                title: translateText('Flight Booking', language),
                subTitle: translateText('Saudia RUH ➔ JED', language),
                defaultAmount: 650,
                placeholder: translateText('Passenger PNR', language),
                icon: <Plane size={20} />,
              })
            }
          />
          <ServiceCard
            label={translateText('Jarir', language)}
            icon={<Gift size={20} />}
            onClick={() =>
              onOpenService({
                title: translateText('Jarir Gift Card', language),
                subTitle: translateText('Jarir Bookstore Digital Voucher', language),
                defaultAmount: 200,
                placeholder: translateText('Mobile / Email', language),
                icon: <Gift size={20} />,
              })
            }
          />
          <ServiceCard
            label={translateText('Absher', language)}
            icon={<FileText size={20} />}
            onClick={() =>
              onOpenService({
                title: translateText('Traffic Fines (Absher)', language),
                subTitle: translateText('Traffic Violations Settlement', language),
                defaultAmount: 300,
                placeholder: translateText('National ID / Iqama', language),
                icon: <FileText size={20} />,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
