import { test, expect } from '@playwright/test';
import { ProviderConfig, ProviderNotConfiguredError } from '../src/api/adapters/config';
import { ProviderAdapters } from '../src/api/adapters';
import type { AuthContext } from '../src/api/types';

test.describe('Phase 3A — Integration Adapter Scaffolding & Provider Isolation Suite', () => {
  const mockAuth: AuthContext = {
    userId: 'usr-test-1098472910',
    profileId: 'prof-test-1098472910',
    mobile: '+966 50 123 4567',
    upiId: 'fahad@sarie',
    role: 'customer',
  };

  test.describe('1. Provider Configuration & Mode Resolution', () => {
    test('defaults to "mock" mode when no provider environment variables are set', () => {
      expect(ProviderConfig.getProviderMode('sarie')).toBe('mock');
      expect(ProviderConfig.getProviderMode('nafath')).toBe('mock');
      expect(ProviderConfig.getProviderMode('open_banking')).toBe('mock');
      expect(ProviderConfig.getProviderMode('airline_gds')).toBe('mock');
      expect(ProviderConfig.getProviderMode('hotel_bedbank')).toBe('mock');
      expect(ProviderConfig.getProviderMode('airport_services')).toBe('mock');
    });

    test('validates missing environment variables accurately', () => {
      const { isConfigured, missing } = ProviderConfig.validate('sarie', [
        'SARIE_IPS_GATEWAY_URL',
        'SARIE_PARTICIPANT_BIC',
      ]);

      expect(isConfigured).toBe(false);
      expect(missing).toContain('SARIE_IPS_GATEWAY_URL');
      expect(missing).toContain('SARIE_PARTICIPANT_BIC');
    });

    test('getSystemStatus reports all 6 tracks with clear status diagnostics', () => {
      const status = ProviderConfig.getSystemStatus();

      expect(Object.keys(status)).toEqual([
        'sarie',
        'nafath',
        'open_banking',
        'airline_gds',
        'hotel_bedbank',
        'airport_services',
      ]);

      for (const track of Object.values(status)) {
        expect(track.mode).toBe('mock');
        expect(track.isConfigured).toBe(true); // In mock mode, system is safe to run
        expect(track.requiredEnvVars.length).toBeGreaterThan(0);
      }
    });

    test('assertReady throws ProviderNotConfiguredError if sandbox mode is enabled without credentials', () => {
      // Temporarily mock environment mode
      process.env.VITE_SARIE_MODE = 'sandbox';

      try {
        expect(() => {
          ProviderConfig.assertReady('sarie', ['SARIE_IPS_GATEWAY_URL', 'SARIE_PARTICIPANT_BIC']);
        }).toThrow(ProviderNotConfiguredError);
      } finally {
        // Clean up mock env
        delete process.env.VITE_SARIE_MODE;
      }
    });
  });

  test.describe('2. SARIE IPS / RTP Adapter Scaffolding', () => {
    test('executes safe deterministic RTP simulation in mock mode', async () => {
      const res = await ProviderAdapters.sarie.dispatchRtpMessage({
        rtpRef: 'RTP-TEST-001',
        debtorUpiId: 'tariq@sarie',
        debtorMobile: '+966502345678',
        creditorUpiId: 'fahad@sarie',
        amount: 300.0,
        title: 'Dinner Split',
      });

      expect(res.accepted).toBe(true);
      expect(res.status).toBe('DISPATCHED');
      expect(res.switchReference).toMatch(/^SARIE-SWITCH-/);
    });

    test('executes RTP decline simulation in mock mode', async () => {
      const res = await ProviderAdapters.sarie.declineRtpMessage({
        rtpRef: 'RTP-TEST-001',
        reasonCode: 'RJCT_USER_DECLINED',
      });

      expect(res.accepted).toBe(true);
      expect(res.status).toBe('DECLINED');
    });
  });

  test.describe('3. Nafath / NIC Adapter Scaffolding', () => {
    test('generates 2-digit verification challenge in mock mode', async () => {
      const challenge = await ProviderAdapters.nafath.initiateChallenge(mockAuth.profileId, {
        nationalId: '1098472910',
        docType: 'national_id',
        dob: '1992-05-14',
      });

      expect(challenge.status).toBe('pending_nafath');
      expect(challenge.nafathTxId).toMatch(/^NAFATH-TX-/);
      expect(Number(challenge.nafathRandomNumber)).toBeGreaterThanOrEqual(10);
      expect(Number(challenge.nafathRandomNumber)).toBeLessThanOrEqual(99);
    });
  });

  test.describe('4. SAMA Open Banking Adapter Scaffolding', () => {
    test('returns standard mock banking balances in mock mode', async () => {
      const balances = await ProviderAdapters.openBanking.getAccountBalances(mockAuth.profileId);

      expect(balances.length).toBe(2);
      expect(balances[0].bankName).toBe('Al Rajhi Bank');
      expect(balances[0].availableBalance).toBe(48250.0);
      expect(balances[1].bankName).toBe('Saudi National Bank (SNB)');
    });

    test('returns mock consent URL in mock mode', async () => {
      const consent = await ProviderAdapters.openBanking.initiateConsent(mockAuth.profileId, 'bank-alrajhi');

      expect(consent.consentId).toMatch(/^OB-CONSENT-MOCK-/);
      expect(consent.authUrl).toBeDefined();
    });
  });

  test.describe('5. Airline NDC / GDS Adapter Scaffolding', () => {
    test('books flight and issues mock PNR in mock mode', async () => {
      const booking = await ProviderAdapters.airlineGds.bookFlight(mockAuth, {
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
      expect(booking.status).toBe('confirmed');
    });
  });

  test.describe('6. Hotel Bed-Bank Adapter Scaffolding', () => {
    test('reserves hotel and issues confirmation code in mock mode', async () => {
      const res = await ProviderAdapters.hotelBedbank.reserveHotel(mockAuth, {
        hotelName: 'The St. Regis Red Sea',
        city: 'Red Sea Project',
        roomType: 'Overwater Villa',
        checkInDate: '2026-10-20',
        checkOutDate: '2026-10-23',
        guestCount: 2,
        totalAmount: 4500.0,
      });

      expect(res.confirmationCode).toMatch(/^HT-\d{6}$/);
      expect(res.status).toBe('confirmed');
    });
  });

  test.describe('7. Airport VIP Services Adapter Scaffolding', () => {
    test('books chauffeur service with VIP booking ref in mock mode', async () => {
      const booking = await ProviderAdapters.airportServices.bookAirportService(mockAuth, {
        serviceType: 'chauffeur',
        airportCode: 'RUH',
        serviceDate: '2026-10-15',
        passengerCount: 1,
        totalAmount: 180.0,
      });

      expect(booking.bookingRef).toMatch(/^VIP-\d{6}$/);
      expect(booking.status).toBe('confirmed');
    });
  });
});
