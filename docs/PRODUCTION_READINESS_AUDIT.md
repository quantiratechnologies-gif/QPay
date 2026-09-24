# QPay / AlphPay Customer Application: Production Readiness Audit Report
**Date:** September 24, 2026  
**Audit Scope:** `src/screens/`, `src/state/`, `src/services/`, `src/api/`, `server/`  
**Classification:** Internal Compliance & Architecture Audit  

---

## Executive Summary

This production readiness audit evaluated all 42 screens and modals in the QPay customer application. The authentication and legal consent layers (`/api/auth/otp/send`, `/api/auth/otp/verify`, `/api/auth/consent`, and `/api/user/data-export`) are fully backed by a live Node.js/Express server and Supabase database with append-only audit logging and RLS policies.

However, **all payment, banking, utility, KYC, and lifestyle booking actions remain entirely client-side simulated or mock-adapter backed**. The payment layer generates authentic-looking receipts with synthetic transaction IDs and Sarie UTR numbers, and updates ephemeral React state, but **no funds are moved, no banking APIs are contacted, and no transaction records are written to any authoritative database or backend ledger**.

---

## 1. Screen-by-Screen Action Audit Matrix

For every screen in `src/screens/`, each user action is categorized into one of three execution models:
- **(a) Server-Backed:** Communicates with a live backend API (`/api/*`) or database (Supabase) that processes and persists authoritative records.
- **(b) Client-Side Simulated:** State changes occur solely in browser memory (React state) or browser `localStorage`; no external network call or backend mutation occurs.
- **(c) Mock Adapter:** Uses integration adapter scaffolding (`src/api/adapters/*`) operating in `mock` mode with hardcoded fixtures and artificial delays.

| # | Screen File | Action / Flow | Classification | Authoritative Record Location | Details |
|---|---|---|---|---|---|
| 1 | `AddBankModal.tsx` | Bank account selection & IBAN entry | (c) Mock Adapter | None (in-memory state) | Uses `OpenBankingAdapter` in mock mode; generates synthetic account IDs. |
| 2 | `AddBankModal.tsx` | Bank authorization & consent | (b) Client-Side Simulated | None | Uses `setTimeout` simulation; bank OTP verified against client string. |
| 3 | `AllServicesScreen.tsx` | Service navigation | (b) Client-Side Simulated | None | Client-side routing to service screens. |
| 4 | `AllServicesScreen.tsx` | Quick Pay shortcut | (b) Client-Side Simulated | None | Invokes client `completePayment()` without server validation. |
| 5 | `BankAccountsScreen.tsx` | View linked bank accounts | (b) Client-Side Simulated | `localStorage` fallback | Reads from initial mock accounts in `bankService.ts`. |
| 6 | `BankAccountsScreen.tsx` | Set primary bank account | (b) Client-Side Simulated | React state | Updates `isPrimary` flag in local array. |
| 7 | `BankAccountsScreen.tsx` | Unlink / remove bank account | (b) Client-Side Simulated | React state | Filters account out of local array; no bank API unlinking. |
| 8 | `EditProfileModal.tsx` | Update name, email, mobile | (b) Client-Side Simulated | `localStorage` (`qpay_user_profile`) | Updates client profile cache; does not call backend profile update endpoint. |
| 9 | `ElectricityScreen.tsx` | Consumer bill inquiry | (c) Mock Adapter | None | `billPaymentService.fetchElectricityBill` returns hardcoded SAR 342.50 bill. |
| 10 | `ElectricityScreen.tsx` | Pay electricity bill | (b) Client-Side Simulated | None | Deducts amount from in-memory balance; SADAD/SEC is never notified. |
| 11 | `FoodScreen.tsx` | Restaurant / food vendor browsing | (b) Client-Side Simulated | None | Static curated vendor catalog. |
| 12 | `FoodScreen.tsx` | Order checkout & payment | (b) Client-Side Simulated | None | Calls `completePayment()`; no merchant order API is called. |
| 13 | `HelpSupportScreen.tsx` | FAQ browsing & contact triggers | (b) Client-Side Simulated | Device OS (`tel:`, `mailto:`) | Triggers OS URL schemes; no internal support ticket is logged. |
| 14 | `HistoryScreen.tsx` | View transaction history | (b) Client-Side Simulated | None (React state) | Displays in-memory transaction list. |
| 15 | `HistoryScreen.tsx` | Filter by category / search | (b) Client-Side Simulated | None | Pure client array filter. |
| 16 | `HistoryScreen.tsx` | Export statement (CSV/PDF) | (b) Client-Side Simulated | Browser download / share | Generates CSV string dynamically on the client. |
| 17 | `HistoryScreen.tsx` | Report transaction dispute | (b) Client-Side Simulated | None (ephemeral flag) | Toggles `isReported = true` on client object; no dispute case is opened. |
| 18 | `HomeScreen.tsx` | View total balance | (b) Client-Side Simulated | None | Sums `bankAccounts` array balances. |
| 19 | `HomeScreen.tsx` | Toggle balance visibility | (b) Client-Side Simulated | None | Toggles boolean in React state. |
| 20 | `HomeScreen.tsx` | Quick action navigation | (b) Client-Side Simulated | None | State navigation. |
| 21 | `KycModal.tsx` | National ID / Iqama submission | (c) Mock Adapter | None | Interacts with `NafathAdapter` mock methods. |
| 22 | `KycModal.tsx` | Nafath 2-digit code approval | (b) Client-Side Simulated | `localStorage` | Simulated via `setTimeout`; sets `isKycVerified = true` in client state. |
| 23 | `LanguageModal.tsx` | Switch Arabic / English | (b) Client-Side Simulated | `localStorage` (`qpay_user_language`) | Updates i18n context and document `dir` attribute. |
| 24 | `LogoutModal.tsx` | Account logout | (b) Client-Side Simulated | `localStorage` | Clears local tokens and session cache; navigates to onboarding. |
| 25 | `MobileNumberScreen.tsx` | Request OTP via SMS | **(a) Server-Backed** | `otp_verifications` table & rate limiter | Sends `POST /api/auth/otp/send` to Express auth backend. |
| 26 | `MoneyRequestsScreen.tsx`| View pending money requests | (b) Client-Side Simulated | None (React state) | Initialized from mock array. |
| 27 | `MoneyRequestsScreen.tsx`| Pay requested amount | (b) Client-Side Simulated | None | Calls `completePayment()`; no peer transfer is initiated. |
| 28 | `MoneyRequestsScreen.tsx`| Decline money request | (b) Client-Side Simulated | None | Updates status to `'declined'` in local state. |
| 29 | `NotificationsScreen.tsx`| View notifications | (b) Client-Side Simulated | None (React state) | In-memory notification array. |
| 30 | `NotificationsScreen.tsx`| Mark as read / Clear all | (b) Client-Side Simulated | None (React state) | Clears local state array. |
| 31 | `OnboardingBankScreen.tsx`| Search & select bank | (c) Mock Adapter | None | Uses `OpenBankingAdapter` mock provider. |
| 32 | `OnboardingBankScreen.tsx`| Verify Bank SMS OTP | (b) Client-Side Simulated | None | Validates against hardcoded string `'123456'`. |
| 33 | `OnboardingKycScreen.tsx`| Enter National ID & initiate Nafath | (c) Mock Adapter | None | Uses `NafathAdapter.initiateAuth()` mock method. |
| 34 | `OnboardingKycScreen.tsx`| Poll Nafath approval | (c) Mock Adapter | None | `NafathAdapter.pollAuthStatus()` simulates approval after 4 seconds. |
| 35 | `OnboardingScreen.tsx` | Swipe onboarding slides | (b) Client-Side Simulated | None | Carousel swipe state. |
| 36 | `PayAnyoneScreen.tsx` | Search contacts / enter UPI ID | (b) Client-Side Simulated | None | In-memory contacts search. |
| 37 | `PayAnyoneScreen.tsx` | Select recipient | (b) Client-Side Simulated | None | Navigates to `SEND_AMOUNT` with selected contact params. |
| 38 | `PayBillPinModal.tsx` | 4-Digit MPIN entry & verification | (b) Client-Side Simulated | `localStorage` (`qpay_user_pin_hash`) | Verified client-side against salted SHA-256 hash. |
| 39 | `PaymentMethodsScreen.tsx`| View payment rails & methods | (b) Client-Side Simulated | None | Static list of supported payment channels. |
| 40 | `PaymentSuccessScreen.tsx`| View payment receipt & UTR | (b) Client-Side Simulated | None | Displays client-generated `QT...` and `UTR...` IDs. |
| 41 | `PaymentSuccessScreen.tsx`| Download / Share receipt | (b) Client-Side Simulated | Native OS / Print | Client-side HTML canvas/share invocation. |
| 42 | `PermissionsScreen.tsx` | Grant system permissions | (b) Client-Side Simulated | Capacitor / Browser | Requests hardware permissions or simulates grant. |
| 43 | `PrivacyPolicyScreen.tsx`| View Privacy Policy document | (b) Client-Side Simulated | Static content | Renders sections from `src/content/privacy.{en,ar}.ts`. |
| 44 | `PrivacySettingsScreen.tsx`| Toggle data sharing / analytics | (b) Client-Side Simulated | React state | Client toggles; no backend consent preference sync. |
| 45 | `PrivacySettingsScreen.tsx`| Request Account Data Export | **(a) Server-Backed** | `data_export_requests` table & backend | Calls `POST /api/user/data-export` and queues export row. |
| 46 | `ProfileScreen.tsx` | View profile & compliance status | (b) Client-Side Simulated | None | Renders cached user data. |
| 47 | `ReceiveScreen.tsx` | View personal Sarie QR code | (b) Client-Side Simulated | None | Client-side QR generator (`qrcode.react`). |
| 48 | `ReceiveScreen.tsx` | Simulate inbound Sarie payment | (b) Client-Side Simulated | None | Invokes `receiveMoney()`; credits local state balance. |
| 49 | `RequestMoneyScreen.tsx` | Create money request | (b) Client-Side Simulated | None | Appends item to `moneyRequests` state array. |
| 50 | `RewardsScreen.tsx` | View cashback & rewards | (b) Client-Side Simulated | None | Static balance SAR 184.50 and client scratch animation. |
| 51 | `ScanScreen.tsx` | Scan QR code via camera | (b) Client-Side Simulated | Device Camera | Decodes QR payloads client-side. |
| 52 | `ScanScreen.tsx` | Resolve ZATCA / Sarie QR payload | (b) Client-Side Simulated | None | Client-side parser extracts recipient and amount. |
| 53 | `SecurityScreen.tsx` | Toggle Biometrics | (b) Client-Side Simulated | `localStorage` | Client flag for WebAuthn/Biometrics. |
| 54 | `SecurityScreen.tsx` | Terminate device session | (b) Client-Side Simulated | None | Removes session item from local array; token is not revoked. |
| 55 | `SendAmountScreen.tsx` | Enter transfer amount & chips | (b) Client-Side Simulated | None | Client amount calculation & limits check. |
| 56 | `SendAmountScreen.tsx` | Authorize & send money | (b) Client-Side Simulated | None | Invokes `completePayment()`; zero backend API interaction. |
| 57 | `SetPinScreen.tsx` | Setup & confirm 4-digit PIN | (b) Client-Side Simulated | `localStorage` (`qpay_user_pin_hash`) | Client SHA-256 hash computation; PIN never leaves device. |
| 58 | `ShoppingScreen.tsx` | Browse eCommerce deals | (b) Client-Side Simulated | None | Static merchant catalog. |
| 59 | `ShoppingScreen.tsx` | Buy now with QPay | (b) Client-Side Simulated | None | Calls `completePayment()` in local state. |
| 60 | `SmsOtpScreen.tsx` | Verify 6-digit SMS OTP | **(a) Server-Backed** | `profiles`, `otp_verifications`, `consent_audit_log` | Calls `POST /api/auth/otp/verify`; records consent and provisions session. |
| 61 | `SmsOtpScreen.tsx` | Resend OTP code | **(a) Server-Backed** | Rate limit store & `otp_verifications` | Calls `POST /api/auth/otp/resend`; enforces 60-second cooldown. |
| 62 | `SpendAnalysisScreen.tsx`| Compute analytics & category charts| (b) Client-Side Simulated | None | Aggregates local `transactions` array dynamically. |
| 63 | `SplashScreen.tsx` | Inspect session & route user | (b) Client-Side Simulated | `localStorage` | Checks local storage keys and determines entry route. |
| 64 | `SplitExpensesScreen.tsx`| Create group bill split | (b) Client-Side Simulated | None | Creates in-memory `SplitExpense` object. |
| 65 | `SplitExpensesScreen.tsx`| Settle split expense | (b) Client-Side Simulated | None | Calls `completePayment()` in local state. |
| 66 | `TermsScreen.tsx` | View Terms and Conditions | (b) Client-Side Simulated | Static content | Renders sections from `src/content/terms.{en,ar}.ts`. |
| 67 | `TransferLimitsScreen.tsx`| View / Edit SAMA transfer limits | (b) Client-Side Simulated | `localStorage` (`qpay_transfer_limits`) | Fetches via `QPayApi.limits.get()`; falls back to client storage. |
| 68 | `TravelScreen.tsx` | Search flights & hotels | (c) Mock Adapter | None | Uses `AirlineGdsAdapter` & `HotelBedbankAdapter`. |
| 69 | `TravelScreen.tsx` | Book & pay travel itinerary | (b) Client-Side Simulated | None | Calls `completePayment()`; no booking is created with airlines. |
| 70 | `UPISettingsScreen.tsx` | Manage Sarie Alias & MPIN | (b) Client-Side Simulated | None | Client settings interface. |

---

## 2. Comprehensive Money-Moving Functions Table

The following table documents every money-moving function in the application codebase, including the source file, caller screens, the authoritatively written record, and the actual execution status.

| Function Name | Source File | Calling Screen(s) | Claimed Action | Authoritative Record Location | Actual Execution Reality |
|---|---|---|---|---|---|
| `completePayment(params)` | `src/state/AppContext.tsx:766` | `SendAmountScreen`<br>`ElectricityScreen`<br>`SplitExpensesScreen`<br>`MoneyRequestsScreen`<br>`TravelScreen`<br>`FoodScreen`<br>`ShoppingScreen`<br>`AllServicesScreen` | Debits primary bank account, transfers funds via Sarie IPS, generates receipt | **NONE** (`syncTransactionToSupabase` at line 800 is a no-op stub) | **100% Client-Side Simulation.** Generates random ID `QT...`, synthetic UTR `UTR...`, deducts from in-memory `bankAccounts` state, prepends to `transactions` state array. No HTTP request is sent, no payment rail is contacted, no DB record is written. |
| `receiveMoney(params)` | `src/state/AppContext.tsx:816` | `ReceiveScreen` (Simulate Inbound Payment) | Credits bank account from external Sarie sender | **NONE** (`syncTransactionToSupabase` at line 848 is a no-op stub) | **100% Client-Side Simulation.** Generates random ID `SAR...`, synthetic UTR `SARIE...`, increases in-memory bank balance, adds to local transactions array. |
| `billPaymentService.payBill()` | `src/services/billPaymentService.ts:14` | Direct service call | Submits utility payment to SADAD / SEC | **NONE** | **Mock Promise.** Returns `{ success: true, utr: 'SADAD...' }` after artificial delay. No SADAD gateway communication exists. |
| `paymentService.sendMoney()` | `src/services/paymentService.ts:16` | Direct service call | Executes P2P instant transfer via Sarie RTP | **NONE** | **Mock Promise.** Returns a generated transaction object with no network call. |
| `markSplitMemberPaid()` | `src/state/AppContext.tsx:892` | `SplitExpensesScreen` | Records peer reimbursement for group expense | **NONE** | Mutates in-memory `splitExpenses` state array. |
| `syncTransactionToSupabase()` | `src/services/supabaseClient.ts:69` | `AppContext.tsx` | Persists transaction record to Supabase database | **NONE** | **Explicit Stub.** Function body is `return;`. Client-side insertion was intentionally removed during security hardening to prevent unauthorized balance manipulation. |

---

## 3. Discrepancy Register: Where the UI Claims Something Happened That Did Not

| ID | Screen / Component | Claimed UI Event | True System Reality | Risk / Compliance Impact |
|---|---|---|---|---|
| **DISC-01** | `PaymentSuccessScreen.tsx` | *"Payment Successful"* with official Sarie UTR reference, green checkmark, and debit confirmation. | Zero funds were transferred. No SARIE/IPS payment instruction was submitted, and no financial transaction was recorded. | **Critical.** In production, users will assume payments were delivered to payees or merchants. |
| **DISC-02** | `ElectricityScreen.tsx` | *"Bill Paid Successfully"* with confirmation reference. | Saudi Electricity Company (SEC) and SADAD billing gateways were never contacted. The user's utility bill remains unpaid. | **Critical.** Utility service disconnection risk for end-users. |
| **DISC-03** | `OnboardingKycScreen.tsx`<br>`KycModal.tsx` | *"Nafath Verification Complete"* with verified National ID green badge. | No National IAM / Nafath session was created. Approval was simulated via a client timer without NIC authentication. | **Regulatory Non-Compliance.** SAMA mandates verified Nafath authentication for tier-1 wallet provisioning. |
| **DISC-04** | `OnboardingBankScreen.tsx`<br>`AddBankModal.tsx` | *"Bank Account Linked via SAMA Open Banking"* with live balance display. | Generated a fake IBAN with synthetic balance in mock adapter. No bank was linked via Open Banking mTLS. | **High.** Balances shown do not reflect actual customer bank funds. |
| **DISC-05** | `TravelScreen.tsx` | Flight booking confirmed with airline PNR and hotel confirmation voucher. | No Global Distribution System (GDS) or airline NDC ticket was issued. | **Severe Customer Impact.** Travelers arriving at airports with non-existent tickets. |
| **DISC-06** | `FoodScreen.tsx`<br>`ShoppingScreen.tsx` | Order placed and confirmed with vendor. | No merchant order API was triggered; no fulfillment exists. | **High.** False expectation of delivery. |
| **DISC-07** | `HistoryScreen.tsx` | *"Dispute Submitted - Our compliance team is reviewing this transaction."* | Simply set `isReported = true` on the local object; no ticket was submitted to customer support or SAMA dispute portals. | **Compliance Non-Compliance.** Violates SAMA Customer Protection Principles regarding complaint logging. |
| **DISC-08** | `SecurityScreen.tsx` | Remote session revoked (*"Session Terminated"*). | Device session was merely removed from an in-memory array. The session token was not invalidated on the server. | **Security Vulnerability.** Stolen or leaked tokens on remote devices remain fully active. |
| **DISC-09** | `TransferLimitsScreen.tsx`| *"Transfer limits updated successfully under SAMA rules."* | Saved limits only to local browser storage; the central banking limit enforcement engine was not updated. | **Financial Risk.** Client-side limits can be bypassed by modifying local storage. |

---

## 4. Production Readiness Roadmap & Recommendations

To bring the application from its current prototype/demo state to a fully production-ready, bank-grade financial application, the following backend integrations are required:

1. **Backend Payment Processor (`/api/payments`):**
   - Implement an idempotent server-side payment execution endpoint (`server/routes/paymentRoutes.ts`).
   - Wire the backend to the live **Sarie RTP / IPS Gateway** using bilateral mTLS certificates and ISO 20022 `pacs.008` message schemas.
   - Authoritatively write transactions to `public.transactions` and atomically deduct balances using PostgreSQL transactions (`SELECT ... FOR UPDATE`).

2. **SADAD / Utility Bill Payment Gateway:**
   - Integrate with the official SADAD payment service provider for bill inquiry and real-time electronic bill presentment and payment (EBPP).

3. **Nafath National IAM Integration:**
   - Replace `NafathAdapter` mock implementation with the official NIC Nafath App-to-App API using SP service credentials and private key signatures.

4. **SAMA Open Banking Aggregator:**
   - Deploy QWAC and QSeal certificates to establish certified Open Banking connections with Saudi commercial banks.

5. **Server-Side Session Revocation:**
   - Persist user sessions in `public.user_sessions` and implement server-side JWT invalidation upon logout or remote termination.
