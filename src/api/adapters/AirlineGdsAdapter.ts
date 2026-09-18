/**
 * Airline NDC / GDS Adapter Scaffolding
 * Phase 3A — Integration Adapter Scaffolding
 * 
 * Rules:
 * - Implements IFlightBookingService.
 * - In 'mock' mode: generates valid PNRs and booking confirmations.
 * - In 'sandbox' / 'production': requires IATA NDC aggregator credentials.
 * - Fabricates NO fake airline APIs or NDC endpoints.
 */

import { ProviderConfig } from './config';
import type {
  AuthContext,
  CreateFlightBookingRequest,
  FlightBookingDto,
} from '../types';
import type { IFlightBookingService } from '../services/interfaces';

export class AirlineGdsAdapter implements IFlightBookingService {
  private static REQUIRED_VARS = [
    'FLIGHT_GDS_API_URL',
    'FLIGHT_GDS_API_KEY',
    'FLIGHT_GDS_OFFICE_ID',
  ];

  async bookFlight(
    _auth: AuthContext,
    req: CreateFlightBookingRequest,
    _idempotencyKey?: string
  ): Promise<FlightBookingDto> {
    const mode = ProviderConfig.getProviderMode('airline_gds');

    if (mode === 'mock') {
      const pnr = `${req.airlineCode || 'SV'}${Math.floor(10000 + Math.random() * 89999)}`;
      const nowIso = new Date().toISOString();

      return {
        id: `bk-fl-${Date.now()}`,
        pnr,
        airlineCode: req.airlineCode || 'SV',
        flightNumber: req.flightNumber,
        originCode: req.originCode || 'RUH',
        destinationCode: req.destinationCode || 'JED',
        departureTime: req.departureTime || nowIso,
        arrivalTime: req.arrivalTime || nowIso,
        cabinClass: req.cabinClass || 'ECONOMY',
        passengerCount: req.passengers?.length || 1,
        totalAmount: req.totalAmount,
        status: 'confirmed',
        paymentUtr: `SARIE-FL-${Date.now()}`,
        createdAt: nowIso,
      };
    }

    ProviderConfig.assertReady('airline_gds', AirlineGdsAdapter.REQUIRED_VARS);

    // [EXTERNAL_SPEC_REQUIRED]: IATA NDC OrderCreate XML/JSON request
    throw new Error('[EXTERNAL_SPEC_REQUIRED] Live airline NDC booking requires official aggregator credentials.');
  }

  async getFlightBooking(_auth: AuthContext, bookingId: string): Promise<FlightBookingDto> {
    const mode = ProviderConfig.getProviderMode('airline_gds');

    if (mode === 'mock') {
      return {
        id: bookingId,
        pnr: 'SV10948',
        airlineCode: 'SV',
        flightNumber: 'SV1024',
        originCode: 'RUH',
        destinationCode: 'JED',
        departureTime: new Date().toISOString(),
        arrivalTime: new Date().toISOString(),
        cabinClass: 'ECONOMY',
        passengerCount: 1,
        totalAmount: 650.0,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };
    }

    ProviderConfig.assertReady('airline_gds', AirlineGdsAdapter.REQUIRED_VARS);

    // [EXTERNAL_SPEC_REQUIRED]: IATA NDC OrderRetrieve request
    throw new Error('[EXTERNAL_SPEC_REQUIRED] Live airline NDC retrieval requires official aggregator credentials.');
  }
}
