// PLACEHOLDER - must be replaced by legal counsel before release.
/**
 * Terms and Conditions (English)
 * PLACEHOLDER - must be replaced by legal counsel before release.
 */

export interface LegalSection {
  id: string;
  heading: string;
  body: string;
}

export interface LegalDocument {
  title: string;
  version: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const termsDocumentEn: LegalDocument = {
  title: 'Terms and Conditions',
  version: 'v1.0',
  lastUpdated: 'September 24, 2026',
  sections: [
    {
      id: 'eligibility-kyc',
      heading: 'Eligibility & KYC',
      body: '[PLACEHOLDER - Details regarding customer eligibility criteria, age requirements, and mandatory National ID / Iqama and Nafath KYC verification under Saudi Arabian Monetary Authority (SAMA) regulations will be specified by legal counsel.]',
    },
    {
      id: 'services-provided',
      heading: 'Services Provided',
      body: '[PLACEHOLDER - Scope of digital payment services, peer-to-peer transfers via Sarie/IPS, utility bill payments, and merchant QR settlements will be defined by legal counsel.]',
    },
    {
      id: 'account-security-pin',
      heading: 'Account Security & PIN',
      body: '[PLACEHOLDER - Rules concerning account holder responsibilities, safeguarding authentication credentials, PIN security, biometric authentication, and reporting unauthorized access.]',
    },
    {
      id: 'fees-charges',
      heading: 'Fees & Charges',
      body: '[PLACEHOLDER - Detailed fee schedule, transfer fees, foreign exchange markups, and Value Added Tax (VAT) disclosures in compliance with ZATCA and SAMA requirements.]',
    },
    {
      id: 'transaction-limits',
      heading: 'Transaction Limits',
      body: '[PLACEHOLDER - Daily, monthly, and single transaction velocity limits applicable per KYC tier and account standing.]',
    },
    {
      id: 'refunds-disputes',
      heading: 'Refunds, Chargebacks & Disputes',
      body: '[PLACEHOLDER - Policies, procedures, and timelines for submitting dispute claims, payment revocations, and refund settlements under applicable local banking frameworks.]',
    },
    {
      id: 'prohibited-use',
      heading: 'Prohibited Use',
      body: '[PLACEHOLDER - Explicit prohibitions against money laundering, terror financing, fraudulent transactions, commercial resale without authorization, and unlawful activities.]',
    },
    {
      id: 'liability-limits',
      heading: 'Liability Limits',
      body: '[PLACEHOLDER - Disclaimers, service availability commitments, limits of financial liability, and force majeure conditions.]',
    },
    {
      id: 'suspension-termination',
      heading: 'Suspension & Termination',
      body: '[PLACEHOLDER - Circumstances under which accounts may be restricted, frozen, or terminated for regulatory non-compliance, suspicious activity, or breach of terms.]',
    },
    {
      id: 'governing-law',
      heading: 'Governing Law & Dispute Resolution',
      body: '[PLACEHOLDER - Jurisdiction of the Kingdom of Saudi Arabia and arbitration/dispute mechanisms before the Committee for Banking and Financial Disputes and Violations.]',
    },
    {
      id: 'changes-to-terms',
      heading: 'Changes to Terms',
      body: '[PLACEHOLDER - Prior notification periods, mechanism of delivery for amendments, and customer options upon modification of terms.]',
    },
    {
      id: 'contact',
      heading: 'Contact',
      body: '[PLACEHOLDER - Official customer care channels, regulatory support contacts, corporate address, and licensing registration details.]',
    },
  ],
};
