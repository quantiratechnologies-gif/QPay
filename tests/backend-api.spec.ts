import { test, expect } from '@playwright/test';
import { AuthService, UnauthorizedError, ForbiddenError } from '../src/api/auth';
import { Validator, ValidationError } from '../src/api/validation';
import { IdempotencyService, IdempotencyConflictError } from '../src/api/idempotency';
import { AuditService } from '../src/api/audit';
import { SplitExpenseService } from '../src/api/services/SplitExpenseService';
import { TransferLimitsService } from '../src/api/services/TransferLimitsService';
import { KycNafathService } from '../src/api/services/KycNafathService';
import { TravelBookingService } from '../src/api/services/TravelBookingService';
import type { AuthContext } from '../src/api/types';

test.describe('QPay Fintech Backend API Layer — Security & Contract Suite', () => {
  const mockAuth: AuthContext = {
    userId: 'usr-verified-1098472910',
    profileId: 'prof-verified-1098472910',
    mobile: '+966 50 123 4567',
    upiId: 'fahad@sarie',
    role: 'customer',
  };

  const otherAuth: AuthContext = {
    userId: 'usr-attacker-8837192831',
    profileId: 'prof-attacker-8837192831',
    mobile: '+966 55 999 8888',
    upiId: 'attacker@sarie',
    role: 'customer',
  };

  // ==========================================
  // 1. Authentication & Zero-Trust Ownership
  // ==========================================
  test.describe('1. Authentication & Authorization Enforcement', () => {
    test('rejects request when session or bearer token is missing', async () => {
      // In node test environment without localStorage or Supabase session, verifySession should throw UnauthorizedError
      await expect(AuthService.verifySession()).rejects.toThrow(UnauthorizedError);
    });

    test('derives auth context from valid Bearer token', async () => {
      const auth = await AuthService.verifySession('Bearer mock-valid-jwt-token-12345');
      expect(auth.userId).toBe('usr-bearer-verified');
      expect(auth.role).toBe('customer');
    });

    test('assertOwnership allows owner to access own resource', () => {
      expect(() => {
        AuthService.assertOwnership(mockAuth, mockAuth.profileId);
      }).not.toThrow();
    });

    test('assertOwnership rejects cross-user access attempts (IDOR prevention)', () => {
      expect(() => {
        AuthService.assertOwnership(otherAuth, mockAuth.profileId);
      }).toThrow(ForbiddenError);
    });

    test('assertSplitParticipant blocks non-participants from viewing private split bill', () => {
      expect(() => {
        AuthService.assertSplitParticipant(otherAuth, mockAuth.profileId, ['tariq@sarie', 'sara@sarie']);
      }).toThrow(ForbiddenError);
    });
  });

  // ==========================================
  // 2. Server-Side Validation Layer
  // ==========================================
  test.describe('2. Server-Side Validation Rules', () => {
    test('validates positive monetary amounts and rounds to 2 decimals', () => {
      expect(Validator.validateAmount(150.256)).toBe(150.26);
      expect(Validator.validateAmount('500.50')).toBe(500.5);
    });

    test('rejects negative, zero, non-numeric, or excessive amounts', () => {
      expect(() => Validator.validateAmount(0)).toThrow(ValidationError);
      expect(() => Validator.validateAmount(-50)).toThrow(ValidationError);
      expect(() => Validator.validateAmount('invalid_sar')).toThrow(ValidationError);
      expect(() => Validator.validateAmount(2000000, 'amount', 100000)).toThrow(ValidationError);
    });

    test('validates 10-digit Saudi National ID (starting with 1 or 2)', () => {
      expect(Validator.validateSaudiNationalId('1098472910')).toBe('1098472910'); // Citizen
      expect(Validator.validateSaudiNationalId('2098472910')).toBe('2098472910'); // Iqama
      expect(() => Validator.validateSaudiNationalId('3098472910')).toThrow(ValidationError);
      expect(() => Validator.validateSaudiNationalId('109847')).toThrow(ValidationError);
    });

    test('validates Saudi IBAN structure (SA + 22 chars)', () => {
      const validIban = 'SA0380000000608010167519';
      expect(Validator.validateSaudiIban(validIban)).toBe(validIban);
      expect(() => Validator.validateSaudiIban('GB0380000000608010167519')).toThrow(ValidationError);
      expect(() => Validator.validateSaudiIban('SA123')).toThrow(ValidationError);
    });

    test('validates Saudi mobile numbers with auto-formatting', () => {
      expect(Validator.validateSaudiMobile('0501234567')).toBe('+966501234567');
      expect(Validator.validateSaudiMobile('+966501234567')).toBe('+966501234567');
      expect(() => Validator.validateSaudiMobile('0401234567')).toThrow(ValidationError);
    });

    test('enforces state machine transitions strictly', () => {
      const kycFsm: Record<string, string[]> = {
        unverified: ['pending_nafath'],
        pending_nafath: ['verified', 'rejected'],
        verified: ['expired'],
        rejected: ['pending_nafath'],
        expired: ['pending_nafath'],
      };

      // Valid transition
      expect(() => {
        Validator.validateStateTransition('unverified', 'pending_nafath', kycFsm, 'KYC');
      }).not.toThrow();

      // Illegal transition: unverified straight to verified
      expect(() => {
        Validator.validateStateTransition('unverified', 'verified', kycFsm, 'KYC');
      }).toThrow(ValidationError);
    });
  });

  // ==========================================
  // 3. Idempotency & Replay Protection
  // ==========================================
  test.describe('3. Idempotency & Replay Protection', () => {
    test('generates deterministic payload hashes', () => {
      const h1 = IdempotencyService.hashRequest('/api/v1/splits', { title: 'Dinner', amount: 300 });
      const h2 = IdempotencyService.hashRequest('/api/v1/splits', { title: 'Dinner', amount: 300 });
      const h3 = IdempotencyService.hashRequest('/api/v1/splits', { title: 'Dinner', amount: 400 });

      expect(h1).toBe(h2);
      expect(h1).not.toBe(h3);
    });
  });

  // ==========================================
  // 4. Audit Logging & Sanitization
  // ==========================================
  test.describe('4. Regulatory Audit Log Sanitization', () => {
    test('redacts all sensitive PINs, passwords, OTPs, and secrets before logging', () => {
      const rawPayload = {
        username: 'fahad',
        mpin: '1234',
        password: 'SuperSecretPassword!',
        otp: '589204',
        biometricData: 'face_vector_sample_xyz',
        bankDetails: {
          accountNumber: '123456789',
          cvv: '999',
        },
        metadata: {
          amount: 500,
          currency: 'SAR',
        },
      };

      const sanitized = AuditService.sanitize(rawPayload);

      expect(sanitized.username).toBe('fahad');
      expect(sanitized.mpin).toBe('[REDACTED]');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.otp).toBe('[REDACTED]');
      expect(sanitized.biometricData).toBe('[REDACTED]');
      expect(sanitized.bankDetails.cvv).toBe('[REDACTED]');
      expect(sanitized.bankDetails.accountNumber).toBe('123456789');
      expect(sanitized.metadata.amount).toBe(500);
    });
  });

  // ==========================================
  // 5. Transfer Limits Service (SAMA Compliance)
  // ==========================================
  test.describe('5. SAMA Transfer Limits Service', () => {
    const limitsService = new TransferLimitsService();

    test('retrieves default limits with SAMA daily ceiling', async () => {
      const limits = await limitsService.getLimits(mockAuth);
      expect(limits.samaMaxDailyLimit).toBe(50000.0);
      expect(limits.contactlessMadaLimit).toBe(300.0);
      expect(limits.dailyRemaining).toBeGreaterThan(0);
    });

    test('rejects daily limit update exceeding SAMA maximum ceiling', async () => {
      await expect(
        limitsService.updateLimits(mockAuth, { dailyLimit: 100000.0 })
      ).rejects.toThrow();
    });

    test('validates transaction within remaining limits', async () => {
      const isValid = await limitsService.validateTransactionWithinLimits(mockAuth, 500.0);
      expect(isValid).toBe(true);

      // Exceeds single txn limit
      await expect(
        limitsService.validateTransactionWithinLimits(mockAuth, 30000.0)
      ).rejects.toThrow();
    });
  });

  // ==========================================
  // 6. Split Expenses & Settlement Service
  // ==========================================
  test.describe('6. Split Expenses & Settlement Service', () => {
    const splitService = new SplitExpenseService();

    test('creates split expense and calculates participant shares', async () => {
      const split = await splitService.createSplit(mockAuth, {
        title: 'Chalet Diriyah',
        totalAmount: 600.0,
        members: [
          { name: 'Fahad (You)', upiId: 'fahad@sarie', mobile: '+966501234567', amount: 300.0 },
          { name: 'Tariq', upiId: 'tariq@sarie', mobile: '+966502345678', amount: 300.0 },
        ],
      });

      expect(split.id).toBeDefined();
      expect(split.title).toBe('Chalet Diriyah');
      expect(split.totalAmount).toBe(600.0);
      expect(split.members.length).toBe(2);

      // Creator self-share is automatically marked paid
      const creatorMember = split.members.find((m) => m.upiId === mockAuth.upiId);
      expect(creatorMember?.hasPaid).toBe(true);
      expect(creatorMember?.status).toBe('paid');

      // Other participant is request_sent
      const otherMember = split.members.find((m) => m.upiId !== mockAuth.upiId);
      expect(otherMember?.hasPaid).toBe(false);
      expect(otherMember?.status).toBe('request_sent');
      expect(otherMember?.sarieRtpRef).toBeDefined();
    });

    test('declines RTP money request with valid reason', async () => {
      const res = await splitService.declineRtpRequest(mockAuth, {
        requestId: 'req-test-1234',
        reason: 'Incorrect amount requested',
      });

      expect(res.requestId).toBe('req-test-1234');
      expect(res.status).toBe('declined');
      expect(res.sarieRejectCode).toBe('RJCT_USER_DECLINED');
    });
  });

  // ==========================================
  // 7. KYC & Nafath Challenge Service
  // ==========================================
  test.describe('7. KYC & Nafath Challenge Service', () => {
    const kycService = new KycNafathService();

    test('initiates Nafath verification and generates 2-digit challenge number', async () => {
      const kyc = await kycService.initiateVerification(mockAuth, {
        nationalId: '1098472910',
        docType: 'national_id',
        dob: '1992-05-14',
      });

      expect(kyc.status).toBe('pending_nafath');
      expect(kyc.nationalId).toBe('1098472910');
      expect(kyc.nafathTxId).toBeDefined();
      expect(kyc.nafathRandomNumber).toBeDefined();
      expect(Number(kyc.nafathRandomNumber)).toBeGreaterThanOrEqual(10);
      expect(Number(kyc.nafathRandomNumber)).toBeLessThanOrEqual(99);
    });
  });

  // ==========================================
  // 8. Travel & Bookings Service
  // ==========================================
  test.describe('8. Travel & Bookings Service', () => {
    const travelService = new TravelBookingService();

    test('creates flight booking with PNR generation', async () => {
      const booking = await travelService.bookFlight(mockAuth, {
        flightNumber: 'SV1024',
        airlineCode: 'SV',
        originCode: 'RUH',
        destinationCode: 'JED',
        departureTime: '2026-10-15T08:00:00Z',
        arrivalTime: '2026-10-15T09:35:00Z',
        cabinClass: 'ECONOMY',
        passengers: [{ firstName: 'Fahad', lastName: 'Al-Harbi', nationalId: '1098472910' }],
        totalAmount: 650.0,
      });

      expect(booking.pnr).toMatch(/^SV\d{5}$/);
      expect(booking.flightNumber).toBe('SV1024');
      expect(booking.totalAmount).toBe(650.0);
      expect(booking.status).toBe('confirmed');
    });

    test('creates hotel reservation with confirmation code', async () => {
      const reservation = await travelService.reserveHotel(mockAuth, {
        hotelName: 'The St. Regis Red Sea',
        city: 'Red Sea Project',
        roomType: 'Overwater Villa',
        checkInDate: '2026-10-20',
        checkOutDate: '2026-10-23',
        guestCount: 2,
        totalAmount: 4500.0,
      });

      expect(reservation.confirmationCode).toMatch(/^HT-\d{6}$/);
      expect(reservation.totalAmount).toBe(4500.0);
      expect(reservation.status).toBe('confirmed');
    });

    test('creates airport chauffeur service booking', async () => {
      const apBooking = await travelService.bookAirportService(mockAuth, {
        serviceType: 'chauffeur',
        airportCode: 'RUH',
        serviceDate: '2026-10-15',
        passengerCount: 1,
        totalAmount: 180.0,
      });

      expect(apBooking.bookingRef).toMatch(/^VIP-\d{6}$/);
      expect(apBooking.airportCode).toBe('RUH');
      expect(apBooking.totalAmount).toBe(180.0);
    });
  });
});
