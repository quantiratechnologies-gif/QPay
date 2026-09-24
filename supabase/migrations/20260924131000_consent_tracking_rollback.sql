-- ==============================================================================
-- Rollback Migration: Consent Tracking & Audit Logging (Phase 2)
-- Timestamp: 20260924131000
-- ==============================================================================

DROP TABLE IF EXISTS public.data_export_requests;
DROP TABLE IF EXISTS public.consent_audit_log;

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS consent_ip,
  DROP COLUMN IF EXISTS privacy_version,
  DROP COLUMN IF EXISTS privacy_accepted_at,
  DROP COLUMN IF EXISTS terms_version,
  DROP COLUMN IF EXISTS terms_accepted_at;
