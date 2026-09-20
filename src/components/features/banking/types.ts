export interface SaudiBankOption {
  name: string;
  category: string;
}

export type MatchMethod = 'mobile' | 'iban' | 'card';
export type BankStep = 'SELECT_AND_MATCH' | 'AUTHORIZE_AND_CONNECT';
