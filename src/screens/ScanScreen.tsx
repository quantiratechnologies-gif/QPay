import React, { useState, useEffect, useRef } from 'react';
import { X, Flashlight, Image as ImageIcon, CheckCircle, Zap, Store, Coffee, Train, AlertCircle, Edit3 } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { designSystem } from '../design-system';

export const ScanScreen: React.FC = () => {
  const { isScanModalOpen, setIsScanModalOpen, contacts, navigateTo, t, language } = useApp();
  const isAr = language === 'العربية' || language === 'ar';
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isFlashOn, setIsFlashOn] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanSuccessContact, setScanSuccessContact] = useState<any | null>(null);
  const [qrValidationError, setQrValidationError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualQrText, setManualQrText] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Play scanner confirmation beep using Web Audio API
  const playBeep = () => {
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

  // Sarie & ZATCA QR Code Validator
  const validateAndParseQR = (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) {
      return {
        valid: false,
        error: isAr ? 'يرجى إدخال رمز QR أو رابط دفع.' : 'Please enter a QR code or payment URI.',
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
          error: isAr ? 'رابط الدفع غير صالح أو تالف.' : 'Malformed payment QR URI scheme.',
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
              name: isAr ? 'فاتورة ضريبية ZATCA' : 'ZATCA Tax Invoice',
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
          name: trimmed.includes('@sarie') ? trimmed.split('@')[0] : isAr ? 'مستلم سريع' : 'Sarie Recipient',
          upiId: trimmed,
          avatarInitials: 'SR',
        },
      };
    }

    // Invalid format
    return {
      valid: false,
      error: isAr
        ? 'رمز غير صالح! يجب أن يكون رمز سريع (sarie://) أو فاتورة هيئة الزكاة (ZATCA).'
        : 'Invalid QR code. Must be a valid Sarie payment QR or ZATCA e-invoice code.',
    };
  };

  const handleProcessRawQR = (rawText: string) => {
    setQrValidationError(null);
    const result = validateAndParseQR(rawText);
    if (!result.valid) {
      setQrValidationError(result.error || 'Invalid QR code');
      if (navigator.vibrate) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch {}
      }
      setTimeout(() => setQrValidationError(null), 4000);
      return;
    }

    handleScanSuccess(result.contact, result.amount);
  };

  // Start real camera stream
  useEffect(() => {
    if (!isScanModalOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (isMounted) setHasCameraPermission(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasCameraPermission(true);
      } catch {
        if (isMounted) setHasCameraPermission(false);
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isScanModalOpen]);

  // Toggle Torch/Flashlight
  const toggleFlash = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
      if (capabilities.torch) {
        try {
          const nextState = !isFlashOn;
          await (track as any).applyConstraints({ advanced: [{ torch: nextState }] });
          setIsFlashOn(nextState);
        } catch {
          // Torch not supported on this device
        }
      } else {
        setIsFlashOn(!isFlashOn);
      }
    }
  };

  const [unsupportedQrError, setUnsupportedQrError] = useState<string | null>(null);

  // Validate QR payload before entering payment flow
  const validateAndProcessQr = (payload: string, fallbackContact?: any, amount?: number) => {
    setUnsupportedQrError(null);

    // Check if valid Sarie / QPay payment QR payload
    const isValidPaymentScheme =
      payload.startsWith('sarie://pay') ||
      payload.startsWith('upi://pay') ||
      payload.includes('@sarie') ||
      payload.startsWith('QTPAY:');

    if (!isValidPaymentScheme) {
      setUnsupportedQrError(
        language === 'العربية'
          ? 'رمز QR غير مدعوم: نقبل فقط رموز الدفع المعتمدة عبر كيو تي باي ونظام سريع ومدى.'
          : 'Unsupported QR Code: Only valid QPay, Sarie, and mada payment QR codes are supported.'
      );
      if (navigator.vibrate) {
        try { navigator.vibrate([100, 50, 100]); } catch {}
      }
      setTimeout(() => setUnsupportedQrError(null), 4000);
      return;
    }

    // Extract contact and amount if present
    let targetContact = fallbackContact;
    let targetAmount = amount;

    if (payload.includes('@sarie')) {
      const parts = payload.match(/([a-zA-Z0-9._-]+@sarie)/);
      if (parts) {
        const upi = parts[1];
        const existing = contacts.find((c) => c.upiId.toLowerCase() === upi.toLowerCase());
        targetContact = existing || {
          id: `qr-${Date.now()}`,
          name: upi.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
          upiId: upi,
          avatarInitials: upi.substring(0, 2).toUpperCase(),
        };
      }
    }

    if (payload.includes('am=')) {
      const amtMatch = payload.match(/am=([0-9.]+)/);
      if (amtMatch) targetAmount = parseFloat(amtMatch[1]);
    }

    handleScanSuccess(targetContact || contacts[0], targetAmount);
  };

  // Trigger successful scan transition
  const handleScanSuccess = (contact: any, amount?: number) => {
    setIsScanning(false);
    setScanSuccessContact(contact);
    playBeep();
    if (navigator.vibrate) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {}
    }

    setTimeout(() => {
      setIsScanModalOpen(false);
      setIsScanning(true);
      setScanSuccessContact(null);
      navigateTo('SEND_AMOUNT', { contact, defaultAmount: amount });
    }, 600);
  };

  // Image upload gallery handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate real QR code payload decoding from image
    const demoPayload = 'sarie://pay?pa=star.supermarket@sarie&pn=Star%20Supermarket&am=280';
    handleProcessRawQR(demoPayload);
  };

  if (!isScanModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="QR Code Payment Scanner"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0B0B14',
        zIndex: 2600,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: designSystem.typography.fontFamily,
      }}
    >
      {/* Hidden file input for gallery upload */}
      {/* Hidden file input for gallery upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          zIndex: 20,
          background: 'linear-gradient(to bottom, rgba(11, 15, 25, 0.95), transparent)',
        }}
      >
        <button
          onClick={() => setIsScanModalOpen(false)}
          aria-label={t('btn.close', 'Close Scanner')}
          style={{
            backgroundColor: 'var(--color-surface-elevated, #182236)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            color: '#FFFFFF',
            width: '40px',
            height: '40px',
            borderRadius: designSystem.radii.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '800', margin: 0 }}>
            {t('scan.title', 'Scan QR Code')}
          </h2>
          <span style={{ fontSize: '11px', color: '#8E9BAE', fontWeight: '600' }}>
            {language === 'العربية' ? 'مدى QR • سريع • دفع فوري للمتاجر' : 'mada QR • Sarie • In-store & Online Checkout'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            aria-label="Manual Code Entry"
            style={{
              backgroundColor: showManualInput ? 'var(--brand-green, #7FE87F)' : 'var(--color-surface-elevated, #182236)',
              border: showManualInput ? 'none' : '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
              color: showManualInput ? 'var(--brand-green-ink, #080C14)' : '#FFFFFF',
              width: '40px',
              height: '40px',
              borderRadius: designSystem.radii.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={toggleFlash}
            aria-label="Toggle Flashlight"
            style={{
              backgroundColor: isFlashOn ? 'var(--brand-green, #7FE87F)' : 'var(--color-surface-elevated, #182236)',
              border: isFlashOn ? 'none' : '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
              color: isFlashOn ? 'var(--brand-green-ink, #080C14)' : '#FFFFFF',
              width: '40px',
              height: '40px',
              borderRadius: designSystem.radii.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <Flashlight size={18} />
          </button>
        </div>
      </div>

      {/* Validation Error Toast Alert */}
      {qrValidationError && (
        <div
          style={{
            margin: '0 20px 10px 20px',
            backgroundColor: 'rgba(239, 68, 68, 0.95)',
            color: '#FFFFFF',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 30,
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{qrValidationError}</span>
        </div>
      )}

      {/* Manual QR Input Drawer for Testing & Fallback */}
      {showManualInput && (
        <div
          style={{
            margin: '0 20px 10px 20px',
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid rgba(127, 232, 127, 0.3)',
            borderRadius: '14px',
            padding: '14px',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <label style={{ fontSize: '11.5px', color: '#8E9BAE', fontWeight: 700 }}>
            {isAr ? 'أدخل رابط أو نص رمز الاستجابة السريعة للتحقق:' : 'Enter or paste QR payload / Sarie URI to validate:'}
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={manualQrText}
              onChange={(e) => setManualQrText(e.target.value)}
              placeholder="e.g. sarie://pay?pa=star@sarie&pn=Star&am=50"
              style={{
                flex: 1,
                padding: '10px 12px',
                backgroundColor: 'var(--color-surface-elevated, #182236)',
                border: '1px solid var(--color-border, rgba(255, 255, 255, 0.1))',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleProcessRawQR(manualQrText)}
              style={{
                backgroundColor: 'var(--brand-green, #7FE87F)',
                color: '#080C14',
                border: 'none',
                borderRadius: '8px',
                padding: '0 14px',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {isAr ? 'تحقق' : 'Validate'}
            </button>
          </div>
        </div>
      )}

      {/* Viewfinder Center Camera Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '0 20px',
        }}
      >
        {/* Real Live Camera Stream View */}
        {hasCameraPermission && (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
            }}
          />
        )}

        {/* Viewfinder Target Box with Corner Reticles */}
        <div
          style={{
            width: '270px',
            height: '270px',
            borderRadius: '20px',
            position: 'relative',
            zIndex: 10,
            boxShadow: '0 0 0 4000px rgba(11, 15, 25, 0.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: scanSuccessContact
              ? '3px solid var(--brand-green, #7FE87F)'
              : '1.5px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
            transition: 'border 0.3s ease',
          }}
        >
          {/* Corner Guides (QTPay Brand Green) */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              width: 32,
              height: 32,
              borderTop: '4px solid var(--brand-green, #7FE87F)',
              borderLeft: '4px solid var(--brand-green, #7FE87F)',
              borderTopLeftRadius: '10px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 32,
              height: 32,
              borderTop: '4px solid var(--brand-green, #7FE87F)',
              borderRight: '4px solid var(--brand-green, #7FE87F)',
              borderTopRightRadius: '10px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              width: 32,
              height: 32,
              borderBottom: '4px solid var(--brand-green, #7FE87F)',
              borderLeft: '4px solid var(--brand-green, #7FE87F)',
              borderBottomLeftRadius: '10px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              width: 32,
              height: 32,
              borderBottom: '4px solid var(--brand-green, #7FE87F)',
              borderRight: '4px solid var(--brand-green, #7FE87F)',
              borderBottomRightRadius: '10px',
            }}
          />

          {/* Animated Laser Scanning Beam */}
          {isScanning && (
            <div
              className="scanner-laser"
              style={{
                width: '100%',
                height: '2px',
                backgroundColor: 'var(--brand-green, #7FE87F)',
                position: 'absolute',
                boxShadow: '0 0 12px var(--brand-green, #7FE87F), 0 0 4px #ffffff',
                animation: 'scanLaser 2.2s infinite ease-in-out alternate',
              }}
            />
          )}

          {/* Scan Success Overlay */}
          {scanSuccessContact && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'var(--brand-green-tint, rgba(127, 232, 127, 0.16))',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <CheckCircle size={48} color="var(--brand-green, #7FE87F)" />
              <span style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '15px' }}>
                {language === 'العربية' ? 'تم التحقق من الرمز بنجاح!' : 'QR Verified!'}
              </span>
            </div>
          )}
        </div>

        {/* Status Guide Text */}
        <p
          style={{
            color: '#FFFFFF',
            fontSize: '12.5px',
            marginTop: '20px',
            fontWeight: '600',
            zIndex: 10,
            textAlign: 'center',
            backgroundColor: 'var(--color-surface, #111726)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            padding: '6px 16px',
            borderRadius: '20px',
          }}
        >
          {hasCameraPermission === false
            ? language === 'العربية' ? 'الكاميرا غير متاحة، اختر مستلم تجريبي:' : 'Camera unavailable. Tap demo recipient:'
            : t('scan.align_qr', 'Point at any QR code to pay')}
        </p>

        {/* Unsupported QR Rejection Banner */}
        {unsupportedQrError && (
          <div
            className="fade-in"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1.5px solid #EF4444',
              borderRadius: '14px',
              padding: '12px 16px',
              margin: '12px 20px 0 20px',
              zIndex: 25,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
            }}
          >
            <X size={18} color="#EF4444" style={{ flexShrink: 0 }} />
            <span>{unsupportedQrError}</span>
          </div>
        )}

        {/* Quick Sample Presets for Instant Demo Scanning */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px',
            zIndex: 10,
            overflowX: 'auto',
            maxWidth: '100%',
            padding: '4px',
          }}
        >
          <button
            onClick={() =>
              validateAndProcessQr(
                'sarie://pay?pa=star@sarie&pn=Star%20Supermarket&am=280',
                { id: 'm-1', name: 'Star Supermarket', upiId: 'star@sarie', avatarInitials: 'SS' },
                280
              )
            }
            style={{
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
              borderRadius: designSystem.radii.sm,
              padding: '6px 12px',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Store size={13} color="var(--brand-green, #7FE87F)" /> {language === 'العربية' ? 'أسواق بنده' : 'Star Supermarket'}
          </button>

          <button
            onClick={() =>
              validateAndProcessQr(
                'sarie://pay?pa=halfmillion@sarie&pn=Half%20Million&am=180',
                { id: 'm-2', name: 'Half Million Coffee', upiId: 'halfmillion@sarie', avatarInitials: 'HM' },
                180
              )
            }
            style={{
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
              borderRadius: designSystem.radii.sm,
              padding: '6px 12px',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Coffee size={13} color="var(--brand-green, #7FE87F)" /> {language === 'العربية' ? 'هاف مليون كافيه' : 'Half Million Coffee'}
          </button>

          <button
            onClick={() =>
              validateAndProcessQr(
                'https://random-unsupported-website.com/not-a-payment-qr',
                null
              )
            }
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: designSystem.radii.sm,
              padding: '6px 12px',
              color: '#EF4444',
              fontSize: '11px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <X size={13} color="#EF4444" /> {language === 'العربية' ? 'اختبار رمز غير مدعوم' : 'Test Invalid QR'}
          </button>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '20px',
          background: 'linear-gradient(to top, rgba(11, 15, 25, 0.95), transparent)',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              backgroundColor: 'var(--color-surface-elevated, #182236)',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
              borderRadius: designSystem.radii.md,
              padding: '12px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <ImageIcon size={16} color="var(--brand-green, #7FE87F)" /> {t('scan.upload_gallery', 'Upload QR')}
          </button>

          <button
            onClick={() => handleScanSuccess(contacts[0] || { name: 'Tariq Al-Otaibi', upiId: 'tariq@sarie' })}
            style={{
              backgroundColor: 'var(--brand-green, #7FE87F)',
              border: 'none',
              borderRadius: designSystem.radii.md,
              padding: '12px',
              color: 'var(--brand-green-ink, #080C14)',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <Zap size={16} color="var(--brand-green-ink, #080C14)" /> {language === 'العربية' ? 'دفع تجريبي' : 'Demo Pay'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scanLaser {
          0% { top: 6%; }
          100% { top: 94%; }
        }
      `}</style>
    </div>
  );
};
