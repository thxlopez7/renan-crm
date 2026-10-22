-- ============================================================================
-- MIGRATION: 20261022000006_audit_log_and_roles.sql
-- DESCRIPTION: Implements audit logging, daily cash registers table,
--              staff roles (owner, reception) and RLS protections.
-- AUTHOR: Senior Full-Stack Engineering (Hardening)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DAILY CASH REGISTERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_cash_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_date DATE NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Asuncion')::date,
    shift_name TEXT NOT NULL DEFAULT 'General',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    opened_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    closed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    closed_at TIMESTAMPTZ,
    opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (opening_balance >= 0),
    total_court_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_court_revenue >= 0),
    total_bar_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_bar_revenue >= 0),
    total_collected NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_collected >= 0),
    payment_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_daily_cash_registers_date ON public.daily_cash_registers (register_date);
CREATE INDEX IF NOT EXISTS idx_daily_cash_registers_status ON public.daily_cash_registers (status);

-- ----------------------------------------------------------------------------
-- 2. AUDIT LOG TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    user_id UUID,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON public.audit_log (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);

-- Trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_record_id TEXT;
    v_old JSONB := NULL;
    v_new JSONB := NULL;
BEGIN
    BEGIN
        v_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        v_record_id := OLD.id::text;
        v_old := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_record_id := NEW.id::text;
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_record_id := NEW.id::text;
        v_new := to_jsonb(NEW);
    END IF;

    INSERT INTO public.audit_log (
        user_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data
    ) VALUES (
        v_user_id,
        TG_OP,
        TG_TABLE_NAME,
        v_record_id,
        v_old,
        v_new
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Attach audit triggers
DROP TRIGGER IF EXISTS trg_audit_bookings ON public.bookings;
CREATE TRIGGER trg_audit_bookings
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS trg_audit_tabs ON public.tabs;
CREATE TRIGGER trg_audit_tabs
AFTER INSERT OR UPDATE OR DELETE ON public.tabs
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS trg_audit_tab_items ON public.tab_items;
CREATE TRIGGER trg_audit_tab_items
AFTER INSERT OR UPDATE OR DELETE ON public.tab_items
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS trg_audit_daily_cash_registers ON public.daily_cash_registers;
CREATE TRIGGER trg_audit_daily_cash_registers
AFTER INSERT OR UPDATE OR DELETE ON public.daily_cash_registers
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- ----------------------------------------------------------------------------
-- 3. STAFF ROLES TABLE & HELPER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'reception')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Backfill existing auth users as 'owner' by default to prevent access loss
DO $$
BEGIN
    INSERT INTO public.staff_roles (user_id, role)
    SELECT id, 'owner'
    FROM auth.users
    ON CONFLICT (user_id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    -- If auth.users is inaccessible during dry-runs or specific environments
    NULL;
END;
$$;

-- Helper function to fetch current authenticated user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN 'anon';
    END IF;

    SELECT role INTO v_role
    FROM public.staff_roles
    WHERE user_id = auth.uid();
    
    RETURN COALESCE(v_role, 'reception');
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. RLS POLICIES FOR CASH REGISTERS, AUDIT LOG & STAFF ROLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.daily_cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;

-- Staff Roles RLS
DROP POLICY IF EXISTS "Users can read own staff role or owner reads all" ON public.staff_roles;
CREATE POLICY "Users can read own staff role or owner reads all"
    ON public.staff_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.current_user_role() = 'owner');

DROP POLICY IF EXISTS "Only owners can modify staff roles" ON public.staff_roles;
CREATE POLICY "Only owners can modify staff roles"
    ON public.staff_roles FOR ALL
    TO authenticated
    USING (public.current_user_role() = 'owner')
    WITH CHECK (public.current_user_role() = 'owner');

-- Audit Log RLS (Owners only can view audit trail, direct modifications disallowed)
DROP POLICY IF EXISTS "Owners can view audit log" ON public.audit_log;
CREATE POLICY "Owners can view audit log"
    ON public.audit_log FOR SELECT
    TO authenticated
    USING (public.current_user_role() = 'owner');

-- Daily Cash Registers RLS
DROP POLICY IF EXISTS "Staff read cash registers" ON public.daily_cash_registers;
CREATE POLICY "Staff read cash registers"
    ON public.daily_cash_registers FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Staff insert cash registers" ON public.daily_cash_registers;
CREATE POLICY "Staff insert cash registers"
    ON public.daily_cash_registers FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Staff update cash registers" ON public.daily_cash_registers;
CREATE POLICY "Staff update cash registers"
    ON public.daily_cash_registers FOR UPDATE
    TO authenticated
    USING (
        public.current_user_role() = 'owner'
        OR (public.current_user_role() = 'reception' AND status = 'open')
    )
    WITH CHECK (
        public.current_user_role() = 'owner'
        OR (public.current_user_role() = 'reception' AND status = 'open')
    );

DROP POLICY IF EXISTS "Only owner can delete cash registers" ON public.daily_cash_registers;
CREATE POLICY "Only owner can delete cash registers"
    ON public.daily_cash_registers FOR DELETE
    TO authenticated
    USING (public.current_user_role() = 'owner');

-- Bookings Deletion Hardening: reception cannot delete bookings, only owners
DROP POLICY IF EXISTS "Staff delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Only owners can delete bookings" ON public.bookings;
CREATE POLICY "Only owners can delete bookings"
    ON public.bookings FOR DELETE
    TO authenticated
    USING (public.current_user_role() = 'owner');

-- ----------------------------------------------------------------------------
-- 5. VERIFICATION QUERY
-- ----------------------------------------------------------------------------
-- Run after migration to verify tables, triggers, and helper function:
/*
SELECT 
    t.table_name,
    c.column_name,
    c.data_type
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name
WHERE t.table_name IN ('daily_cash_registers', 'audit_log', 'staff_roles')
ORDER BY t.table_name, c.ordinal_position;

SELECT tgname, relname 
FROM pg_trigger
JOIN pg_class ON pg_class.oid = tgrelid
WHERE tgname IN (
    'trg_audit_bookings',
    'trg_audit_tabs',
    'trg_audit_tab_items',
    'trg_audit_daily_cash_registers'
);

SELECT public.current_user_role();
*/

-- ----------------------------------------------------------------------------
-- 6. ROLLBACK INSTRUCTIONS
-- ----------------------------------------------------------------------------
/*
DROP TRIGGER IF EXISTS trg_audit_daily_cash_registers ON public.daily_cash_registers;
DROP TRIGGER IF EXISTS trg_audit_tab_items ON public.tab_items;
DROP TRIGGER IF EXISTS trg_audit_tabs ON public.tabs;
DROP TRIGGER IF EXISTS trg_audit_bookings ON public.bookings;
DROP FUNCTION IF EXISTS public.process_audit_log();
DROP FUNCTION IF EXISTS public.current_user_role();
DROP TABLE IF EXISTS public.staff_roles CASCADE;
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.daily_cash_registers CASCADE;

-- Restore standard authenticated delete on bookings if desired:
CREATE POLICY "Staff delete bookings"
    ON public.bookings FOR DELETE
    TO authenticated
    USING (true);
*/
