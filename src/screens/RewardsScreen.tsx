import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { formatLocalizedNumber, translateText } from '../utils/i18n';
import {
  RewardPointsHero,
  ScratchCardItemView,
  ScratchCardModal,
  getDefaultScratchCards,
} from '../components/features/rewards';
import type { ScratchCardItem } from '../components/features/rewards';

export type { ScratchCardItem };

export interface RewardsScreenProps {
  initialCards?: ScratchCardItem[];
  initialPoints?: number;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({
  initialCards,
  initialPoints = 1450,
}) => {
  const { language, isRtl } = useApp();
  const isAr = language === 'العربية' || language === 'ar';
  const [points, setPoints] = useState(initialPoints);
  const [cards, setCards] = useState<ScratchCardItem[]>(
    initialCards || getDefaultScratchCards(isAr)
  );

  const [activeCard, setActiveCard] = useState<ScratchCardItem | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleCardClick = (card: ScratchCardItem) => {
    setActiveCard(card);
    setIsRevealed(card.isScratched);
    setIsScratching(false);
  };

  const handleScratchAction = () => {
    if (!activeCard || isRevealed) return;
    setIsScratching(true);
    setTimeout(() => {
      setIsScratching(false);
      setIsRevealed(true);

      // Update card state
      setCards((prev) =>
        prev.map((c) => (c.id === activeCard.id ? { ...c, isScratched: true } : c))
      );

      // Add points if points reward
      if (activeCard.rewardType === 'points' && activeCard.amount) {
        setPoints((p) => p + activeCard.amount!);
      }
    }, 1200);
  };

  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#0B0B14',
        minHeight: '100vh',
        paddingBottom: '96px',
        color: '#FFFFFF',
      }}
    >
      <AppHeader
        title={translateText('Rewards & Scratch Cards', language)}
        showBack
        showSettings={false}
      />

      <div style={{ padding: '20px' }}>
        <RewardPointsHero points={points} language={language} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            {translateText('Unlocked Scratch Cards', language)}
          </h3>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--brand-green, #7FE87F)',
            }}
          >
            {formatLocalizedNumber(cards.filter((c) => !c.isScratched).length, language)}{' '}
            {translateText('Unopened', language)}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {cards.map((card) => (
            <ScratchCardItemView
              key={card.id}
              card={card}
              language={language}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
      </div>

      {/* Interactive Scratch Modal */}
      {activeCard && (
        <ScratchCardModal
          card={activeCard}
          isRevealed={isRevealed}
          isScratching={isScratching}
          isRtl={isRtl}
          language={language}
          onClose={() => setActiveCard(null)}
          onScratch={handleScratchAction}
        />
      )}
    </div>
  );
};
