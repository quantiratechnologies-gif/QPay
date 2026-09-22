import React, { useState, useEffect, useRef } from 'react';
import { X, Flashlight, Keyboard, CheckCircle, Store } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { designSystem } from '../design-system';

export const ScanScreen: React.FC = () => {
  const { isScanModalOpen, setIsScanModalOpen, navigateTo, t, language, accessToken, currentScreen } = useApp();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isFlashOn, setIsFlashOn] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanSuccessCode, setScanSuccessCode] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [showManualEntry, setShowManualEntry] = useState<boolean>(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play scanner confirmation beep
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
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

  // Start real camera stream
  useEffect(() => {
    if (!isScanModalOpen && currentScreen !== 'SCAN') {
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
        if (!isMounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        if (isMounted) setHasCameraPermission(true);
      } catch (err: any) {
        console.warn('[Camera] Permission or hardware error:', err.message);
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
  }, [isScanModalOpen, currentScreen]);

  // Handle Torch / Flashlight Toggle
  const toggleFlash = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as any;
      if (capabilities && capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !isFlashOn } as any],
          });
          setIsFlashOn(!isFlashOn);
        } catch { /* Torch not supported */ }
      } else {
        setIsFlashOn(!isFlashOn);
      }
    }
  };

  /**
   * Resolve merchant code via API, then navigate to SendAmountScreen
   */
  const resolveMerchantAndNavigate = async (code: string) => {
    setResolveError(null);
    setIsResolving(true);
    try {
      const res = await fetch(`/api/merchants/${code.toUpperCase()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 404) {
          setResolveError(
            language === 'العربية'
              ? 'رمز التاجر غير موجود. تحقق من الرمز وحاول مجدداً.'
              : 'Merchant not found. Please check the code and try again.'
          );
        } else {
          setResolveError(data.message || 'Failed to resolve merchant');
        }
        return;
      }
      const merchant = await res.json();
      playBeep();
      if (navigator.vibrate) { try { navigator.vibrate([40, 60, 40]); } catch {} }
      setScanSuccessCode(code);
      setTimeout(() => {
        setIsScanModalOpen(false);
        setIsScanning(true);
        setScanSuccessCode(null);
        navigateTo('SEND_AMOUNT', {
          merchantCode: merchant.merchantCode,
          businessName: merchant.businessName,
        });
      }, 600);
    } catch {
      setResolveError(
        language === 'العربية'
          ? 'تعذر التحقق من التاجر. تحقق من الاتصال بالإنترنت.'
          : 'Could not verify merchant. Check your internet connection.'
      );
    } finally {
      setIsResolving(false);
    }
  };

  /**
   * Parse QR Code string
   */
  const parseAndProcessQr = (qrData: string) => {
    if (!isScanning) return;
    setIsScanning(false);

    let resolvedCode: string | null = null;
    const qpayMatch = qrData.match(/[?&]m=([A-Za-z0-9_-]+)/i);
    if (qpayMatch) {
      resolvedCode = qpayMatch[1];
    } else {
      const bareMatch = qrData.match(/^(QM\d{6,8})$/i);
      if (bareMatch) resolvedCode = bareMatch[1];
    }

    if (resolvedCode) {
      resolveMerchantAndNavigate(resolvedCode);
    } else {
      setResolveError(
        language === 'العربية'
          ? 'رمز الاستجابة السريعة (QR) غير صالح للدفع.'
          : 'Invalid QR code. Please scan a valid QPay QR code.'
      );
      setTimeout(() => {
        setIsScanning(true);
        setResolveError(null);
      }, 3000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim().toUpperCase();
    if (code.length < 8) return;
    resolveMerchantAndNavigate(code);
  };

  if (!isScanModalOpen && currentScreen !== 'SCAN') return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="QR Code Payment Scanner"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0B0B14',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: designSystem.typography.fontFamily,
      }}
    >
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
            {language === 'العربية' ? 'رمز QPay للتاجر' : 'QPay Merchant QR'}
          </span>
        </div>

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

        {/* Viewfinder Box */}
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
            border: scanSuccessCode
              ? '3px solid var(--brand-green, #7FE87F)'
              : '1.5px solid var(--brand-green-border, rgba(127, 232, 127, 0.35))',
            transition: 'border 0.3s ease',
          }}
        >
          {/* Corner Guides */}
          {[
            { top: 10, left: 10, borderTop: '4px solid #7FE87F', borderLeft: '4px solid #7FE87F', borderTopLeftRadius: '10px' },
            { top: 10, right: 10, borderTop: '4px solid #7FE87F', borderRight: '4px solid #7FE87F', borderTopRightRadius: '10px' },
            { bottom: 10, left: 10, borderBottom: '4px solid #7FE87F', borderLeft: '4px solid #7FE87F', borderBottomLeftRadius: '10px' },
            { bottom: 10, right: 10, borderBottom: '4px solid #7FE87F', borderRight: '4px solid #7FE87F', borderBottomRightRadius: '10px' },
          ].map((style, i) => (
            <div key={i} style={{ position: 'absolute', width: 32, height: 32, ...style }} />
          ))}

          {/* Animated Laser */}
          {isScanning && !scanSuccessCode && (
            <div
              className="scanner-laser"
              style={{
                width: '100%',
                height: '2px',
                backgroundColor: '#7FE87F',
                position: 'absolute',
                boxShadow: '0 0 12px #7FE87F, 0 0 4px #ffffff',
                animation: 'scanLaser 2.2s infinite ease-in-out alternate',
              }}
            />
          )}

          {/* Scan Success Overlay */}
          {scanSuccessCode && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(127, 232, 127, 0.16)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <CheckCircle size={48} color="#7FE87F" />
              <span style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '15px' }}>
                {language === 'العربية' ? 'تم التحقق!' : 'QR Verified!'}
              </span>
            </div>
          )}
        </div>

        {/* Status / Error */}
        <p
          style={{
            color: resolveError ? '#EF4444' : '#FFFFFF',
            fontSize: '12.5px',
            marginTop: '20px',
            fontWeight: '600',
            zIndex: 10,
            textAlign: 'center',
            backgroundColor: resolveError ? 'rgba(239,68,68,0.12)' : 'var(--color-surface, #111726)',
            border: `1px solid ${resolveError ? 'rgba(239,68,68,0.3)' : 'var(--color-border, rgba(255, 255, 255, 0.08))'}`,
            padding: '6px 16px',
            borderRadius: '20px',
            maxWidth: '280px',
          }}
        >
          {resolveError
            ? resolveError
            : hasCameraPermission === false
            ? (language === 'العربية' ? 'الكاميرا غير متاحة — أدخل الرمز يدوياً' : 'Camera unavailable — enter code manually')
            : t('scan.align_qr', 'Point at QPay merchant QR to pay')}
        </p>
      </div>

      {/* Bottom Actions */}
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
        {showManualEntry ? (
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder={language === 'العربية' ? 'مثال: QM123456' : 'e.g. QM123456'}
              maxLength={8}
              autoFocus
              style={{
                flex: 1,
                backgroundColor: '#182236',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '12px 14px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                fontFamily: 'monospace',
                outline: 'none',
                letterSpacing: '0.08em',
              }}
            />
            <button
              type="submit"
              disabled={manualCode.trim().length < 8 || isResolving}
              style={{
                backgroundColor: manualCode.trim().length >= 8 && !isResolving ? '#7FE87F' : '#2C2C44',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 18px',
                color: '#080C14',
                fontSize: '13px',
                fontWeight: 800,
                cursor: manualCode.trim().length >= 8 && !isResolving ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s',
              }}
            >
              {isResolving ? '...' : (language === 'العربية' ? 'دفع' : 'Pay')}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowManualEntry(true)}
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
            <Keyboard size={16} color="#7FE87F" />
            {language === 'العربية' ? 'أدخل رمز التاجر يدوياً' : 'Enter Merchant Code Manually'}
          </button>
        )}

        {/* Simulate scan for testing (web only) */}
        {hasCameraPermission === false && (
          <button
            onClick={() => parseAndProcessQr('qpay://pay?m=QM100001')}
            style={{
              backgroundColor: 'rgba(127,232,127,0.1)',
              border: '1px solid rgba(127,232,127,0.3)',
              borderRadius: designSystem.radii.md,
              padding: '10px',
              color: '#7FE87F',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Store size={14} /> {language === 'العربية' ? 'محاكاة مسح QR' : 'Simulate QR Scan (QM100001)'}
          </button>
        )}
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
