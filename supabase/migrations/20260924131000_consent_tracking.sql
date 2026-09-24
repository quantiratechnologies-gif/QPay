-- ==============================================================================
-- Migration: Consent Tracking & Audit Logging (Phase 2)
-- Timestamp: 20260924131000
-- ==============================================================================

-- 1. Add consent tracking columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version       TEXT,
  ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS privacy_version     TEXT,
  ADD COLUMN IF NOT EXISTS consent_ip          TEXT;

-- 2. Create append-only consent audit log table
CREATE TABLE IF NOT EXISTS public.consent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('TERMS', 'PRIVACY_POLICY', 'ALL')),
  version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_consent_audit_log_profile ON public.consent_audit_log(profile_id);

-- Enable RLS on consent_audit_log
ALTER TABLE public.consent_audit_log ENABLE ROW LEVEL SECURITY;

-- Owner SELECT only
CREATE POLICY consent_audit_log_owner_select ON public.consent_audit_log
  FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)
    )
  );

-- Service role INSERT only
CREATE POLICY consent_audit_log_service_role_insert ON public.consent_audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 3. Data export requests table for Privacy & Data Controls
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  download_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_data_export_requests_profile ON public.data_export_requests(profile_id);

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY data_export_requests_owner_policy ON public.data_export_requests
  FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid() OR id::text = current_setting('request.jwt.claim.sub', true)
    )
  );
