import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../state/AppContext';
import { qrService } from '../services/qrService';
import {
  ReceiveQrCard,
  ReceiveAliasCard,
  ReceiveIbanCard,
} from '../components/features/receive';

export const ReceiveScreen: React.FC = () => {
  const { user, bankAccounts, t, language } = useApp();
  const isAr = language === 'العربية' || language === 'ar';
  const [copied, setCopied] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);

  const primaryBank = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0];
  const fullIban =
    primaryBank?.iban ||
    primaryBank?.accountNumberMasked ||
    'SA03 8000 0000 6080 1014 4821';
  const formattedIban = fullIban;
  const sarieAlias = user.upiId || '966501234567@sarie';
  const upiQrString = qrService.getUpiQrString(sarieAlias, user.name);
  const displayName = t(user.name, user.name);

  const handleCopy = () => {
    navigator.clipboard.writeText(sarieAlias);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyIban = () => {
    navigator.clipboard.writeText(fullIban.replace(/\s+/g, ''));
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'QTPay Sarie & IBAN Details',
          text: `${isAr ? 'بيانات التحويل عبر سريع والآيبان:' : 'Sarie & IBAN Payment Details:'}\n${isAr ? 'الاسم:' : 'Name:'} ${displayName}\n${isAr ? 'معرّف سريع:' : 'SARIE Alias:'} ${sarieAlias}\n${isAr ? 'الآيبان:' : 'IBAN:'} ${fullIban}`,
        })
        .catch(() => {});
    } else {
      handleCopyIban();
    }
  };

  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#080c14',
        minHeight: '100%',
        paddingBottom: '120px',
      }}
    >
      <AppHeader title={t('receive.title', 'Receive Money')} showBack />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <ReceiveQrCard
          displayName={displayName}
          avatarUrl={user.avatarUrl}
          avatarInitials={user.avatarInitials}
          primaryBank={primaryBank}
          upiQrString={upiQrString}
          isAr={isAr}
          t={t}
        />

        <ReceiveAliasCard
          sarieAlias={sarieAlias}
          copied={copied}
          isAr={isAr}
          onCopy={handleCopy}
        />

        <ReceiveIbanCard
          formattedIban={formattedIban}
          copiedIban={copiedIban}
          isAr={isAr}
          onCopyIban={handleCopyIban}
        />

        {/* Share Action Button */}
        <PrimaryButton onClick={handleShare}>
          <Share2 size={18} />{' '}
          {isAr ? 'مشاركة بيانات الحساب والرمز' : 'Share QR & Account Details'}
        </PrimaryButton>
      </div>
    </div>
  );
};
