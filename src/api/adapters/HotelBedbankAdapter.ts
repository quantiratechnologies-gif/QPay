/**
 * Hotel Bed-Bank / GDS Adapter Scaffolding
 * Phase 3A — Integration Adapter Scaffolding
 * 
 * Rules:
 * - Implements IHotelBookingService.
 * - In 'mock' mode: generates valid hotel confirmation codes and reservations.
 * - In 'sandbox' / 'production': requires Bed-Bank API key and signature secret.
 * - Fabricates NO fake hotel partner endpoints.
 */

import { ProviderConfig } from './config';
import type {
  AuthContext,
  CreateHotelReservationRequest,
  HotelReservationDto,
} from '../types';
import type { IHotelBookingService } from '../services/interfaces';

export class HotelBedbankAdapter implements IHotelBookingService {
  private static REQUIRED_VARS = [
    'HOTEL_API_URL',
    'HOTEL_API_KEY',
    'HOTEL_API_SECRET',
  ];

  async reserveHotel(
    _auth: AuthContext,
    req: CreateHotelReservationRequest,
    _idempotencyKey?: string
  ): Promise<HotelReservationDto> {
    const mode = ProviderConfig.getProviderMode('hotel_bedbank');

    if (mode === 'mock') {
      const confirmationCode = `HT-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowIso = new Date().toISOString();

      return {
        id: `bk-ht-${Date.now()}`,
        confirmationCode,
        hotelName: req.hotelName,
        city: req.city,
        roomType: req.roomType || 'Deluxe King',
        checkInDate: req.checkInDate,
        checkOutDate: req.checkOutDate,
        guestCount: req.guestCount || 1,
        totalAmount: req.totalAmount,
        status: 'confirmed',
        createdAt: nowIso,
      };
    }

    ProviderConfig.assertReady('hotel_bedbank', HotelBedbankAdapter.REQUIRED_VARS);

    // [EXTERNAL_SPEC_REQUIRED]: Bed-Bank Booking API Request
    throw new Error('[EXTERNAL_SPEC_REQUIRED] Live hotel bed-bank reservation requires official partner credentials.');
  }

  async getHotelReservation(_auth: AuthContext, reservationId: string): Promise<HotelReservationDto> {
    const mode = ProviderConfig.getProviderMode('hotel_bedbank');

    if (mode === 'mock') {
      return {
        id: reservationId,
        confirmationCode: 'HT-598210',
        hotelName: 'The St. Regis Red Sea',
        city: 'Red Sea Project',
        roomType: 'Overwater Villa',
        checkInDate: '2026-10-20',
        checkOutDate: '2026-10-23',
        guestCount: 2,
        totalAmount: 4500.0,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };
    }

    ProviderConfig.assertReady('hotel_bedbank', HotelBedbankAdapter.REQUIRED_VARS);

    // [EXTERNAL_SPEC_REQUIRED]: Bed-Bank Booking Detail Retrieval
    throw new Error('[EXTERNAL_SPEC_REQUIRED] Live hotel reservation retrieval requires official partner credentials.');
  }
}
