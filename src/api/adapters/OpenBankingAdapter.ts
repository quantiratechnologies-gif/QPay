/**
 * SAMA Open Banking Adapter Scaffolding
 * Phase 3A — Integration Adapter Scaffolding
 * 
 * Rules:
 * - Scaffolding for Account Information Services (AIS) and Payment Initiation Services (PIS).
 * - In 'mock' mode: returns safe deterministic banking balances and linked accounts.
 * - In 'sandbox' / 'production': requires SAMA Open Banking TPP registration and QWAC/QSeal certs.
 * - Fabricates NO fake bank APIs or OAuth FAPI endpoints.
 */

import { ProviderConfig } from './config';

export interface BankAccountBalanceDto {
  bankId: string;
  bankName: string;
  iban: string;
  currency: string;
  availableBalance: number;
  lastUpdated: string;
}

export interface IOpenBankingService {
  getAccountBalances(profileId: string, consentId?: string): Promise<BankAccountBalanceDto[]>;
  initiateConsent(profileId: string, bankId: string): Promise<{ consentId: string; authUrl: string }>;
}

export class OpenBankingAdapter implements IOpenBankingService {
  private static REQUIRED_VARS = [
    'OB_GATEWAY_URL',
    'OB_TPP_CLIENT_ID',
    'OB_QWAC_CERT',
    'OB_QSEAL_KEY',
  ];

  async getAccountBalances(_profileId: string, _consentId?: string): Promise<BankAccountBalanceDto[]> {
    const mode = ProviderConfig.getProviderMode('open_banking');

    if (mode === 'mock') {
      return [
        {
          bankId: 'bank-alrajhi',
          bankName: 'Al Rajhi Bank',
          iban: 'SA0380000000608010167519',
          currency: 'SAR',
          availableBalance: 48250.0,
          lastUpdated: new Date().toISOString(),
        },
        {
          bankId: 'bank-snb',
          bankName: 'Saudi National Bank (SNB)',
          iban: 'SA4410000000123456789012',
          currency: 'SAR',
          availableBalance: 19800.0,
          lastUpdated: new Date().toISOString(),
        },
      ];
    }

    ProviderConfig.assertReady('open_banking', OpenBankingAdapter.REQUIRED_VARS);

    // [EXTERNAL_SPEC_REQUIRED]: SAMA Open Banking FAPI AIS Call
    throw new Error('[EXTERNAL_SPEC_REQUIRED] Live Open Banking integration requires official SAMA TPP credentials.');
  }

  async initiateConsent(_profileId: string, _bankId: string): Promise<{ consentId: string; authUrl: string }> {
    const mode = ProviderConfig.getProviderMode('open_banking');

    if (mode === 'mock') {
      return {
        consentId: `OB-CONSENT-MOCK-${Date.now()}`,
        authUrl: 'https://qtpay.local/mock-bank-consent',
      };
    }

    ProviderConfig.assertReady('open_banking', OpenBankingAdapter.REQUIRED_VARS);

    // [EXTERNAL_SPEC_REQUIRED]: SAMA Open Banking Consent Initiation Flow
    throw new Error('[EXTERNAL_SPEC_REQUIRED] Live Open Banking Consent requires official SAMA TPP credentials.');
  }
}
