/**
 * QPay Fintech Backend API Master Dispatcher
 * Phase 2 — Backend API Layer
 * 
 * Exposes documented type-safe endpoints backed by server-side validation,
 * idempotency, authentication derivation, and audit logging.
 */

import { AuthService } from './auth';
import { SplitExpenseService } from './services/SplitExpenseService';
import { TransferLimitsService } from './services/TransferLimitsService';
import { KycNafathService } from './services/KycNafathService';
import { TravelBookingService } from './services/TravelBookingService';
import type {
  CreateSplitRequest,
  SplitExpenseDto,
  DeclineMoneyRequest,
  DeclineMoneyResponseDto,
  UserTransferLimitsDto,
  UpdateTransferLimitsRequest,
  InitiateKycRequest,
  KycRecordDto,
  NafathCallbackPayload,
  CreateFlightBookingRequest,
  FlightBookingDto,
  CreateHotelReservationRequest,
  HotelReservationDto,
  CreateAirportServiceRequest,
  AirportServiceBookingDto,
  ApiResponse,
} from './types';

// Singleton service instances
const splitExpenseService = new SplitExpenseService();
const transferLimitsService = new TransferLimitsService();
const kycNafathService = new KycNafathService();
const travelBookingService = new TravelBookingService();

export const QPayApi = {
  /**
   * 1. Split Expenses & SARIE RTP Endpoints (USER-09, USER-10)
   */
  splits: {
    async create(
      req: CreateSplitRequest,
      options?: { authHeader?: string; idempotencyKey?: string }
    ): Promise<ApiResponse<SplitExpenseDto>> {
      try {
        const auth = await AuthService.verifySession(options?.authHeader);
        const data = await splitExpenseService.createSplit(auth, req, options?.idempotencyKey);
        return { success: true, data, timestamp: new Date().toISOString() };
      } catch (err: any) {
        return {
          success: false,
          errorCode: err.name || 'INTERNAL_ERROR',
          message: err.message || 'Failed to create split expense.',
          details: err.fieldErrors,
          timestamp: new Date().toISOString(),
        };
      }
    },

    async get(splitId: string, options?: { authHeader?: string }): Promise<ApiResponse<SplitExpenseDto>> {
      try {
        const auth = await AuthService.verifySession(options?.authHeader);
        const data = await splitExpenseService.getSplit(auth, splitId);
        return { success: true, data, timestamp: new Date().toISOString() };
      } catch (err: any) {
        return {
          success: false,
          errorCode: err.name || 'NOT_FOUND',
          message: err.message || 'Split expense not found.',
          timestamp: new Date().toISOString(),
        };
      }
    },

    async settle(
      splitId: string,
      memberId: string,
      options?: { authHeader?: string; idempotencyKey?: string }
    ): Promise<ApiResponse<SplitExpenseDto>> {
      try {
        const auth = await AuthService.verifySession(options?.authHeader);
        const data = await splitExpenseService.settleMemberShare(auth, splitId, memberId, options?.idempotencyKey);
        return { success: true, data, timestamp: new Date().toISOString() };
      } catch (err: any) {
        return {
          success: false,
          errorCode: err.name || 'SETTLEMENT_ERROR',
          message: err.message || 'Failed to settle participant share.',
          timestamp: new Date().toISOString(),
        };
      }
    },

    async decline(
      req: DeclineMoneyRequest,
      options?: { authHeader?: string; idempotencyKey?: string }
    ): Promise<ApiResponse<DeclineMoneyResponseDto>> {
      try {
        const auth = await AuthService.verifySession(options?.authHeader);
        const data = await splitExpenseService.declineRtpRequest(auth, req, options?.idempotencyKey);
        return { success: true, data, timestamp: new Date().toISOString() };
      } catch (err: any) {
        return {
          success: false,
          errorCode: err.name || 'DECLINE_ERROR',
          message: err.message || 'Failed to decline RTP money request.',
          timestamp: new Date().toISOString(),
        };
      }
    },

    async cancel(splitId: string, options?: { authHeader?: string }): Promise<ApiResponse<SplitExpenseDto>> {
      try {
        const auth = await AuthService.verifySession(options?.authHeader);
        const data = await splitExpenseService.cancelSplit(auth, splitId);
        return { success: true, data, timestamp: new Date().toISOString() };
      } catch (err: any) {
        return {
          success: false,
          errorCode: err.name || 'FORBIDDEN',
          message: err.message || 'Failed to cancel split expense.',
          timestamp: new Date().toISOString(),
        };
      }
    },
  },

  /**
   * 2. SAMA Transfer Limits Endpoints (USER-18)
   */
  limits: {
    async get(options?: { authHeader?: string }): Promise<ApiResponse<UserTransferLimitsDto>> {
      try {
        const auth = await AuthService.verifySession(options?.authHeader);
        const data = await transferLimitsService.getLimits(auth);
        return { success: true, data, timestamp: new Date().toISOString() };
      } catch (err: any) {
        return {
          success: false,
          errorCode: err.name || 'LIMIT_QUERY_ERROR',
          message: err.message || 'Failed to fetch transfer limits.',
          timestamp: new Date().toISOString(),
        };
      }
    },

    async update(
      req: UpdateTransferLimitsRequest,
      options?: { authHeader?: string; idempotencyKey?: string }
    ): Promise<ApiResponse<UserTransferLimitsDto>> {
      try {
        const auth = await AuthService.verifySession(options?.authHeader);
        const data = await transferLimitsService.updateLimits(auth, req, options?.idempotencyKey);
        return { success: true, data, timestamp: new Date().toISOString() };
      } catch (err: any) {
        return {
          success: false,
          errorCode: err.name || 'LIMIT_UPDATE_ERROR',
          message: err.message || 'Failed to update transfer limits.',
          details: err.fieldErrors,
          timestamp: new Date().toISOString(),
        };
      }
    },

    async validateAmount(amount: number, options?: { authHeader?: string }): Promise<boolean> {
      try {
        const auth = await AuthService.verifySession(options?.authHeader);
        return await transferLimitsService.validateTransactionWithinLimits(auth, amount);
      } catch {
        return false;
      }
    },
  },

  /**
   * 3. Re-KYC & Nafath Gateway Endpoints (USER-20)
   */
  kyc: {
    async initiateNafath(
      req: InitiateKycRequest,
      options?: { authHeader?: string; idempotencyKey?: string }
    ): Promise<ApiResponse<KycRecordDto>> {
      try {
        const auth = await AuthService.verifySession(options?.authHeader);
        const data = await kycNafathService.initiateVerification(auth, req, options?.idempotencyKey);
        return { success: true, data, timestamp: new Date().toISOString() };
      } catch (err: any) {
        return {
          success: false,
          errorCode: err.name || 'KYC_INITIATE_ERROR',
          message: err.message || 'Failed to initiate Nafath verification.',
          details: err.fieldErrors,
          timestamp: new Date().toISOString(),
        };
      }
    },

    async getStatus(options?: { authHeader?: string }): Promise<ApiResponse<KycRecordDto>> {
      try {
        const auth = await AuthService.verifySession(options?.authHeader);
        const data = await kycNafathService.getStatus(auth);
        return { success: true, data, timestamp: new Date().toISOString() };
      } catch (err: any) {
        return {
          success: false,
          errorCode: err.name || 'KYC_QUERY_ERROR',
          message: err.message || 'Failed to retrieve KYC status.',
          timestamp: new Date().toISOString(),
        };
      }
    },

    async processCallback(payload: NafathCallbackPayload): Promise<ApiResponse<KycRecordDto>> {
      try {
        const data = await kycNafathService.processNafathCallback(payload);
        return { success: true, data, timestamp: new Date().toISOString() };
      } catch (err: any) {
        return {
          success: false,
          errorCode: err.name || 'CALLBACK_ERROR',
          message: err.message || 'Failed to process Nafath callback.',
          timestamp: new Date().toISOString(),
        };
      }
    },
  },

  /**
   * 4. Travel & Booking Endpoints (USER-12 to USER-15)
   */
  travel: {
    async bookFlight(
      req: CreateFlightBookingRequest,
      options?: { authHeader?: string; idempotencyKey?: string }
    ): Promise<ApiResponse<FlightBookingDto>> {
      try {
        const auth = await AuthService.verifySession(options?.authHeader);
        const data = await travelBookingService.bookFlight(auth, req, options?.idempotencyKey);
        return { success: true, data, timestamp: new Date().toISOString() };
      } catch (err: any) {
        return {
          success: false,
          errorCode: err.name || 'BOOKING_ERROR',
          message: err.message || 'Failed to complete flight booking.',
          details: err.fieldErrors,
          timestamp: new Date().toISOString(),
        };
      }
    },

    async reserveHotel(
      req: CreateHotelReservationRequest,
      options?: { authHeader?: string; idempotencyKey?: string }
    ): Promise<ApiResponse<HotelReservationDto>> {
      try {
        const auth = await AuthService.verifySession(options?.authHeader);
        const data = await travelBookingService.reserveHotel(auth, req, options?.idempotencyKey);
        return { success: true, data, timestamp: new Date().toISOString() };
      } catch (err: any) {
        return {
          success: false,
          errorCode: err.name || 'HOTEL_ERROR',
          message: err.message || 'Failed to complete hotel reservation.',
          details: err.fieldErrors,
          timestamp: new Date().toISOString(),
        };
      }
    },

    async bookAirportService(
      req: CreateAirportServiceRequest,
      options?: { authHeader?: string; idempotencyKey?: string }
    ): Promise<ApiResponse<AirportServiceBookingDto>> {
      try {
        const auth = await AuthService.verifySession(options?.authHeader);
        const data = await travelBookingService.bookAirportService(auth, req, options?.idempotencyKey);
        return { success: true, data, timestamp: new Date().toISOString() };
      } catch (err: any) {
        return {
          success: false,
          errorCode: err.name || 'AIRPORT_ERROR',
          message: err.message || 'Failed to complete airport service booking.',
          details: err.fieldErrors,
          timestamp: new Date().toISOString(),
        };
      }
    },
  },
};
