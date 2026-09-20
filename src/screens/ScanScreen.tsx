import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { designSystem } from '../design-system';
import {
  ScanHeader,
  ScanManualInputDrawer,
  ScanViewfinder,
  ScanPresetsBar,
  ScanBottomBar,
  playScanBeep,
  validateAndParseQR,
} from '../components/features/scan';

export const ScanScreen: React.FC = () => {
  const { isScanModalOpen, setIsScanModalOpen, contacts, navigateTo, t, language } = useApp();
  const isAr = language === 'العربية' || language === 'ar';

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isFlashOn, setIsFlashOn] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanSuccessContact, setScanSuccessContact] = useState<any | null>(null);
  const [qrValidationError, setQrValidationError] = useState<string | null>(null);
  const [unsupportedQrError, setUnsupportedQrError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualQrText, setManualQrText] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Trigger successful scan transition
  const handleScanSuccess = (contact: any, amount?: number) => {
    setIsScanning(false);
    setScanSuccessContact(contact);
    playScanBeep();
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

  const handleProcessRawQR = (rawText: string) => {
    setQrValidationError(null);
    const result = validateAndParseQR(rawText, isAr);
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

  const validateAndProcessQr = (payload: string, fallbackContact?: any, amount?: number) => {
    setUnsupportedQrError(null);

    const isValidPaymentScheme =
      payload.startsWith('sarie://pay') ||
      payload.startsWith('upi://pay') ||
      payload.includes('@sarie') ||
      payload.startsWith('QTPAY:');

    if (!isValidPaymentScheme) {
      setUnsupportedQrError(
        isAr
          ? '??? QR ??? ?????: ???? ??? ???? ????? ???????? ??? ??? ?? ??? ????? ???? ????.'
          : 'Unsupported QR Code: Only valid QPay, Sarie, and mada payment QR codes are supported.'
      );
      if (navigator.vibrate) {
        try { navigator.vibrate([100, 50, 100]); } catch {}
      }
      setTimeout(() => setUnsupportedQrError(null), 4000);
      return;
    }

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      <ScanHeader
        onClose={() => setIsScanModalOpen(false)}
        showManualInput={showManualInput}
        onToggleManualInput={() => setShowManualInput(!showManualInput)}
        isFlashOn={isFlashOn}
        onToggleFlash={toggleFlash}
        isAr={isAr}
        t={t}
      />

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

      <ScanManualInputDrawer
        show={showManualInput}
        value={manualQrText}
        onChange={setManualQrText}
        onSubmit={handleProcessRawQR}
        isAr={isAr}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ScanViewfinder
          hasCameraPermission={hasCameraPermission}
          videoRef={videoRef}
          isScanning={isScanning}
          scanSuccessContact={scanSuccessContact}
          isAr={isAr}
          alignText={t('scan.align_qr', 'Point at any QR code to pay')}
        />

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

        <ScanPresetsBar
          onSelectPreset={validateAndProcessQr}
          onSelectInvalid={(p) => validateAndProcessQr(p, null)}
          isAr={isAr}
        />
      </div>

      <ScanBottomBar
        onUploadClick={() => fileInputRef.current?.click()}
        onDemoPayClick={() => handleScanSuccess(contacts[0] || { name: 'Tariq Al-Otaibi', upiId: 'tariq@sarie' })}
        isAr={isAr}
        uploadLabel={t('scan.upload_gallery', 'Upload QR')}
      />

      <style>{`
        @keyframes scanLaser {
          0% { top: 6%; }
          100% { top: 94%; }
        }
      `}</style>
    </div>
  );
};
export default ScanScreen;
