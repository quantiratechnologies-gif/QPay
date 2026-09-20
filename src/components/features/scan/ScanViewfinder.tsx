import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ScanViewfinderProps {
  hasCameraPermission: boolean | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isScanning: boolean;
  scanSuccessContact: any | null;
  isAr: boolean;
  alignText: string;
}

export const ScanViewfinder: React.FC<ScanViewfinderProps> = ({
  hasCameraPermission,
  videoRef,
  isScanning,
  scanSuccessContact,
  isAr,
  alignText,
}) => {
  return (
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
              {isAr ? '?? ?????? ?? ????? ?????!' : 'QR Verified!'}
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
          ? isAr
            ? '???????? ??? ?????? ???? ????? ??????:'
            : 'Camera unavailable. Tap demo recipient:'
          : alignText}
      </p>
    </div>
  );
};
