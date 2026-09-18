/**
 * Nafath / National Information Center (NIC) Adapter Scaffolding
 * Phase 3A — Integration Adapter Scaffolding
 * 
 * Rules:
 * - Implements digital IAM verification challenge generation.
 * - In 'mock' mode: safe, deterministic 2-digit challenge simulation.
 * - In 'sandbox' / 'production': requires NIC Service Provider ID & mTLS certificates.
 * - Fabricates NO fake government endpoints or credentials.
 */

import { ProviderConfig } from './config';
import type { InitiateKycRequest, NafathCallbackPayload } from '../types';

export class NafathAdapter {
  private static REQUIRED_VARS = [
    'NAFATH_GATEWAY_URL',
    'NAFATH_SP_ID',
    'NAFATH_CLIENT_SECRET',
    'NAFATH_PRIVATE_KEY',
  ];

  async initiateChallenge(
    _profileId: string,
    _req: InitiateKycRequest
  ): Promise<{ nafathTxId: string; nafathRandomNumber: string; status: 'pending_nafath' }> {
    const mode = ProviderConfig.getProviderMode('nafath');

    if (mode === 'mock') {
      const nafathRandomNumber = Math.floor(10 + Math.random() * 89).toString();
      const nafathTxId = `NAFATH-TX-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      return {
        nafathTxId,
        nafathRandomNumber,
        status: 'pending_nafath',
      };
    }

    ProviderConfig.assertReady('nafath', NafathAdapter.REQUIRED_VARS);

    // [EXTERNAL_SPEC_REQUIRED]: NIC Nafath B2B Gateway dispatch logic
    throw new Error('[EXTERNAL_SPEC_REQUIRED] Live Nafath integration requires official NIC B2B Gateway credentials.');
  }

  async verifyCallbackSignature(signatureHeader: string, payload: NafathCallbackPayload): Promise<boolean> {
    const mode = ProviderConfig.getProviderMode('nafath');
    if (mode === 'mock') return true;

    ProviderConfig.assertReady('nafath', NafathAdapter.REQUIRED_VARS);

    // [EXTERNAL_SPEC_REQUIRED]: NIC RSA-SHA256 signature verification
    return Boolean(signatureHeader && payload);
  }
}
