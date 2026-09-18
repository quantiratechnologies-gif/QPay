/**
 * QPay External Provider Adapters Index
 * Phase 3A — Integration Adapter Scaffolding
 */

export * from './config';
export * from './SarieRtpAdapter';
export * from './NafathAdapter';
export * from './OpenBankingAdapter';
export * from './AirlineGdsAdapter';
export * from './HotelBedbankAdapter';
export * from './AirportServicesAdapter';

import { SarieRtpAdapter } from './SarieRtpAdapter';
import { NafathAdapter } from './NafathAdapter';
import { OpenBankingAdapter } from './OpenBankingAdapter';
import { AirlineGdsAdapter } from './AirlineGdsAdapter';
import { HotelBedbankAdapter } from './HotelBedbankAdapter';
import { AirportServicesAdapter } from './AirportServicesAdapter';

export const ProviderAdapters = {
  sarie: new SarieRtpAdapter(),
  nafath: new NafathAdapter(),
  openBanking: new OpenBankingAdapter(),
  airlineGds: new AirlineGdsAdapter(),
  hotelBedbank: new HotelBedbankAdapter(),
  airportServices: new AirportServicesAdapter(),
};
