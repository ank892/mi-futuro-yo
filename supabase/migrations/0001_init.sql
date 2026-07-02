-- Mi Futuro Yo — Esquema inicial
-- Wealth Rate Engine v1.0

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================
-- 1. UUID BRIDGE (arquitectura zero-knowledge)
-- =====================================================
create table if not exists uuid_bridge (
  id uuid primary key default uuid_generate_v4(),
  session_token text unique,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  country_code text,
  user_agent text
);

-- =====================================================
-- 2. FINANCIAL PROFILES (respuestas del quiz, sin PII)
-- =====================================================
create table if not exists financial_profiles (
  id uuid primary key default uuid_generate_v4(),
  bridge_id uuid references uuid_bridge(id) on delete cascade,
  age_range text not null,       -- 20-25, 26-30, 31-35, 36-40
  country text not null,          -- MX, CO, CR
  monthly_income_usd numeric not null,
  dependents int not null default 0,
  debt_relationship text not null,       -- no_debt, controlled, pressured, uncontrolled
  savings_rate_pct numeric not null default 0,
  savings_vehicles text[] not null default '{}',
  has_recurring_investment bool not null default false,
  recurring_investment_pct numeric default 0,
  emergency_months text not null,        -- 0-1, 2-3, 4-6, 6+
  has_health_insurance bool not null default false,
  knows_pension bool,                    -- null = no aplica
  financial_plan_clarity int not null default 5,
  financial_goal text,                   -- Q12: goal free text (opcional)
  created_at timestamptz default now()
);

create index if not exists idx_fp_bridge on financial_profiles(bridge_id);
create index if not exists idx_fp_country_age on financial_profiles(country, age_range);

-- =====================================================
-- 3. SCORES CACHE (resultados computados)
-- =====================================================
create table if not exists scores_cache (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid unique references financial_profiles(id) on delete cascade,
  overall_score numeric not null,
  score_label text not null,
  confidence text not null,
  s_ingreso numeric not null,
  s_ahorro numeric not null,
  s_crecimiento numeric not null,
  s_blindaje numeric not null,
  w_ingreso numeric not null,
  w_ahorro numeric not null,
  w_crecimiento numeric not null,
  w_blindaje numeric not null,
  percentile int not null,
  cohort_median numeric not null,
  total_leak_impact_20yr numeric not null,
  final_current numeric not null,
  final_optimized numeric not null,
  final_adverse numeric not null,
  full_result jsonb not null,       -- payload completo (leaks, boosters, trajectory)
  narrative text,                   -- generado por IA (opcional)
  created_at timestamptz default now()
);

create index if not exists idx_sc_profile on scores_cache(profile_id);

-- =====================================================
-- 4. MACRO CACHE (datos por país, actualizados periódicamente)
-- =====================================================
create table if not exists macro_cache (
  country text primary key,
  name text not null,
  currency text not null,
  currency_symbol text not null,
  exchange_rate_usd numeric not null,
  inflation_rate numeric not null,
  ppp_factor numeric not null,
  price_level_index numeric not null,
  health_oop_percent numeric not null,
  medical_inflation_rate numeric not null,
  financial_inclusion_rate numeric not null,
  emergency_coverage_2months numeric,
  pension_system text not null,
  pension_avg_return_low numeric not null,
  pension_avg_return_high numeric not null,
  catastrophic_health_probability numeric not null,
  disability_probability_annual numeric not null,
  income_percentiles jsonb not null,
  data_sources jsonb,
  updated_at timestamptz default now()
);

-- =====================================================
-- 5. GLOBAL BENCHMARKS
-- =====================================================
create table if not exists global_benchmarks (
  key text primary key,
  value numeric,
  metadata jsonb,
  source text,
  updated_at timestamptz default now()
);

-- =====================================================
-- 6. INSURANCE PROVIDERS
-- =====================================================
create table if not exists insurance_providers (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,         -- BMI, PALIG, VUMI, REDBRIDGE
  name text not null,
  countries text[] not null,
  website text,
  notes text
);

-- =====================================================
-- 7. INSURANCE PRODUCTS
-- =====================================================
create table if not exists insurance_products (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references insurance_providers(id) on delete cascade,
  code text unique not null,        -- OPTIMUM_VIP, MERIDIAN_II, PLAN_ORO, etc.
  name text not null,
  category text not null,           -- health, life, catastrophic, pediatric, income_protection
  coverage_type text,               -- comprehensive, catastrophic, term_life
  max_coverage_usd numeric,         -- null = ilimitado
  min_deductible_usd numeric,
  max_deductible_usd numeric,
  regions text[] not null,          -- ["worldwide"], ["latam"], etc.
  min_age int default 0,
  max_age int default 99,
  countries text[] not null,
  description text,
  metadata jsonb,
  active bool default true
);

create index if not exists idx_prod_category on insurance_products(category);
create index if not exists idx_prod_countries on insurance_products using gin(countries);

-- =====================================================
-- 8. INSURANCE PRICING (primas por edad)
-- =====================================================
create table if not exists insurance_pricing (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references insurance_products(id) on delete cascade,
  country text not null,
  age_from int not null,
  age_to int not null,
  deductible_usd numeric,
  annual_premium_usd numeric not null,
  monthly_premium_usd numeric,       -- calculado
  dependents int default 0,          -- 0 = individual, 1..N = con dependientes
  effective_year int default 2025
);

create index if not exists idx_pricing_lookup on insurance_pricing(product_id, country, age_from, age_to);

-- =====================================================
-- 9. LEADS (contact opt-in, encriptado, TTL 72h)
-- =====================================================
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  bridge_id uuid references uuid_bridge(id) on delete cascade,
  profile_id uuid references financial_profiles(id) on delete cascade,
  full_name_encrypted text,
  email_encrypted text,
  phone_encrypted text,
  country text not null,
  preferred_channel text default 'whatsapp',  -- whatsapp | email | call
  consent_given bool default true,
  consent_at timestamptz default now(),
  status text default 'new',        -- new, contacted, closed_won, closed_lost, expired
  agent_id uuid,
  agent_notes text,
  expires_at timestamptz default now() + interval '72 hours',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_expires on leads(expires_at);

-- =====================================================
-- 10. AGENTS (asesores)
-- =====================================================
create table if not exists agents (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text unique not null,
  countries text[] not null,
  provider_codes text[] not null,   -- pueden vender múltiples aseguradoras
  commission_model text default 'per_lead', -- per_lead | commission_pct
  active bool default true,
  created_at timestamptz default now()
);

-- =====================================================
-- 11. EVENTS (analytics, sin PII)
-- =====================================================
create table if not exists analytics_events (
  id uuid primary key default uuid_generate_v4(),
  bridge_id uuid references uuid_bridge(id) on delete cascade,
  event_type text not null,         -- quiz_started, quiz_step, quiz_completed, score_viewed, booster_clicked, share_generated, lead_captured
  payload jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_ev_type on analytics_events(event_type);
create index if not exists idx_ev_created on analytics_events(created_at desc);

-- =====================================================
-- 12. BOOSTER RECOMMENDATIONS CACHE
-- (recomendación específica de producto para un profile)
-- =====================================================
create table if not exists booster_recommendations (
  id uuid primary key default uuid_generate_v4(),
  score_cache_id uuid references scores_cache(id) on delete cascade,
  product_id uuid references insurance_products(id),
  leak_id text,                     -- leak_id que atiende (no_health_insurance, etc)
  monthly_cost_usd numeric,
  annual_cost_usd numeric,
  leak_impact_covered_usd numeric,
  roa_multiplier numeric,           -- leak impact / annual cost
  rank int,                         -- 1 (mejor), 2, 3
  rationale text,
  created_at timestamptz default now()
);

create index if not exists idx_boost_cache on booster_recommendations(score_cache_id, rank);

-- =====================================================
-- ROW LEVEL SECURITY (simple: público lee referencias, escribe con service key)
-- =====================================================
alter table macro_cache enable row level security;
alter table global_benchmarks enable row level security;
alter table insurance_providers enable row level security;
alter table insurance_products enable row level security;
alter table insurance_pricing enable row level security;

-- Solo lectura pública en catálogos
create policy "public_read_macro" on macro_cache for select using (true);
create policy "public_read_bench" on global_benchmarks for select using (true);
create policy "public_read_providers" on insurance_providers for select using (true);
create policy "public_read_products" on insurance_products for select using (active = true);
create policy "public_read_pricing" on insurance_pricing for select using (true);

-- Datos de usuario: service_role escribe (bypassa RLS); no lectura pública sin filtro
alter table financial_profiles enable row level security;
alter table scores_cache enable row level security;
alter table leads enable row level security;
alter table booster_recommendations enable row level security;
alter table uuid_bridge enable row level security;
alter table analytics_events enable row level security;

-- Función helper: monthly premium calculado
create or replace function update_monthly_premium() returns trigger as $$
begin
  new.monthly_premium_usd := round(new.annual_premium_usd / 12.0, 2);
  return new;
end $$ language plpgsql;

drop trigger if exists trg_monthly_premium on insurance_pricing;
create trigger trg_monthly_premium
  before insert or update on insurance_pricing
  for each row execute function update_monthly_premium();
