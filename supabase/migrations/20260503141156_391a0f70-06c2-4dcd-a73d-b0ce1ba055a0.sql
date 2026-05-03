
-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- WALLET TYPE
create type public.wallet_type as enum ('efectivo','banco','mercadopago','uala','naranja','credito');

-- WALLETS
create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type wallet_type not null,
  initial_balance numeric(14,2) not null default 0,
  closing_day smallint,
  due_day smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index wallets_user_idx on public.wallets(user_id);

alter table public.wallets enable row level security;
create policy "wallets select own" on public.wallets for select using (auth.uid() = user_id);
create policy "wallets insert own" on public.wallets for insert with check (auth.uid() = user_id);
create policy "wallets update own" on public.wallets for update using (auth.uid() = user_id);
create policy "wallets delete own" on public.wallets for delete using (auth.uid() = user_id);

-- TRANSACTIONS
create type public.tx_type as enum ('ingreso','gasto');

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  type tx_type not null,
  amount numeric(14,2) not null check (amount >= 0),
  category text not null,
  category_emoji text not null default '💸',
  notes text,
  occurred_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
create index tx_user_idx on public.transactions(user_id, occurred_at desc);
create index tx_wallet_idx on public.transactions(wallet_id);

alter table public.transactions enable row level security;
create policy "tx select own" on public.transactions for select using (auth.uid() = user_id);
create policy "tx insert own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "tx update own" on public.transactions for update using (auth.uid() = user_id);
create policy "tx delete own" on public.transactions for delete using (auth.uid() = user_id);

-- BUDGET CATEGORIES
create type public.budget_period as enum ('semanal','quincenal','mensual');

create table public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '📂',
  assigned numeric(14,2) not null default 0,
  period budget_period not null default 'mensual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index budget_user_idx on public.budget_categories(user_id);

alter table public.budget_categories enable row level security;
create policy "budget select own" on public.budget_categories for select using (auth.uid() = user_id);
create policy "budget insert own" on public.budget_categories for insert with check (auth.uid() = user_id);
create policy "budget update own" on public.budget_categories for update using (auth.uid() = user_id);
create policy "budget delete own" on public.budget_categories for delete using (auth.uid() = user_id);
