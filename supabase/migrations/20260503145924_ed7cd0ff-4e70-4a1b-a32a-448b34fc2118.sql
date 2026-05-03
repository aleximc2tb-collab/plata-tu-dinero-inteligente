-- Frequency enum
CREATE TYPE public.recurrence_frequency AS ENUM ('diaria','semanal','quincenal','mensual');

-- Recurring transactions table
CREATE TABLE public.recurring_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_id UUID NOT NULL,
  type public.tx_type NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  category_emoji TEXT NOT NULL DEFAULT '🔁',
  notes TEXT,
  frequency public.recurrence_frequency NOT NULL DEFAULT 'mensual',
  next_run DATE NOT NULL,
  end_date DATE,
  installments_total INTEGER,
  installments_paid INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rec select own" ON public.recurring_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rec insert own" ON public.recurring_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rec update own" ON public.recurring_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "rec delete own" ON public.recurring_transactions FOR DELETE USING (auth.uid() = user_id);

-- Track which recurring generated a transaction (optional)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS recurring_id UUID;

CREATE INDEX idx_recurring_user_active_next ON public.recurring_transactions(user_id, active, next_run);
