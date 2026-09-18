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
CREATE POLICY profiles_owner_policy ON public.profiles
    FOR ALL
    USING (auth.uid() = user_id OR id::text = current_setting('request.jwt.claim.sub', true))
    WITH CHECK (auth.uid() = user_id OR id::text = current_setting('request.jwt.claim.sub', true));

-- Transfer Limits: Users can only read their own transfer limits
CREATE POLICY transfer_limits_owner_select ON public.user_transfer_limits
    FOR SELECT
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)));

-- KYC Records: Users can only see/submit their own KYC records
CREATE POLICY kyc_owner_policy ON public.user_kyc_records
    FOR ALL
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)))
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)));

-- Split Expenses: Creator or Participants can view the split expense
CREATE POLICY split_expenses_party_policy ON public.split_expenses
    FOR SELECT
    USING (
        creator_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true))
        OR id IN (SELECT split_id FROM public.split_members WHERE upi_id IN (SELECT upi_id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)))
    );

CREATE POLICY split_expenses_creator_insert ON public.split_expenses
    FOR INSERT
    WITH CHECK (creator_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)));

-- Split Members: Creator or Member can view their own participant record
CREATE POLICY split_members_party_policy ON public.split_members
    FOR SELECT
    USING (
        upi_id IN (SELECT upi_id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true))
        OR split_id IN (SELECT id FROM public.split_expenses WHERE creator_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)))
    );

-- Travel Bookings: Strict owner-only access
CREATE POLICY flight_bookings_owner_policy ON public.flight_bookings
    FOR ALL
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)))
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)));

CREATE POLICY airport_bookings_owner_policy ON public.airport_service_bookings
    FOR ALL
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)))
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)));

CREATE POLICY hotel_bookings_owner_policy ON public.hotel_reservations
    FOR ALL
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)))
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)));

-- Audit Logs: Insert allowed by authenticated backend services; NO update or delete allowed
CREATE POLICY audit_logs_insert_only ON public.fintech_audit_logs
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY audit_logs_read_auditors ON public.fintech_audit_logs
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE (user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)) AND role = 'compliance_auditor'));
