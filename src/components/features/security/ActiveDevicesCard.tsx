import React from 'react';
import { Smartphone, Monitor, LogOut } from 'lucide-react';
import { formatLocalizedNumber, translateText } from '../../../utils/i18n';
import type { DeviceSession } from '../../../types';

interface ActiveDevicesCardProps {
  deviceSessions: DeviceSession[];
  onTerminateSession: (id: string) => void;
  language: string;
  isAr?: boolean;
}

export const ActiveDevicesCard: React.FC<ActiveDevicesCardProps> = ({
  deviceSessions,
  onTerminateSession,
  language,
}) => {
  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          color: '#8E9BAE',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '12px',
          paddingInlineStart: '4px',
        }}
      >
        {translateText('Active Devices', language)} ({formatLocalizedNumber(deviceSessions.length, language)})
      </div>

      <div
        style={{
          backgroundColor: '#111726',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
        }}
      >
        {deviceSessions.map((session, index) => (
          <React.Fragment key={session.id}>
            {index > 0 && <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)', margin: '0 16px' }} />}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                backgroundColor: session.isCurrent ? 'rgba(127, 232, 127, 0.08)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: '#182236',
                    color: session.isCurrent ? '#7FE87F' : '#8E9BAE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {session.deviceType === 'mobile' ? <Smartphone size={20} /> : <Monitor size={20} />}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#FFFFFF' }}>
                    {session.deviceName}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#8E9BAE', marginTop: '2px' }}>
                    {session.location} • {translateText(session.lastActive, language)}
                  </div>
                </div>
              </div>

              {session.isCurrent ? (
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    color: '#080C14',
                    backgroundColor: '#7FE87F',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {translateText('Current', language)}
                </span>
              ) : (
                <button
                  onClick={() => onTerminateSession(session.id)}
                  className="interactive-tap"
                  style={{
                    backgroundColor: '#182236',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#8E9BAE',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <LogOut size={12} /> {translateText('End', language)}
                </button>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
