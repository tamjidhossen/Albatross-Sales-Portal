-- ==============================================================================
-- ALBATROSS FAST FOOD CART - COMPLETE PRODUCTION DATABASE SCHEMA
-- Tailored for Daily Closing Workflow, Anti-Theft Cash Reconciliation & Supabase RLS
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Roles & Profiles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    phone TEXT,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'admin' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Customizable Product Catalog (Street Items)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    bengali_name TEXT,
    default_price NUMERIC(10, 2) NOT NULL CHECK (default_price > 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    can_carryover BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Preload Albatross Active Street Menu Items
INSERT INTO public.products (id, name, bengali_name, default_price, is_active, can_carryover, sort_order) VALUES
    ('momo-chicken', 'Chicken Momo (8 pcs)', 'চিকেন মোমো (৮ পিস)', 120.00, TRUE, TRUE, 1),
    ('burger-tuni', 'Tuni Burger Box (3 pcs)', 'টুনি বার্গার (৩ পিস)', 60.00, TRUE, TRUE, 2),
    ('pizza-bread', 'Cheesy Bread Pizza 6"', 'চিজি ব্রেড পিৎজা ৬ ইঞ্চি', 100.00, TRUE, TRUE, 3),
    ('snack-meatbox', 'Loaded Meat Box', 'লোডেড মিট বক্স', 120.00, TRUE, TRUE, 4),
    ('snack-hotdog', 'Chicken Hot Dog', 'চিকেন হট ডগ', 60.00, TRUE, TRUE, 5),
    ('snack-roll', 'Crispy Chicken Roll', 'চিকেন রোল', 60.00, TRUE, TRUE, 6),
    ('burger-arabian', 'Tuni Arabian Box (3 pcs)', 'টুনি এরাবিয়ান (৩ পিস)', 60.00, TRUE, TRUE, 7)
ON CONFLICT (id) DO UPDATE 
SET default_price = EXCLUDED.default_price, name = EXCLUDED.name, bengali_name = EXCLUDED.bengali_name;

-- 4. Central Unit: Daily Sessions (Daily Closing Record)
CREATE TABLE IF NOT EXISTS public.daily_sessions (
    session_date DATE PRIMARY KEY,
    status TEXT DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'closed')),
    is_locked BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Cash tracking
    opening_cash NUMERIC(10, 2) DEFAULT 1000.00 NOT NULL CHECK (opening_cash >= 0),
    khuchra_taken_from_reserve NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (khuchra_taken_from_reserve >= 0),
    opening_saved_cash NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (opening_saved_cash >= 0),
    
    -- Product movement totals
    total_products_prepared INT DEFAULT 0 NOT NULL CHECK (total_products_prepared >= 0),
    total_products_sold INT DEFAULT 0 NOT NULL CHECK (total_products_sold >= 0),
    total_products_wasted INT DEFAULT 0 NOT NULL CHECK (total_products_wasted >= 0),
    
    -- Revenue & Sales (Nightly inventory-derived calculations)
    gross_estimated_revenue NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (gross_estimated_revenue >= 0),
    estimated_discounts NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (estimated_discounts >= 0),
    net_estimated_revenue NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (net_estimated_revenue >= 0),
    
    -- Expenses & Payouts totals
    total_expenses NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (total_expenses >= 0),
    total_payouts NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (total_payouts >= 0),
    
    -- Anti-Theft Cash Reconciliation
    expected_closing_cash NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    actual_cash_counted NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (actual_cash_counted >= 0),
    cash_difference NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    
    -- Business Reserve Allocation
    transferred_to_reserve NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (transferred_to_reserve >= 0),
    closing_cart_cash NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (closing_cart_cash >= 0),
    closing_saved_cash NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (closing_saved_cash >= 0),
    
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    closed_by UUID REFERENCES public.profiles(id),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Daily Inventory Items per Session (Morning stock + Nightly count)
CREATE TABLE IF NOT EXISTS public.daily_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_date DATE NOT NULL REFERENCES public.daily_sessions(session_date) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price > 0),
    
    -- Morning inputs
    morning_carried_over INT DEFAULT 0 NOT NULL CHECK (morning_carried_over >= 0),
    morning_new_prepared INT DEFAULT 0 NOT NULL CHECK (morning_new_prepared >= 0),
    total_available INT GENERATED ALWAYS AS (morning_carried_over + morning_new_prepared) STORED,
    
    -- Nightly counts
    closing_counted INT DEFAULT 0 NOT NULL CHECK (closing_counted >= 0),
    closing_usable_leftover INT DEFAULT 0 NOT NULL CHECK (closing_usable_leftover >= 0),
    closing_wasted INT DEFAULT 0 NOT NULL CHECK (closing_wasted >= 0),
    
    -- Derived calculations
    quantity_sold INT GENERATED ALWAYS AS (
        GREATEST(0, (morning_carried_over + morning_new_prepared) - closing_usable_leftover - closing_wasted)
    ) STORED,
    estimated_revenue NUMERIC(10, 2) GENERATED ALWAYS AS (
        GREATEST(0, (morning_carried_over + morning_new_prepared) - closing_usable_leftover - closing_wasted) * unit_price
    ) STORED,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_product_per_session UNIQUE(session_date, product_id)
);

-- 6. Daily Bazaar & Supply Expenses
CREATE TABLE IF NOT EXISTS public.daily_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_date DATE NOT NULL REFERENCES public.daily_sessions(session_date) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN (
        'Chicken', 
        'Bread & Buns', 
        'Cooking Oil & Spices', 
        'Packaging & Disposables', 
        'Cylinder Gas',
        'Transport',
        'Cart Maintenance',
        'Other'
    )),
    item_name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    paid_by_name TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Daily Staff & Owner Payouts (Profit divide / Daily salary)
CREATE TABLE IF NOT EXISTS public.daily_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_date DATE NOT NULL REFERENCES public.daily_sessions(session_date) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payout_type TEXT DEFAULT 'Staff Daily Pay' NOT NULL CHECK (payout_type IN (
        'Staff Daily Pay', 
        'Owner Withdrawal', 
        'Profit Share', 
        'Emergency Cart Expense'
    )),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Audit Trail / Change History (Strictly Append-Only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('session', 'inventory', 'expense', 'payout', 'product')),
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOCK', 'UNLOCK')),
    changed_field TEXT,
    old_value TEXT,
    new_value TEXT,
    changed_by_name TEXT NOT NULL,
    changed_by_role user_role NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for lightning fast mobile queries
CREATE INDEX IF NOT EXISTS idx_inventory_session ON public.daily_inventory(session_date);
CREATE INDEX IF NOT EXISTS idx_expenses_session ON public.daily_expenses(session_date);
CREATE INDEX IF NOT EXISTS idx_payouts_session ON public.daily_payouts(session_date);
CREATE INDEX IF NOT EXISTS idx_audit_record ON public.audit_logs(record_id);

-- ==============================================================================
-- 9. STORED PROCEDURES & WORKFLOW HELPERS
-- ==============================================================================

-- A. Recalculate session totals automatically
CREATE OR REPLACE FUNCTION public.recalculate_session_totals(p_date DATE)
RETURNS VOID AS $$
DECLARE
    v_gross NUMERIC(10, 2) := 0;
    v_prepared INT := 0;
    v_sold INT := 0;
    v_wasted INT := 0;
    v_expenses NUMERIC(10, 2) := 0;
    v_payouts NUMERIC(10, 2) := 0;
    v_opening_cash NUMERIC(10, 2) := 0;
    v_discounts NUMERIC(10, 2) := 0;
    v_net NUMERIC(10, 2) := 0;
    v_expected NUMERIC(10, 2) := 0;
    v_actual NUMERIC(10, 2) := 0;
BEGIN
    -- Inventory sums
    SELECT 
        COALESCE(SUM(total_available), 0),
        COALESCE(SUM(quantity_sold), 0),
        COALESCE(SUM(closing_wasted), 0),
        COALESCE(SUM(estimated_revenue), 0)
    INTO v_prepared, v_sold, v_wasted, v_gross
    FROM public.daily_inventory
    WHERE session_date = p_date;

    -- Expenses sum
    SELECT COALESCE(SUM(amount), 0) INTO v_expenses
    FROM public.daily_expenses
    WHERE session_date = p_date;

    -- Payouts sum
    SELECT COALESCE(SUM(amount), 0) INTO v_payouts
    FROM public.daily_payouts
    WHERE session_date = p_date;

    -- Current session fields
    SELECT opening_cash, estimated_discounts, actual_cash_counted
    INTO v_opening_cash, v_discounts, v_actual
    FROM public.daily_sessions
    WHERE session_date = p_date;

    v_net := GREATEST(0, v_gross - v_discounts);
    v_expected := v_opening_cash + v_net - v_expenses - v_payouts;

    -- Update session record
    UPDATE public.daily_sessions
    SET 
        total_products_prepared = v_prepared,
        total_products_sold = v_sold,
        total_products_wasted = v_wasted,
        gross_estimated_revenue = v_gross,
        net_estimated_revenue = v_net,
        total_expenses = v_expenses,
        total_payouts = v_payouts,
        expected_closing_cash = v_expected,
        cash_difference = (v_actual - v_expected),
        updated_at = NOW()
    WHERE session_date = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Start / Initialize Today's Session with Yesterday's Usable Leftovers
CREATE OR REPLACE FUNCTION public.start_daily_session(p_date DATE, p_opening_cash NUMERIC DEFAULT 1000.00)
RETURNS VOID AS $$
DECLARE
    prev_date DATE := p_date - INTERVAL '1 day';
    prev_saved NUMERIC(10, 2) := 0;
BEGIN
    -- Get previous day's closing saved cash
    SELECT COALESCE(closing_saved_cash, 0) INTO prev_saved
    FROM public.daily_sessions
    WHERE session_date = prev_date;

    -- Create or initialize session
    INSERT INTO public.daily_sessions (
        session_date,
        status,
        is_locked,
        opening_cash,
        opening_saved_cash,
        closing_saved_cash,
        created_at,
        updated_at
    ) VALUES (
        p_date,
        'open',
        FALSE,
        p_opening_cash,
        prev_saved,
        prev_saved,
        NOW(),
        NOW()
    )
    ON CONFLICT (session_date) DO NOTHING;

    -- Preload active products with yesterday's approved usable leftovers
    INSERT INTO public.daily_inventory (
        session_date,
        product_id,
        product_name,
        unit_price,
        morning_carried_over,
        morning_new_prepared
    )
    SELECT 
        p_date,
        prod.id,
        prod.name,
        prod.default_price,
        COALESCE(prev_inv.closing_usable_leftover, 0),
        0
    FROM public.products prod
    LEFT JOIN public.daily_inventory prev_inv 
        ON prev_inv.session_date = prev_date AND prev_inv.product_id = prod.id
    WHERE prod.is_active = TRUE
    ON CONFLICT (session_date, product_id) DO NOTHING;

    -- Recalculate
    PERFORM public.recalculate_session_totals(p_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 10. AUTH TRIGGER & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- A. Auto-create Profile Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, phone, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'phone', new.phone, ''),
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        CASE 
            WHEN new.raw_user_meta_data->>'role' = 'super_admin' THEN 'super_admin'::public.user_role
            ELSE 'admin'::public.user_role
        END
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
    RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user error: %', SQLERRM;
        RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Remove any interfering before-insert triggers
DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
DROP FUNCTION IF EXISTS public.auto_confirm_user();
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper roles
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated read; only super_admin updates roles
CREATE POLICY "Allow authenticated read profiles" ON public.profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Allow super_admin update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_super_admin());

-- Products: Admins read; only super_admin modifies products/prices
CREATE POLICY "Allow authenticated read products" ON public.products FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Allow super_admin manage products" ON public.products FOR ALL TO authenticated USING (public.is_super_admin());

-- Daily Sessions:
-- Admins can read sessions
CREATE POLICY "Allow admins read daily_sessions" ON public.daily_sessions FOR SELECT TO authenticated USING (public.is_admin());
-- Admins can insert today's session
CREATE POLICY "Allow admins insert daily_sessions" ON public.daily_sessions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
-- Admins can update ONLY IF NOT LOCKED; Super Admin can always update
CREATE POLICY "Allow update daily_sessions" ON public.daily_sessions FOR UPDATE TO authenticated USING (
    public.is_super_admin() OR (public.is_admin() AND is_locked = FALSE)
);

-- Daily Inventory:
CREATE POLICY "Allow admins read daily_inventory" ON public.daily_inventory FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Allow insert daily_inventory" ON public.daily_inventory FOR INSERT TO authenticated WITH CHECK (
    public.is_super_admin() OR (
        public.is_admin() AND EXISTS (
            SELECT 1 FROM public.daily_sessions s WHERE s.session_date = session_date AND s.is_locked = FALSE
        )
    )
);
CREATE POLICY "Allow update daily_inventory" ON public.daily_inventory FOR UPDATE TO authenticated USING (
    public.is_super_admin() OR (
        public.is_admin() AND EXISTS (
            SELECT 1 FROM public.daily_sessions s WHERE s.session_date = session_date AND s.is_locked = FALSE
        )
    )
);

-- Daily Expenses:
CREATE POLICY "Allow admins read daily_expenses" ON public.daily_expenses FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Allow insert daily_expenses" ON public.daily_expenses FOR INSERT TO authenticated WITH CHECK (
    public.is_super_admin() OR (
        public.is_admin() AND EXISTS (
            SELECT 1 FROM public.daily_sessions s WHERE s.session_date = session_date AND s.is_locked = FALSE
        )
    )
);
CREATE POLICY "Allow delete daily_expenses" ON public.daily_expenses FOR DELETE TO authenticated USING (
    public.is_super_admin() OR (
        public.is_admin() AND EXISTS (
            SELECT 1 FROM public.daily_sessions s WHERE s.session_date = session_date AND s.is_locked = FALSE
        )
    )
);

-- Daily Payouts:
CREATE POLICY "Allow admins read daily_payouts" ON public.daily_payouts FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Allow insert daily_payouts" ON public.daily_payouts FOR INSERT TO authenticated WITH CHECK (
    public.is_super_admin() OR (
        public.is_admin() AND EXISTS (
            SELECT 1 FROM public.daily_sessions s WHERE s.session_date = session_date AND s.is_locked = FALSE
        )
    )
);
CREATE POLICY "Allow delete daily_payouts" ON public.daily_payouts FOR DELETE TO authenticated USING (
    public.is_super_admin() OR (
        public.is_admin() AND EXISTS (
            SELECT 1 FROM public.daily_sessions s WHERE s.session_date = session_date AND s.is_locked = FALSE
        )
    )
);

-- Audit Logs: Read-only for admins, insertable on action, NEVER updatable/deletable (immutable)
CREATE POLICY "Allow admins read audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Allow authenticated insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- ==============================================================================
-- 11. GRANT PERMISSIONS TO SUPABASE ROLES
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- Allow public menu readers to view active street products
DROP POLICY IF EXISTS "Allow anon read active products" ON public.products;
CREATE POLICY "Allow anon read active products" ON public.products FOR SELECT TO anon USING (is_active = TRUE);

