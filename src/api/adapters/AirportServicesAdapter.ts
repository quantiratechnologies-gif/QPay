/**
 * Airport VIP Services & Chauffeur Adapter Scaffolding
 * Phase 3A — Integration Adapter Scaffolding
 * 
 * Rules:
 * - Implements IAirportBookingService.
 * - In 'mock' mode: generates valid airport VIP booking references and dispatch vouchers.
 * - In 'sandbox' / 'production': requires Airport Partner / Fleet Dispatch Client ID & Secret.
 * - Fabricates NO fake chauffeur partner endpoints.
 */

import { ProviderConfig } from './config';
import type {
  AuthContext,
  CreateAirportServiceRequest,
  AirportServiceBookingDto,
} from '../types';
import type { IAirportBookingService } from '../services/interfaces';

export class AirportServicesAdapter implements IAirportBookingService {
  private static REQUIRED_VARS = [
    'AIRPORT_SERVICES_API_URL',
    'AIRPORT_SERVICES_CLIENT_ID',
    'AIRPORT_SERVICES_SECRET',
  ];

  async bookAirportService(
    _auth: AuthContext,
    req: CreateAirportServiceRequest,
    _idempotencyKey?: string
  ): Promise<AirportServiceBookingDto> {
    const mode = ProviderConfig.getProviderMode('airport_services');

    if (mode === 'mock') {
      const bookingRef = `VIP-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowIso = new Date().toISOString();

      return {
        id: `bk-ap-${Date.now()}`,
        bookingRef,
        serviceType: req.serviceType,
        airportCode: req.airportCode,
        serviceDate: req.serviceDate,
        passengerCount: req.passengerCount || 1,
        totalAmount: req.totalAmount,
        status: 'confirmed',
        createdAt: nowIso,
      };
    }

    ProviderConfig.assertReady('airport_services', AirportServicesAdapter.REQUIRED_VARS);

    // [EXTERNAL_SPEC_REQUIRED]: Airport Services / Chauffeur Fleet API Request
    throw new Error('[EXTERNAL_SPEC_REQUIRED] Live airport VIP booking requires official partner fleet credentials.');
  }

  async getAirportBooking(_auth: AuthContext, bookingId: string): Promise<AirportServiceBookingDto> {
    const mode = ProviderConfig.getProviderMode('airport_services');

    if (mode === 'mock') {
      return {
        id: bookingId,
        bookingRef: 'VIP-482019',
        serviceType: 'chauffeur',
        airportCode: 'RUH',
        serviceDate: '2026-10-15',
        passengerCount: 1,
        totalAmount: 180.0,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };
    }

    ProviderConfig.assertReady('airport_services', AirportServicesAdapter.REQUIRED_VARS);

    // [EXTERNAL_SPEC_REQUIRED]: Airport Services Status Query
    throw new Error('[EXTERNAL_SPEC_REQUIRED] Live airport booking retrieval requires official partner fleet credentials.');
  }
}
