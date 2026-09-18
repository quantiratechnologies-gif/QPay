/**
 * QPay Provider Configuration & Mode Resolver
 * Phase 3A — Integration Adapter Scaffolding
 * 
 * Rules:
 * 1. Explicit separation between 'mock', 'sandbox', and 'production'.
 * 2. Never exposes private keys, certificates, or secrets to the browser.
 * 3. Clearly asserts EXTERNAL_SPEC_REQUIRED when a required configuration is missing.
 */

export type ProviderMode = 'mock' | 'sandbox' | 'production';

export interface ProviderConfigStatus {
  providerKey: string;
  providerName: string;
  mode: ProviderMode;
  isConfigured: boolean;
  requiredEnvVars: string[];
  missingEnvVars: string[];
  statusNote: string;
}

export class ProviderNotConfiguredError extends Error {
  public providerKey: string;
  public missingVars: string[];

  constructor(providerKey: string, missingVars: string[], message?: string) {
    const detail = missingVars.length > 0 ? ` Missing required configuration: [${missingVars.join(', ')}].` : '';
    super(message || `[EXTERNAL_SPEC_REQUIRED] Provider '${providerKey}' is not configured for non-mock execution.${detail}`);
    this.name = 'ProviderNotConfiguredError';
    this.providerKey = providerKey;
    this.missingVars = missingVars;
  }
}

export class ProviderConfig {
  /**
   * Helper to safely read env variables in Vite or Node runtime without crashing
   */
  static getEnv(key: string): string | undefined {
    if (typeof import.meta !== 'undefined' && import.meta?.env) {
      return import.meta.env[key];
    }
    const proc = (globalThis as any).process;
    return proc?.env?.[key];
  }

  /**
   * Resolves the configured execution mode for a given provider track
   */
  static getProviderMode(providerKey: string): ProviderMode {
    const envKey = `VITE_${providerKey.toUpperCase()}_MODE`;
    const configuredMode = this.getEnv(envKey)?.toLowerCase();

    if (configuredMode === 'production') return 'production';
    if (configuredMode === 'sandbox') return 'sandbox';
    return 'mock'; // Safe default
  }

  /**
   * Validates required environment variables for a given provider
   */
  static validate(_providerKey: string, requiredVars: string[]): { isConfigured: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const v of requiredVars) {
      const val = this.getEnv(v);
      if (!val || val.trim().length === 0 || val.includes('placeholder') || val.includes('CHANGE_ME')) {
        missing.push(v);
      }
    }

    return {
      isConfigured: missing.length === 0,
      missing,
    };
  }

  /**
   * Asserts that a provider has all required configuration for its active mode.
   * If in 'mock' mode, always passes. If in 'sandbox' or 'production', raises ProviderNotConfiguredError if incomplete.
   */
  static assertReady(providerKey: string, requiredVars: string[]): void {
    const mode = this.getProviderMode(providerKey);
    if (mode === 'mock') return;

    const { isConfigured, missing } = this.validate(providerKey, requiredVars);
    if (!isConfigured) {
      throw new ProviderNotConfiguredError(
        providerKey,
        missing,
        `[EXTERNAL_SPEC_REQUIRED] Cannot connect to ${mode.toUpperCase()} for '${providerKey}'. Required provider specifications / credentials are missing.`
      );
    }
  }

  /**
   * Returns a diagnostic overview of all 6 external integration tracks
   */
  static getSystemStatus(): Record<string, ProviderConfigStatus> {
    const definitions: Record<string, { name: string; vars: string[] }> = {
      sarie: {
        name: 'SARIE IPS / RTP Switch',
        vars: ['SARIE_IPS_GATEWAY_URL', 'SARIE_PARTICIPANT_BIC', 'SARIE_MTLS_CERT', 'SARIE_SIGNING_KEY'],
      },
      nafath: {
        name: 'NIC Nafath IAM',
        vars: ['NAFATH_GATEWAY_URL', 'NAFATH_SP_ID', 'NAFATH_CLIENT_SECRET', 'NAFATH_PRIVATE_KEY'],
      },
      open_banking: {
        name: 'SAMA Open Banking Standard',
        vars: ['OB_GATEWAY_URL', 'OB_TPP_CLIENT_ID', 'OB_QWAC_CERT', 'OB_QSEAL_KEY'],
      },
      airline_gds: {
        name: 'Airline NDC / GDS',
        vars: ['FLIGHT_GDS_API_URL', 'FLIGHT_GDS_API_KEY', 'FLIGHT_GDS_OFFICE_ID'],
      },
      hotel_bedbank: {
        name: 'Hotel GDS / Bed-Bank',
        vars: ['HOTEL_API_URL', 'HOTEL_API_KEY', 'HOTEL_API_SECRET'],
      },
      airport_services: {
        name: 'Airport Chauffeur & VIP Lounge',
        vars: ['AIRPORT_SERVICES_API_URL', 'AIRPORT_SERVICES_CLIENT_ID', 'AIRPORT_SERVICES_SECRET'],
      },
    };

    const result: Record<string, ProviderConfigStatus> = {};

    for (const [key, def] of Object.entries(definitions)) {
      const mode = this.getProviderMode(key);
      const { isConfigured, missing } = this.validate(key, def.vars);

      result[key] = {
        providerKey: key,
        providerName: def.name,
        mode,
        isConfigured: mode === 'mock' ? true : isConfigured,
        requiredEnvVars: def.vars,
        missingEnvVars: missing,
        statusNote:
          mode === 'mock'
            ? 'Running in safe local mock simulation.'
            : isConfigured
            ? `Configured for ${mode} connection.`
            : `EXTERNAL_SPEC_REQUIRED: Missing ${missing.length} credentials.`,
      };
    }

    return result;
  }
}
