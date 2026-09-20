-- ============================================================================
-- QPay OTP Verifications & Security Rate Limiting Migration
-- Version: 20260919143000_otp_verifications.sql
-- Description: Establishes backend OTP verification tracking, atomic attempts,
--              Postgres-backed rate limiting, and phone verification flag on profiles.
-- Security: Strict RLS with deny-all for anon/authenticated (service-role only).
-- ============================================================================

-- 1. OTP Verifications Table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(16) NOT NULL CHECK (phone ~ '^\+[1-9]\d{7,14}$'),
    provider VARCHAR(32) NOT NULL DEFAULT 'msg91',
    request_id VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'failed', 'max_attempts_exceeded')),
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    verified_at TIMESTAMPTZ,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial index for the hot path: newest pending verification for a phone
CREATE INDEX IF NOT EXISTS idx_otp_pending_phone
    ON public.otp_verifications (phone, created_at DESC)
    WHERE status = 'pending';

-- Index for retention purge
CREATE INDEX IF NOT EXISTS idx_otp_created_at
    ON public.otp_verifications (created_at);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_otp_updated_at ON public.otp_verifications;
CREATE TRIGGER trg_otp_updated_at
    BEFORE UPDATE ON public.otp_verifications
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Alter Profiles Table to add phone verification status
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

-- 3. Distributed Rate Limiting & Cooldown Table
CREATE TABLE IF NOT EXISTS public.otp_rate_events (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(16),
    ip_address INET,
    event_type VARCHAR(16) NOT NULL CHECK (event_type IN ('send', 'resend', 'verify')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_phone ON public.otp_rate_events (phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_ip ON public.otp_rate_events (ip_address, created_at DESC);

-- 4. Enable Row Level Security (Deny-all for public/anon; accessed strictly via service_role)
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_rate_events ENABLE ROW LEVEL SECURITY;
