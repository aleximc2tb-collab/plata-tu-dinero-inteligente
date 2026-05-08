-- Add simple payment status to budget categories
DO $$ BEGIN
  CREATE TYPE public.budget_status AS ENUM ('pendiente', 'pagado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('efectivo', 'banco', 'mercadopago', 'tarjeta');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.budget_categories
  ADD COLUMN IF NOT EXISTS status public.budget_status NOT NULL DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS payment_method public.payment_method NULL,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz NULL;