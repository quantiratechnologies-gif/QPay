-- Migration: 20260921160000_security_and_transactions_hardening.sql
-- Purpose: Security hardening for Profiles, KYC, Audit Logs, and authoritative Transactions table
-- Audit Items 2 & 3 Compliance

-- ============================================================================
-- 1. PROFILES PRIVILEGE ESCALATION PREVENTION
-- ============================================================================

-- Drop permissive ALL policy
DROP POLICY IF EXISTS profiles_owner_policy ON public.profiles;

-- Separate SELECT policy: users may view their own profile
CREATE POLICY profiles_owner_select ON public.profiles
    FOR SELECT
    USING (auth.uid() = user_id OR id::text = current_setting('request.jwt.claim.sub', true));

-- Separate UPDATE policy: users may only update non-sensitive profile columns
CREATE POLICY profiles_owner_update ON public.profiles
    FOR UPDATE
    USING (auth.uid() = user_id OR id::text = current_setting('request.jwt.claim.sub', true))
    WITH CHECK (auth.uid() = user_id OR id::text = current_setting('request.jwt.claim.sub', true));

-- BEFORE UPDATE trigger: blocks alteration of role, is_kyc_verified, and mobile
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow service_role to make administrative/service-level updates
    IF (current_setting('request.jwt.claim.role', true) = 'service_role' OR current_setting('role', true) = 'service_role') THEN
        RETURN NEW;
    END IF;

    -- Block unauthorized role escalation (e.g. customer -> admin)
    IF (NEW.role IS DISTINCT FROM OLD.role) THEN
        RAISE EXCEPTION 'Unauthorized: Users cannot alter their own account role (attempted role change from % to %).', OLD.role, NEW.role;
    END IF;

    -- Block unauthorized self-verification of KYC
    IF (NEW.is_kyc_verified IS DISTINCT FROM OLD.is_kyc_verified) THEN
        RAISE EXCEPTION 'Unauthorized: KYC verification status can only be modified by verified compliance services.';
    END IF;

    -- Block direct alteration of verified mobile number without SMS re-verification
    IF (NEW.mobile IS DISTINCT FROM OLD.mobile) THEN
        RAISE EXCEPTION 'Unauthorized: Verified mobile numbers cannot be updated directly.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_profile_privilege_escalation();


-- ============================================================================
-- 2. KYC RECORDS: SELECT & INSERT ONLY FOR USERS (NO USER UPDATE)
-- ============================================================================

DROP POLICY IF EXISTS kyc_owner_policy ON public.user_kyc_records;

-- Users may SELECT their own KYC records
CREATE POLICY kyc_owner_select ON public.user_kyc_records
    FOR SELECT
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)));

-- Users may INSERT their initial KYC submissions
CREATE POLICY kyc_owner_insert ON public.user_kyc_records
    FOR INSERT
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)));

-- Restrict UPDATE strictly to service_role (users cannot alter status to 'verified')
CREATE POLICY kyc_service_role_update ON public.user_kyc_records
    FOR UPDATE
    USING (current_setting('request.jwt.claim.role', true) = 'service_role' OR current_setting('role', true) = 'service_role')
    WITH CHECK (current_setting('request.jwt.claim.role', true) = 'service_role' OR current_setting('role', true) = 'service_role');


-- ============================================================================
-- 3. AUDIT LOGS: RESTRICT INSERT TO SERVICE_ROLE ONLY
-- ============================================================================

DROP POLICY IF EXISTS audit_logs_insert_only ON public.fintech_audit_logs;

CREATE POLICY audit_logs_service_role_insert ON public.fintech_audit_logs
    FOR INSERT
    WITH CHECK (
        current_setting('request.jwt.claim.role', true) = 'service_role'
        OR current_setting('role', true) = 'service_role'
    );


-- ============================================================================
-- 4. TRANSACTIONS TABLE WITH OWNER-ONLY SELECT AND SERVER-ONLY INSERT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_ref VARCHAR(64) NOT NULL UNIQUE,
    sender_name VARCHAR(120) NOT NULL,
    receiver_name VARCHAR(120) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    vat_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(4) NOT NULL DEFAULT 'SAR',
    payment_method VARCHAR(32) NOT NULL DEFAULT 'sarie',
    status VARCHAR(32) NOT NULL DEFAULT 'settled',
    card_last4 VARCHAR(4),
    category VARCHAR(64) NOT NULL DEFAULT 'Transfer',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_owner_profile_id ON public.transactions(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Owner-only SELECT: users can only view their own transactions
CREATE POLICY transactions_owner_select ON public.transactions
    FOR SELECT
    USING (
        owner_profile_id IN (
            SELECT id FROM public.profiles 
            WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)
        )
    );

-- No client INSERT allowed: only service_role (backend server) can record transactions
CREATE POLICY transactions_service_role_insert ON public.transactions
    FOR INSERT
    WITH CHECK (
        current_setting('request.jwt.claim.role', true) = 'service_role'
        OR current_setting('role', true) = 'service_role'
    );

-- Enable Supabase Realtime publication on transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;


-- ============================================================================
-- 6. SQL TEST QUERIES (Verification of Privilege Escalation Prevention)
-- ============================================================================
/*
-- TEST 1: Customer attempts to escalate role to 'admin' (MUST FAIL with exception)
SET ROLE authenticated;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
SET request.jwt.claim.role = 'authenticated';

UPDATE public.profiles
SET role = 'admin'
WHERE id = '00000000-0000-0000-0000-000000000001';
-- EXPECTED: ERROR: Unauthorized: Users cannot alter their own account role.

-- TEST 2: Customer attempts to mark own KYC as verified (MUST FAIL with exception)
UPDATE public.profiles
SET is_kyc_verified = true
WHERE id = '00000000-0000-0000-0000-000000000001';
-- EXPECTED: ERROR: Unauthorized: KYC verification status can only be modified by verified compliance services.

-- TEST 3: Customer attempts to insert fake audit log (MUST FAIL with RLS violation)
INSERT INTO public.fintech_audit_logs (actor_profile_id, event_type, action_status)
VALUES ('00000000-0000-0000-0000-000000000001', 'TAMPER', 'SUCCESS');
-- EXPECTED: ERROR: new row violates row-level security policy for table "fintech_audit_logs"

-- TEST 4: Customer attempts direct transaction insertion (MUST FAIL with RLS violation)
INSERT INTO public.transactions (owner_profile_id, order_ref, sender_name, receiver_name, amount, vat_amount, net_amount)
VALUES ('00000000-0000-0000-0000-000000000001', 'REF-HACK-1', 'Self', 'Self', 100000.00, 0, 100000.00);
-- EXPECTED: ERROR: new row violates row-level security policy for table "transactions"
*/
