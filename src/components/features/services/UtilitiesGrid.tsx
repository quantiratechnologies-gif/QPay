import React from 'react';
import { Zap, Droplets, Flame, Smartphone, PhoneCall, Globe, Tv, FileText } from 'lucide-react';
import { ServiceCard } from '../../ServiceCard';
import { translateText } from '../../../utils/i18n';

export interface ServiceOpenParam {
  title: string;
  subTitle: string;
  defaultAmount: number;
  placeholder: string;
  icon: React.ReactNode;
}

interface UtilitiesGridProps {
  language: string;
  onNavigate: (screen: any) => void;
  onOpenService: (param: ServiceOpenParam) => void;
}

export const UtilitiesGrid: React.FC<UtilitiesGridProps> = ({
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
        {translateText('Recharge & Utilities', language)}
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
            label={translateText('Electricity', language)}
            icon={<Zap size={20} />}
            onClick={() => onNavigate('ELECTRICITY')}
          />
          <ServiceCard
            label={translateText('Water', language)}
            icon={<Droplets size={20} />}
            onClick={() =>
              onOpenService({
                title: translateText('Water Bill', language),
                subTitle: translateText('National Water Company (NWC)', language),
                defaultAmount: 220,
                placeholder: translateText('NWC Account No', language),
                icon: <Droplets size={20} />,
              })
            }
          />
          <ServiceCard
            label={translateText('Gas', language)}
            icon={<Flame size={20} />}
            onClick={() =>
              onOpenService({
                title: translateText('Gas Cylinder', language),
                subTitle: translateText('National Gas (GASCO)', language),
                defaultAmount: 45,
                placeholder: translateText('Customer ID', language),
                icon: <Flame size={20} />,
              })
            }
          />
          <ServiceCard
            label={translateText('STC', language)}
            icon={<Smartphone size={20} />}
            onClick={() =>
              onOpenService({
                title: translateText('STC Sawa Recharge', language),
                subTitle: translateText('STC Prepaid 5G', language),
                defaultAmount: 115,
                placeholder: '05X XXX XXXX',
                icon: <Smartphone size={20} />,
              })
            }
          />
          <ServiceCard
            label={translateText('Mobily', language)}
            icon={<PhoneCall size={20} />}
            onClick={() =>
              onOpenService({
                title: translateText('Mobily Postpaid', language),
                subTitle: translateText('Mobily Mawaheb', language),
                defaultAmount: 172,
                placeholder: '05X XXX XXXX',
                icon: <PhoneCall size={20} />,
              })
            }
          />
          <ServiceCard
            label={translateText('Zain 5G', language)}
            icon={<Globe size={20} />}
            onClick={() =>
              onOpenService({
                title: translateText('Zain Fiber & 5G', language),
                subTitle: translateText('Zain KSA', language),
                defaultAmount: 287,
                placeholder: translateText('Account Number', language),
                icon: <Globe size={20} />,
              })
            }
          />
          <ServiceCard
            label={translateText('Shahid VIP', language)}
            icon={<Tv size={20} />}
            onClick={() =>
              onOpenService({
                title: translateText('Shahid / OSN', language),
                subTitle: translateText('Shahid VIP Subscription', language),
                defaultAmount: 49,
                placeholder: translateText('Mobile or Email', language),
                icon: <Tv size={20} />,
              })
            }
          />
          <ServiceCard
            label={translateText('Balady', language)}
            icon={<FileText size={20} />}
            onClick={() =>
              onOpenService({
                title: translateText('Balady Services', language),
                subTitle: translateText('Municipal License & Fines', language),
                defaultAmount: 450,
                placeholder: translateText('Balady Invoice No', language),
                icon: <FileText size={20} />,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
