/**
 * SARIE Request to Pay (RTP) Adapter Scaffolding
 * Phase 3A — Integration Adapter Scaffolding
 * 
 * Rules:
 * - Implements ISarieRtpService interface.
 * - In 'mock' mode: safe, deterministic simulation.
 * - In 'sandbox' / 'production': requires verified specifications and certificates.
 * - Fabricates NO fake endpoints, ISO message payloads, or certificates.
 */

import { ProviderConfig } from './config';
import type { ISarieRtpService } from '../services/interfaces';

export class SarieRtpAdapter implements ISarieRtpService {
  private static REQUIRED_VARS = [
    'SARIE_IPS_GATEWAY_URL',
    'SARIE_PARTICIPANT_BIC',
    'SARIE_MTLS_CERT',
    'SARIE_SIGNING_KEY',
  ];

  async dispatchRtpMessage(_params: {
    rtpRef: string;
    debtorUpiId: string;
    debtorMobile: string;
    creditorUpiId: string;
    amount: number;
    title: string;
  }): Promise<{ accepted: boolean; switchReference: string; status: 'DISPATCHED' | 'FAILED' }> {
    const mode = ProviderConfig.getProviderMode('sarie');

    if (mode === 'mock') {
      // Mock Sandbox Simulation
      return {
        accepted: true,
        switchReference: `SARIE-SWITCH-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        status: 'DISPATCHED',
      };
    }

    // Sandbox / Production check
    ProviderConfig.assertReady('sarie', SarieRtpAdapter.REQUIRED_VARS);

    // [EXTERNAL_SPEC_REQUIRED]: Authoritative SAMA / Saudi Payments IPS connection logic goes here once specs/certs are provided.
    throw new Error('[EXTERNAL_SPEC_REQUIRED] Live SARIE IPS integration requires official Saudi Payments participant specifications.');
  }

  async declineRtpMessage(_params: {
    rtpRef: string;
    reasonCode: string;
  }): Promise<{ accepted: boolean; status: 'DECLINED' | 'FAILED' }> {
    const mode = ProviderConfig.getProviderMode('sarie');

    if (mode === 'mock') {
      return {
        accepted: true,
        status: 'DECLINED',
      };
    }

    ProviderConfig.assertReady('sarie', SarieRtpAdapter.REQUIRED_VARS);

    // [EXTERNAL_SPEC_REQUIRED]: ISO 20022 pain.014 Payment Status Report rejection dispatch
    throw new Error('[EXTERNAL_SPEC_REQUIRED] Live SARIE RTP decline requires official Saudi Payments participant specifications.');
  }
}
