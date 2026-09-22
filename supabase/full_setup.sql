
-- ============================================================================
-- QPay SAMA-Compliant Fintech Core Migrations (Phase 1)
-- Version: 20260917230000_fintech_core.sql
-- Description: Establishes database architecture for Split Expenses (SARIE RTP),
--              Re-KYC (Nafath Lifecycle), SAMA Transfer Limits, Travel Bookings,
--              Idempotency Deduplication, and Immutable SAMA Audit Logs.
-- Security: Implements strict Row Level Security (RLS) on all customer tables.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS & COMMON UTILITY FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to automatically manage updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 1. PROFILES & USERS BASE TABLE (Ensure compatibility with existing schema)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    avatar_initials VARCHAR(4) NOT NULL DEFAULT 'QP',
    upi_id VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(120),
    role VARCHAR(32) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'merchant', 'admin', 'compliance_auditor')),
    is_kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'ar' CHECK (preferred_language IN ('ar', 'en')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on mobile & upi_id for instant lookups
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile);
CREATE INDEX IF NOT EXISTS idx_profiles_upi_id ON public.profiles(upi_id);

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 2. IMMUTABLE SAMA FINTECH AUDIT LOGS TABLE
-- (Must be created early; NO UPDATE or DELETE allowed by any application user)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fintech_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    actor_role VARCHAR(32) NOT NULL DEFAULT 'customer',
    event_category VARCHAR(64) NOT NULL CHECK (event_category IN ('PAYMENT', 'KYC', 'LIMIT_CHANGE', 'SPLIT_RTP', 'TRAVEL_BOOKING', 'AUTH', 'SECURITY_SETTINGS')),
    event_type VARCHAR(64) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128),
    ip_address INET,
    user_agent TEXT,
    device_fingerprint VARCHAR(128),
    old_state JSONB,
    new_state JSONB,
    status VARCHAR(32) NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE', 'ATTEMPT', 'DENIED')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor_created ON public.fintech_audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_category_type ON public.fintech_audit_logs(event_category, event_type);

-- ----------------------------------------------------------------------------
-- 3. IDEMPOTENCY DEDUPLICATION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.idempotency_records (
    key VARCHAR(128) PRIMARY KEY,
    user_id UUID,
    request_path VARCHAR(255) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    response_status_code INT,
    response_body JSONB,
    status VARCHAR(32) NOT NULL DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON public.idempotency_records(expires_at);

-- ----------------------------------------------------------------------------
-- 4. USER TRANSFER LIMITS (SAMA Regulatory Limits & Usage Tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_transfer_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    sama_max_daily_limit NUMERIC(14, 2) NOT NULL DEFAULT 50000.00 CHECK (sama_max_daily_limit > 0),
    user_configured_daily_limit NUMERIC(14, 2) NOT NULL DEFAULT 50000.00 CHECK (user_configured_daily_limit > 0 AND user_configured_daily_limit <= sama_max_daily_limit),
    single_transaction_limit NUMERIC(14, 2) NOT NULL DEFAULT 20000.00 CHECK (single_transaction_limit > 0),
    monthly_limit NUMERIC(14, 2) NOT NULL DEFAULT 200000.00 CHECK (monthly_limit > 0),
    contactless_mada_limit NUMERIC(14, 2) NOT NULL DEFAULT 300.00 CHECK (contactless_mada_limit > 0),
    daily_used_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (daily_used_amount >= 0),
    daily_usage_reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
    monthly_used_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (monthly_used_amount >= 0),
    monthly_usage_reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transfer_limits_profile ON public.user_transfer_limits(profile_id);

DROP TRIGGER IF EXISTS set_transfer_limits_updated_at ON public.user_transfer_limits;
CREATE TRIGGER set_transfer_limits_updated_at
BEFORE UPDATE ON public.user_transfer_limits
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 5. RE-KYC / NATIONAL IDENTITY RECORDS (Nafath & NIC Gateway)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_kyc_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    national_id VARCHAR(10) NOT NULL CHECK (national_id ~ '^[12][0-9]{9}$'),
    doc_type VARCHAR(32) NOT NULL CHECK (doc_type IN ('national_id', 'iqama', 'passport', 'gcc_id')),
    dob DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'unverified' CHECK (status IN ('unverified', 'pending_nafath', 'verified', 'rejected', 'expired', 'under_review')),
    front_doc_storage_path TEXT,
    back_doc_storage_path TEXT,
    nafath_tx_id VARCHAR(64) UNIQUE,
    nafath_random_number VARCHAR(4),
    aml_pep_cleared BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    rejection_reason TEXT,
    verification_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_profile ON public.user_kyc_records(profile_id);
CREATE INDEX IF NOT EXISTS idx_kyc_national_id ON public.user_kyc_records(national_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON public.user_kyc_records(status);

DROP TRIGGER IF EXISTS set_kyc_updated_at ON public.user_kyc_records;
CREATE TRIGGER set_kyc_updated_at
BEFORE UPDATE ON public.user_kyc_records
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. SPLIT EXPENSES & SARIE RTP (Request to Pay) TABLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.split_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    creator_upi_id VARCHAR(64) NOT NULL,
    title VARCHAR(140) NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'partially_settled', 'settled', 'cancelled', 'expired')),
    notes TEXT,
    sarie_batch_ref VARCHAR(64),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.split_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    split_id UUID NOT NULL REFERENCES public.split_expenses(id) ON DELETE CASCADE,
    member_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name VARCHAR(120) NOT NULL,
    upi_id VARCHAR(64) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    avatar_initials VARCHAR(4) NOT NULL DEFAULT 'QP',
    share_amount NUMERIC(14, 2) NOT NULL CHECK (share_amount > 0),
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'request_sent', 'paid', 'declined', 'cancelled')),
    has_paid BOOLEAN NOT NULL DEFAULT FALSE,
    sarie_rtp_ref VARCHAR(64) UNIQUE,
    settled_transaction_id UUID,
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_split_member_obligation UNIQUE (split_id, upi_id)
);

CREATE INDEX IF NOT EXISTS idx_split_creator ON public.split_expenses(creator_profile_id, status);
CREATE INDEX IF NOT EXISTS idx_split_members_split ON public.split_members(split_id);
CREATE INDEX IF NOT EXISTS idx_split_members_upi ON public.split_members(upi_id);
CREATE INDEX IF NOT EXISTS idx_split_members_profile ON public.split_members(member_profile_id);

DROP TRIGGER IF EXISTS set_split_expenses_updated_at ON public.split_expenses;
CREATE TRIGGER set_split_expenses_updated_at
BEFORE UPDATE ON public.split_expenses
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_split_members_updated_at ON public.split_members;
CREATE TRIGGER set_split_members_updated_at
BEFORE UPDATE ON public.split_members
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 7. TRAVEL & BOOKINGS TABLES (Flights, Airport Services, Hotels)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.flight_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    pnr VARCHAR(12) NOT NULL UNIQUE,
    airline_code VARCHAR(4) NOT NULL,
    flight_number VARCHAR(12) NOT NULL,
    origin_code VARCHAR(4) NOT NULL,
    destination_code VARCHAR(4) NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    cabin_class VARCHAR(20) NOT NULL DEFAULT 'ECONOMY',
    passenger_count INT NOT NULL DEFAULT 1 CHECK (passenger_count >= 1),
    base_amount NUMERIC(12, 2) NOT NULL CHECK (base_amount >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'ticketed', 'cancelled', 'refunded', 'failed')),
    idempotency_key VARCHAR(64) UNIQUE,
    payment_utr VARCHAR(64),
    passengers JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_provider_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.airport_service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    service_type VARCHAR(32) NOT NULL CHECK (service_type IN ('chauffeur', 'lounge_pass', 'meet_and_greet')),
    voucher_code VARCHAR(32) NOT NULL UNIQUE,
    terminal_code VARCHAR(16) NOT NULL,
    flight_number VARCHAR(16),
    service_date TIMESTAMPTZ NOT NULL,
    pickup_address TEXT,
    passenger_count INT NOT NULL DEFAULT 1 CHECK (passenger_count >= 1),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'redeemed', 'cancelled', 'refunded')),
    payment_utr VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hotel_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    confirmation_code VARCHAR(32) NOT NULL UNIQUE,
    hotel_id VARCHAR(64) NOT NULL,
    hotel_name VARCHAR(140) NOT NULL,
    room_type VARCHAR(80) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL CHECK (check_out >= check_in),
    nights INT NOT NULL CHECK (nights >= 1),
    guests INT NOT NULL CHECK (guests >= 1),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'refunded')),
    payment_utr VARCHAR(64),
    raw_provider_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flight_bookings_profile ON public.flight_bookings(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_airport_bookings_profile ON public.airport_service_bookings(profile_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_profile ON public.hotel_reservations(profile_id);

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_transfer_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airport_service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fintech_audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
DROP POLICY IF EXISTS profiles_owner_policy ON public.profiles;
CREATE POLICY profiles_owner_policy ON public.profiles
    FOR ALL
    USING (auth.uid() = user_id OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true))
    WITH CHECK (auth.uid() = user_id OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true));

-- Transfer Limits: Users can only read their own transfer limits
DROP POLICY IF EXISTS transfer_limits_owner_select ON public.user_transfer_limits;
CREATE POLICY transfer_limits_owner_select ON public.user_transfer_limits
    FOR SELECT
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true)));

-- KYC Records: Users can only see/submit their own KYC records
DROP POLICY IF EXISTS kyc_owner_policy ON public.user_kyc_records;
CREATE POLICY kyc_owner_policy ON public.user_kyc_records
    FOR ALL
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true)))
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true)));

-- Split Expenses: Creator or Participants can view the split expense
DROP POLICY IF EXISTS split_expenses_party_policy ON public.split_expenses;
CREATE POLICY split_expenses_party_policy ON public.split_expenses
    FOR SELECT
    USING (
        creator_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true))
        OR id IN (SELECT split_id FROM public.split_members WHERE upi_id IN (SELECT upi_id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true)))
    );

DROP POLICY IF EXISTS split_expenses_creator_insert ON public.split_expenses;
CREATE POLICY split_expenses_creator_insert ON public.split_expenses
    FOR INSERT
    WITH CHECK (creator_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true)));

-- Split Members: Creator or Member can view their own participant record
DROP POLICY IF EXISTS split_members_party_policy ON public.split_members;
CREATE POLICY split_members_party_policy ON public.split_members
    FOR SELECT
    USING (
        upi_id IN (SELECT upi_id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true))
        OR split_id IN (SELECT id FROM public.split_expenses WHERE creator_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true)))
    );

-- Travel Bookings: Strict owner-only access
DROP POLICY IF EXISTS flight_bookings_owner_policy ON public.flight_bookings;
CREATE POLICY flight_bookings_owner_policy ON public.flight_bookings
    FOR ALL
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true)))
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true)));

DROP POLICY IF EXISTS airport_bookings_owner_policy ON public.airport_service_bookings;
CREATE POLICY airport_bookings_owner_policy ON public.airport_service_bookings
    FOR ALL
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true)))
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true)));

DROP POLICY IF EXISTS hotel_bookings_owner_policy ON public.hotel_reservations;
CREATE POLICY hotel_bookings_owner_policy ON public.hotel_reservations
    FOR ALL
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true)))
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true)));

-- Audit Logs: Insert allowed by authenticated backend services; NO update or delete allowed
DROP POLICY IF EXISTS audit_logs_insert_only ON public.fintech_audit_logs;
CREATE POLICY audit_logs_insert_only ON public.fintech_audit_logs
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS audit_logs_read_auditors ON public.fintech_audit_logs;
CREATE POLICY audit_logs_read_auditors ON public.fintech_audit_logs
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE (user_id = auth.uid() OR id::text = auth.jwt()->>'sub' OR id::text = current_setting('request.jwt.claim.sub', true)) AND role = 'compliance_auditor'));


-- ============================================================================
-- QPay Payments Core Migration — Merchants, Wallets, Transactions Enrichment
-- Version: 20260921230000_payments_core.sql
-- Description: Adds merchants table, wallets table, enriches transactions with
--              payer/payee fields, RLS, Realtime publication, and the
--              process_payment() SECURITY DEFINER function.
-- Idempotent: safe to run multiple times on the same database.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENSURE profiles.role column exists with correct CHECK
--    (The existing migration already has this, but guard for idempotency)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN role TEXT NOT NULL DEFAULT 'customer';
  END IF;

  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'merchant'));
END $$;

-- ----------------------------------------------------------------------------
-- 2. MERCHANTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    merchant_code TEXT UNIQUE NOT NULL CHECK (merchant_code ~ '^QM[0-9]{6}$'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchants_profile_id ON public.merchants(profile_id);
CREATE INDEX IF NOT EXISTS idx_merchants_code ON public.merchants(merchant_code);

-- ----------------------------------------------------------------------------
-- 3. WALLETS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallets (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    currency TEXT NOT NULL DEFAULT 'SAR',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for wallets updated_at
DROP TRIGGER IF EXISTS set_wallets_updated_at ON public.wallets;
CREATE TRIGGER set_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 4. TRANSACTIONS TABLE (Create if not exists & enrich)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_ref TEXT UNIQUE,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    net_amount NUMERIC(14,2),
    fee NUMERIC(14,2) DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'SAR',
    payment_method TEXT DEFAULT 'qpay_wallet',
    category TEXT DEFAULT 'Merchant Payment',
    status TEXT NOT NULL DEFAULT 'settled' CHECK (status IN ('pending', 'processing', 'settled', 'failed', 'refunded')),
    payer_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    payee_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    owner_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    payer_name TEXT,
    payee_name TEXT,
    sender_name TEXT,
    receiver_name TEXT,
    note TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for transactions updated_at
DROP TRIGGER IF EXISTS set_transactions_updated_at ON public.transactions;
CREATE TRIGGER set_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DO $$
BEGIN
  -- Add owner_profile_id if it doesn't exist (nullable)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'owner_profile_id'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN owner_profile_id UUID REFERENCES public.profiles(id);
  ELSE
    -- Make it nullable if it exists and is NOT NULL
    ALTER TABLE public.transactions ALTER COLUMN owner_profile_id DROP NOT NULL;
  END IF;

  -- Add payer_profile_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'payer_profile_id'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN payer_profile_id UUID REFERENCES public.profiles(id);
  END IF;

  -- Add payee_profile_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'payee_profile_id'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN payee_profile_id UUID REFERENCES public.profiles(id);
  END IF;

  -- Add payer_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'payer_name'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN payer_name TEXT;
  END IF;

  -- Add payee_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'payee_name'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN payee_name TEXT;
  END IF;
END $$;

-- Indexes on payer, payee, order_ref
CREATE INDEX IF NOT EXISTS idx_transactions_payer ON public.transactions(payer_profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payee ON public.transactions(payee_profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_ref ON public.transactions(order_ref);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at DESC);

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Wallets: SELECT only own wallet (using custom JWT sub claim)
DROP POLICY IF EXISTS wallets_select_own ON public.wallets;
CREATE POLICY wallets_select_own ON public.wallets
    FOR SELECT
    USING (profile_id::text = auth.jwt()->>'sub');

-- Transactions: SELECT where caller is payer or payee
DROP POLICY IF EXISTS transactions_select_party ON public.transactions;
CREATE POLICY transactions_select_party ON public.transactions
    FOR SELECT
    USING (
        payer_profile_id::text = auth.jwt()->>'sub'
        OR payee_profile_id::text = auth.jwt()->>'sub'
    );

-- Merchants: SELECT for authenticated users
DROP POLICY IF EXISTS merchants_select_authenticated ON public.merchants;
CREATE POLICY merchants_select_authenticated ON public.merchants
    FOR SELECT TO authenticated
    USING (true);

-- No client INSERT/UPDATE on wallets or transactions
-- (Only service_role / SECURITY DEFINER functions can modify)

-- ----------------------------------------------------------------------------
-- 6. REALTIME PUBLICATION (guarded)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 7. process_payment() — SECURITY DEFINER function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_payment(
    p_payer UUID,
    p_merchant_code TEXT,
    p_amount NUMERIC,
    p_idempotency_key TEXT
)
RETURNS SETOF public.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_payee_profile_id UUID;
    v_payee_name TEXT;
    v_payer_name TEXT;
    v_payer_balance NUMERIC;
    v_existing_tx public.transactions%ROWTYPE;
    v_lock_first UUID;
    v_lock_second UUID;
BEGIN
    -- 1. Idempotency check: return existing row if order_ref matches
    SELECT * INTO v_existing_tx
    FROM public.transactions
    WHERE order_ref = p_idempotency_key
    LIMIT 1;

    IF FOUND THEN
        RETURN NEXT v_existing_tx;
        RETURN;
    END IF;

    -- 2. Resolve merchant
    SELECT m.profile_id, m.business_name INTO v_payee_profile_id, v_payee_name
    FROM public.merchants m
    WHERE m.merchant_code = p_merchant_code;

    IF v_payee_profile_id IS NULL THEN
        RAISE EXCEPTION 'INVALID_MERCHANT';
    END IF;

    -- 3. Self-payment check
    IF p_payer = v_payee_profile_id THEN
        RAISE EXCEPTION 'SELF_PAYMENT';
    END IF;

    -- 4. Get payer name
    SELECT full_name INTO v_payer_name
    FROM public.profiles
    WHERE id = p_payer;

    -- 5. Lock wallets in consistent UUID order to prevent deadlocks
    IF p_payer < v_payee_profile_id THEN
        v_lock_first := p_payer;
        v_lock_second := v_payee_profile_id;
    ELSE
        v_lock_first := v_payee_profile_id;
        v_lock_second := p_payer;
    END IF;

    PERFORM 1 FROM public.wallets WHERE profile_id = v_lock_first FOR UPDATE;
    PERFORM 1 FROM public.wallets WHERE profile_id = v_lock_second FOR UPDATE;

    -- 6. Check payer balance
    SELECT balance INTO v_payer_balance
    FROM public.wallets
    WHERE profile_id = p_payer;

    IF v_payer_balance IS NULL OR v_payer_balance < p_amount THEN
        RAISE EXCEPTION 'INSUFFICIENT_BALANCE';
    END IF;

    -- 7. Debit payer
    UPDATE public.wallets
    SET balance = balance - p_amount,
        updated_at = NOW()
    WHERE profile_id = p_payer;

    -- 8. Credit payee
    UPDATE public.wallets
    SET balance = balance + p_amount,
        updated_at = NOW()
    WHERE profile_id = v_payee_profile_id;

    -- 9. Insert transaction row
    RETURN QUERY
    INSERT INTO public.transactions (
        order_ref,
        amount,
        net_amount,
        payment_method,
        category,
        status,
        payer_profile_id,
        payee_profile_id,
        payer_name,
        payee_name,
        sender_name,
        receiver_name,
        created_at
    ) VALUES (
        p_idempotency_key,
        p_amount,
        p_amount,
        'qpay_wallet',
        'Merchant Payment',
        'settled',
        p_payer,
        v_payee_profile_id,
        v_payer_name,
        v_payee_name,
        v_payer_name,
        v_payee_name,
        NOW()
    )
    RETURNING *;
END;
$$;

-- Revoke execute from public roles; only service_role can call
REVOKE EXECUTE ON FUNCTION public.process_payment(UUID, TEXT, NUMERIC, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_payment(UUID, TEXT, NUMERIC, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.process_payment(UUID, TEXT, NUMERIC, TEXT) FROM authenticated;

