ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS source_name text,
  ADD COLUMN IF NOT EXISTS merchant text;

CREATE UNIQUE INDEX IF NOT EXISTS transactions_dedup_ticket
  ON public.transactions (user_id, amount, occurred_at, merchant)
  WHERE merchant IS NOT NULL AND deleted_at IS NULL;