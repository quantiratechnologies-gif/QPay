import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { translateText } from '../utils/i18n';
import {
  SupportHeroCard,
  SupportChannelsList,
  FaqAccordion,
  LiveChatModal,
  HotlineModal,
  DisputeModal,
  getDefaultFaqs,
} from '../components/features/support';
import type { FaqItem } from '../components/features/support';

export type { FaqItem };

export interface HelpSupportScreenProps {
  initialFaqs?: FaqItem[];
}

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ initialFaqs }) => {
  const { language } = useApp();
  const isAr = language === 'العربية' || language === 'ar';
  const [activeModal, setActiveModal] = useState<'chat' | 'call' | 'dispute' | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = initialFaqs && initialFaqs.length > 0 ? initialFaqs : getDefaultFaqs(isAr);

  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#0B0B14',
        minHeight: '100%',
        paddingBottom: '36px',
        color: '#FFFFFF',
      }}
    >
      <AppHeader
        title={translateText('Help & Support', language)}
        showBack
        showSettings={false}
      />

      <div style={{ padding: '20px' }}>
        <SupportHeroCard isAr={isAr} />

        <SupportChannelsList isAr={isAr} onOpenModal={(m) => setActiveModal(m)} />

        <FaqAccordion
          faqs={faqs}
          expandedFaq={expandedFaq}
          isAr={isAr}
          onToggleFaq={(idx) => setExpandedFaq(expandedFaq === idx ? null : idx)}
        />
      </div>

      {/* Live Chat Modal */}
      <LiveChatModal
        isOpen={activeModal === 'chat'}
        isAr={isAr}
        onClose={() => setActiveModal(null)}
      />

      {/* Hotline Call Modal */}
      <HotlineModal
        isOpen={activeModal === 'call'}
        isAr={isAr}
        onClose={() => setActiveModal(null)}
      />

      {/* Report Dispute Modal */}
      <DisputeModal
        isOpen={activeModal === 'dispute'}
        isAr={isAr}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};
