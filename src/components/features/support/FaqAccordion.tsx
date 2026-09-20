import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FaqItem } from './supportData';

interface FaqAccordionProps {
  faqs: FaqItem[];
  expandedFaq: number | null;
  isAr: boolean;
  onToggleFaq: (index: number) => void;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({
  faqs,
  expandedFaq,
  isAr,
  onToggleFaq,
}) => {
  return (
    <>
      <div
        style={{
          fontSize: '11.5px',
          fontWeight: 700,
          color: '#6E6E85',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '10px',
          marginLeft: '4px',
        }}
      >
        {isAr ? 'الأسئلة الشائعة' : 'FAQs'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {faqs.map((faq, index) => {
          const isExpanded = expandedFaq === index;
          return (
            <div
              key={index}
              className="interactive-tap"
              style={{
                backgroundColor: '#151524',
                border: '1px solid #2C2C44',
                borderRadius: '16px',
                padding: '16px 18px',
                cursor: 'pointer',
                boxShadow: 'none',
              }}
              onClick={() => onToggleFaq(index)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF' }}>
                  {faq.q}
                </span>
                {isExpanded ? (
                  <ChevronUp size={16} color="#7FE87F" />
                ) : (
                  <ChevronDown size={16} color="#A2A2BA" />
                )}
              </div>
              {isExpanded && (
                <p
                  style={{
                    fontSize: '12.5px',
                    color: '#A2A2BA',
                    marginTop: '10px',
                    marginBottom: 0,
                    lineHeight: '1.5',
                    borderTop: '1px solid #2C2C44',
                    paddingTop: '10px',
                  }}
                >
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
