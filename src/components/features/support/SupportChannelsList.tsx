import React from 'react';
import { MessageSquare, PhoneCall, ShieldAlert } from 'lucide-react';
import { ListRow } from '../../ListRow';

interface SupportChannelsListProps {
  isAr: boolean;
  onOpenModal: (type: 'chat' | 'call' | 'dispute') => void;
}

export const SupportChannelsList: React.FC<SupportChannelsListProps> = ({
  isAr,
  onOpenModal,
}) => {
  return (
    <>
      <div
        style={{
          fontSize: '11.5px',
          fontWeight: 700,
          color: '#8E9BAE',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '8px',
          marginLeft: '4px',
        }}
      >
        {isAr ? 'قنوات التواصل' : 'Get in Touch'}
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-surface, #111726)',
          border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        <ListRow
          icon={<MessageSquare size={18} color="var(--brand-green, #7FE87F)" />}
          label={isAr ? 'المحادثة المباشرة' : 'Live Chat'}
          subLabel={isAr ? 'متوسط الرد: ~١ دقيقة' : 'Avg response: ~1 min'}
          onClick={() => onOpenModal('chat')}
        />
        <ListRow
          icon={<PhoneCall size={18} color="var(--brand-green, #7FE87F)" />}
          label={isAr ? 'الهاتف المجاني' : 'Toll-Free Phone'}
          subLabel="800-123-QTPAY"
          onClick={() => onOpenModal('call')}
        />
        <ListRow
          icon={<ShieldAlert size={18} color="var(--brand-green, #7FE87F)" />}
          label={isAr ? 'الإبلاغ عن مشكلة' : 'Report an Issue'}
          subLabel={isAr ? 'اعتراض على عملية أو اشتباه احتيال' : 'Dispute or fraud report'}
          isLast={true}
          onClick={() => onOpenModal('dispute')}
        />
      </div>
    </>
  );
};
