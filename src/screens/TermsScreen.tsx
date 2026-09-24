// PLACEHOLDER - must be replaced by legal counsel before release.
import React from 'react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../state/AppContext';
import { termsDocumentEn } from '../content/terms.en';
import { termsDocumentAr } from '../content/terms.ar';
import { Shield } from 'lucide-react';

export const TermsScreen: React.FC = () => {
  const { language, isRtl } = useApp();
  const doc = language === 'العربية' ? termsDocumentAr : termsDocumentEn;

  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#0B0F19',
        minHeight: '100vh',
        paddingBottom: '40px',
        color: '#FFFFFF',
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      <AppHeader title={doc.title} showBack showSettings={false} />

      <div style={{ padding: '20px', maxWidth: '680px', margin: '0 auto' }}>
        {/* Header Metadata Card */}
        <div
          style={{
            backgroundColor: '#111726',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(127, 232, 127, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7FE87F',
              flexShrink: 0,
            }}
          >
            <Shield size={22} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#9CA3AF' }}>
              {language === 'العربية' ? 'الإصدار:' : 'Version:'} {doc.version}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
              {language === 'العربية' ? 'آخر تحديث:' : 'Last updated:'} {doc.lastUpdated}
            </div>
          </div>
        </div>

        {/* Scrollable Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {doc.sections.map((section, idx) => (
            <div
              key={section.id}
              style={{
                backgroundColor: '#111726',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '18px 20px',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: '0 0 8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    color: '#7FE87F',
                    fontSize: '12px',
                    fontWeight: 800,
                    opacity: 0.8,
                  }}
                >
                  {idx + 1}.
                </span>
                {section.heading}
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#9CA3AF',
                  margin: 0,
                }}
              >
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
