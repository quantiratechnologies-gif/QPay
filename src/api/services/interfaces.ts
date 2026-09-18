/**
 * QPay Service Boundaries & Interfaces
 * Phase 2 — Backend API Layer
 * 
 * Rules:
 * - All external systems (SARIE, SAMA, Nafath, Travel GDS) sit behind service interfaces.
 * - Missing external provider specs are explicitly annotated with `EXTERNAL_SPEC_REQUIRED`.
 */

import type {
  AuthContext,
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
} from '../types';

/**
 * 1. Split Expenses & Peer Settlement Interface
 */
export interface ISplitExpenseService {
  createSplit(auth: AuthContext, req: CreateSplitRequest, idempotencyKey?: string): Promise<SplitExpenseDto>;
  getSplit(auth: AuthContext, splitId: string): Promise<SplitExpenseDto>;
  settleMemberShare(auth: AuthContext, splitId: string, memberId: string, idempotencyKey?: string): Promise<SplitExpenseDto>;
  cancelSplit(auth: AuthContext, splitId: string): Promise<SplitExpenseDto>;
  declineRtpRequest(auth: AuthContext, req: DeclineMoneyRequest, idempotencyKey?: string): Promise<DeclineMoneyResponseDto>;
}

/**
 * 2. SARIE Request to Pay (RTP) Switch Interface
 * [EXTERNAL_SPEC_REQUIRED] SAMA SARIE Instant Payment Switch IPS pain.013/pain.014 ISO 20022 specs.
 */
export interface ISarieRtpService {
  dispatchRtpMessage(params: {
    rtpRef: string;
    debtorUpiId: string;
    debtorMobile: string;
    creditorUpiId: string;
    amount: number;
    title: string;
  }): Promise<{ accepted: boolean; switchReference: string; status: 'DISPATCHED' | 'FAILED' }>;

  declineRtpMessage(params: {
    rtpRef: string;
    reasonCode: string;
  }): Promise<{ accepted: boolean; status: 'DECLINED' | 'FAILED' }>;
}

/**
 * 3. Transfer Limits Service Interface
 */
export interface ITransferLimitsService {
  getLimits(auth: AuthContext): Promise<UserTransferLimitsDto>;
  updateLimits(auth: AuthContext, req: UpdateTransferLimitsRequest, idempotencyKey?: string): Promise<UserTransferLimitsDto>;
  validateTransactionWithinLimits(auth: AuthContext, amount: number): Promise<boolean>;
}

/**
 * 4. KYC & Nafath Digital IAM Interface
 * [EXTERNAL_SPEC_REQUIRED] National Information Center (NIC) Nafath B2B Gateway API.
 */
export interface IKycNafathService {
  initiateVerification(auth: AuthContext, req: InitiateKycRequest, idempotencyKey?: string): Promise<KycRecordDto>;
  getStatus(auth: AuthContext): Promise<KycRecordDto>;
  processNafathCallback(payload: NafathCallbackPayload): Promise<KycRecordDto>;
}

/**
 * 5. Flight Booking Interface
 * [EXTERNAL_SPEC_REQUIRED] IATA NDC / GDS Airline Aggregator API specification.
 */
export interface IFlightBookingService {
  bookFlight(auth: AuthContext, req: CreateFlightBookingRequest, idempotencyKey?: string): Promise<FlightBookingDto>;
  getFlightBooking(auth: AuthContext, bookingId: string): Promise<FlightBookingDto>;
}

/**
 * 6. Hotel Booking Interface
 * [EXTERNAL_SPEC_REQUIRED] Hotel Bed / OTA Partner Reservation API specification.
 */
export interface IHotelBookingService {
  reserveHotel(auth: AuthContext, req: CreateHotelReservationRequest, idempotencyKey?: string): Promise<HotelReservationDto>;
  getHotelReservation(auth: AuthContext, reservationId: string): Promise<HotelReservationDto>;
}

/**
 * 7. Airport Services Interface (Chauffeur & Lounge)
 * [EXTERNAL_SPEC_REQUIRED] Airport Partner & Chauffeur Fleet Dispatch API specification.
 */
export interface IAirportBookingService {
  bookAirportService(auth: AuthContext, req: CreateAirportServiceRequest, idempotencyKey?: string): Promise<AirportServiceBookingDto>;
  getAirportBooking(auth: AuthContext, bookingId: string): Promise<AirportServiceBookingDto>;
}
