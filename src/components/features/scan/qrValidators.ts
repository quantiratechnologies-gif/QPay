export const playScanBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch {
    // Audio context might be restricted before interaction
  }
};

export interface QrValidationResult {
  valid: boolean;
  contact?: {
    id: string;
    name: string;
    upiId: string;
    avatarInitials: string;
  };
  amount?: number;
  error?: string;
}

export const validateAndParseQR = (rawText: string, isAr: boolean): QrValidationResult => {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: isAr ? '???? ????? ??? QR ?? ???? ???.' : 'Please enter a QR code or payment URI.',
    };
  }

  // Case 1: Sarie / QTPay / UPI standard URL schemes
  if (trimmed.startsWith('sarie://') || trimmed.startsWith('qtpay://') || trimmed.startsWith('upi://')) {
    try {
      const fakeHttp = trimmed
        .replace('sarie://pay', 'https://sarie.local/pay')
        .replace('qtpay://pay', 'https://qtpay.local/pay')
        .replace('upi://pay', 'https://upi.local/pay');
      const url = new URL(fakeHttp);
      const pa = url.searchParams.get('pa') || 'merchant@sarie';
      const pn = decodeURIComponent(url.searchParams.get('pn') || 'Sarie Merchant');
      const amStr = url.searchParams.get('am');
      const am = amStr ? parseFloat(amStr) : undefined;
      return {
        valid: true,
        contact: {
          id: 'qr-' + Date.now(),
          name: pn,
          upiId: pa,
          avatarInitials: pn.substring(0, 2).toUpperCase(),
        },
        amount: am && !isNaN(am) ? am : undefined,
      };
    } catch {
      return {
        valid: false,
        error: isAr ? '???? ????? ??? ???? ?? ????.' : 'Malformed payment QR URI scheme.',
      };
    }
  }

  // Case 2: ZATCA Phase 2 E-Invoicing Base64 TLV string
  if (trimmed.length > 25 && /^[A-Za-z0-9+/=]+$/.test(trimmed)) {
    try {
      const decoded = atob(trimmed);
      if (decoded.length >= 8) {
        return {
          valid: true,
          contact: {
            id: 'zatca-' + Date.now(),
            name: isAr ? '?????? ?????? ZATCA' : 'ZATCA Tax Invoice',
            upiId: 'zatca-tax-invoice@sarie',
            avatarInitials: 'ZT',
          },
          amount: 149.5,
        };
      }
    } catch {
      // Not valid base64
    }
  }

  // Case 3: Sarie Alias, Mobile Number, or Saudi IBAN
  if (
    trimmed.includes('@sarie') ||
    /^(\+966|05)\d{8}$/.test(trimmed) ||
    /^SA\d{22}$/.test(trimmed.replace(/\s/g, ''))
  ) {
    return {
      valid: true,
      contact: {
        id: 'alias-' + Date.now(),
        name: trimmed.includes('@sarie') ? trimmed.split('@')[0] : isAr ? '????? ????' : 'Sarie Recipient',
        upiId: trimmed,
        avatarInitials: 'SR',
      },
    };
  }

  // Invalid format
  return {
    valid: false,
    error: isAr
      ? '??? ??? ????! ??? ?? ???? ??? ???? (sarie://) ?? ?????? ???? ?????? (ZATCA).'
      : 'Invalid QR code. Must be a valid Sarie payment QR or ZATCA e-invoice code.',
  };
};
