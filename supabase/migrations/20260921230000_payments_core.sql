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
