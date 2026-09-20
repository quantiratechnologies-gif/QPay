import type { SaudiBankOption } from './types';

export const SAUDI_BANKS: SaudiBankOption[] = [
  { name: 'Al Rajhi Bank', category: 'Fast Connect' },
  { name: 'Saudi National Bank (SNB)', category: 'Fast Connect' },
  { name: 'Riyad Bank', category: 'Fast Connect' },
  { name: 'Alinma Bank', category: 'Fast Connect' },
  { name: 'Saudi Awwal Bank (SAB)', category: 'Fast Connect' },
  { name: 'Banque Saudi Fransi (BSFR)', category: 'Fast Connect' },
  { name: 'Arab National Bank (ANB)', category: 'Fast Connect' },
  { name: 'Bank AlJazira', category: 'Fast Connect' },
  { name: 'Gulf International Bank (GIB)', category: 'Fast Connect' },
  { name: 'D360 Bank', category: 'Digital Bank' },
];

export const SAUDI_MADA_BINS = [
  '458838', '588845', '440647', '440795', '446404', '457865', '968201', '484783', // Al Rajhi
  '588846', '417633', '446393', '409201', '486094', '489318', // SNB
  '455708', '455036', '446672', '543357', '588847', '483010', // Riyad
  '422817', '422818', '422819', '428671', '428672', '428673', // Alinma
  '406136', '410621', '432328', '422674', '486095', // SAB
  '458456', '462220', // BSFR
  '419356', '439954', '530060', '588848', // ANB
  '446394', '604906', // AlJazira
  '457997', // GIB
  '428331', // D360
];
