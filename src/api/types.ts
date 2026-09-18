/**
 * QPay Fintech API Core Types & Contracts
 * Phase 2 — Backend API Layer
 * 
 * Rules:
 * - Authoritative DTOs for client-to-backend communication.
 * - Zero-Trust context derivation.
 * - Provider-specific dependencies are annotated.
 */

export interface AuthContext {
  userId: string;
  profileId: string;
  mobile: string;
  upiId: string;
  role: 'customer' | 'merchant' | 'admin' | 'compliance_auditor';
}

export interface ApiErrorResponse {
  success: false;
  errorCode: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==========================================
// 1. Split Expenses & RTP Contracts (USER-09, USER-10)
// ==========================================
export interface CreateSplitRequest {
  title: string;
  totalAmount: number;
  members: {
    name: string;
    upiId: string;
    mobile: string;
    amount: number;
  }[];
  notes?: string;
}

export interface SplitExpenseDto {
  id: string;
  creatorProfileId: string;
  creatorUpiId: string;
  title: string;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'active' | 'partially_settled' | 'settled' | 'cancelled' | 'expired';
  notes?: string;
  sarieBatchRef?: string;
  expiresAt: string;
  members: SplitMemberDto[];
  createdAt: string;
  updatedAt: string;
}

export interface SplitMemberDto {
  id: string;
  splitId: string;
  memberProfileId?: string;
  name: string;
  upiId: string;
  mobile: string;
  avatarInitials: string;
  shareAmount: number;
  status: 'pending' | 'request_sent' | 'paid' | 'declined' | 'cancelled';
  hasPaid: boolean;
  sarieRtpRef?: string;
  settledAt?: string;
}

export interface DeclineMoneyRequest {
  requestId: string;
  reason?: string;
}

export interface DeclineMoneyResponseDto {
  requestId: string;
  status: 'declined';
  declinedAt: string;
  sarieRejectCode?: string;
}

// ==========================================
// 2. Transfer Limits Contracts (USER-18)
// ==========================================
export interface UserTransferLimitsDto {
  samaMaxDailyLimit: number;
  userConfiguredDailyLimit: number;
  singleTransactionLimit: number;
  monthlyLimit: number;
  contactlessMadaLimit: number;
  dailyUsedAmount: number;
  monthlyUsedAmount: number;
  dailyRemaining: number;
  monthlyRemaining: number;
  dailyUsageResetAt: string;
  monthlyUsageResetAt: string;
}

export interface UpdateTransferLimitsRequest {
  dailyLimit?: number;
  singleTransactionLimit?: number;
  contactlessLimit?: number;
}

// ==========================================
// 3. KYC & Nafath Verification Contracts (USER-20)
// ==========================================
export interface InitiateKycRequest {
  nationalId: string;
  docType: 'national_id' | 'iqama' | 'passport' | 'gcc_id';
  dob: string;
  frontDocUrl?: string;
  backDocUrl?: string;
}

export interface KycRecordDto {
  id: string;
  profileId: string;
  nationalId: string;
  docType: string;
  dob: string;
  status: 'unverified' | 'pending_nafath' | 'verified' | 'rejected' | 'expired' | 'under_review';
  nafathTxId?: string;
  nafathRandomNumber?: string;
  amlPepCleared: boolean;
  verifiedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface NafathCallbackPayload {
  nafathTxId: string;
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

// ==========================================
// 4. Travel & Booking Contracts (USER-12 to USER-15)
// ==========================================
export interface CreateFlightBookingRequest {
  flightNumber: string;
  airlineCode: string;
  originCode: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  cabinClass: string;
  passengers: {
    firstName: string;
    lastName: string;
    nationalId: string;
  }[];
  totalAmount: number;
}

export interface FlightBookingDto {
  id: string;
  pnr: string;
  airlineCode: string;
  flightNumber: string;
  originCode: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  cabinClass: string;
  passengerCount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'ticketed' | 'cancelled' | 'refunded' | 'failed';
  paymentUtr?: string;
  createdAt: string;
}

export interface CreateHotelReservationRequest {
  hotelName: string;
  city: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalAmount: number;
}

export interface HotelReservationDto {
  id: string;
  confirmationCode: string;
  hotelName: string;
  city: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalAmount: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface CreateAirportServiceRequest {
  serviceType: 'chauffeur' | 'lounge' | 'meet_and_greet';
  airportCode: string;
  serviceDate: string;
  passengerCount: number;
  totalAmount: number;
}

export interface AirportServiceBookingDto {
  id: string;
  bookingRef: string;
  serviceType: 'chauffeur' | 'lounge' | 'meet_and_greet';
  airportCode: string;
  serviceDate: string;
  passengerCount: number;
  totalAmount: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}
