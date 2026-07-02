-- ============================================================
-- Mi Futuro Yo — SETUP COMPLETO
-- Copia y pega este archivo en el SQL Editor de Supabase
-- https://supabase.com/dashboard/project/etnggjcfigvyxhvhstxh/sql
-- ============================================================

-- Mi Futuro Yo â€” Esquema inicial
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
-- 4. MACRO CACHE (datos por paÃ­s, actualizados periÃ³dicamente)
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
  provider_codes text[] not null,   -- pueden vender mÃºltiples aseguradoras
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
-- (recomendaciÃ³n especÃ­fica de producto para un profile)
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
-- ROW LEVEL SECURITY (simple: pÃºblico lee referencias, escribe con service key)
-- =====================================================
alter table macro_cache enable row level security;
alter table global_benchmarks enable row level security;
alter table insurance_providers enable row level security;
alter table insurance_products enable row level security;
alter table insurance_pricing enable row level security;

-- Solo lectura pÃºblica en catÃ¡logos
create policy "public_read_macro" on macro_cache for select using (true);
create policy "public_read_bench" on global_benchmarks for select using (true);
create policy "public_read_providers" on insurance_providers for select using (true);
create policy "public_read_products" on insurance_products for select using (active = true);
create policy "public_read_pricing" on insurance_pricing for select using (true);

-- Datos de usuario: service_role escribe (bypassa RLS); no lectura pÃºblica sin filtro
alter table financial_profiles enable row level security;
alter table scores_cache enable row level security;
alter table leads enable row level security;
alter table booster_recommendations enable row level security;
alter table uuid_bridge enable row level security;
alter table analytics_events enable row level security;

-- FunciÃ³n helper: monthly premium calculado
create or replace function update_monthly_premium() returns trigger as $$
begin
  new.monthly_premium_usd := round(new.annual_premium_usd / 12.0, 2);
  return new;
end $$ language plpgsql;

drop trigger if exists trg_monthly_premium on insurance_pricing;
create trigger trg_monthly_premium
  before insert or update on insurance_pricing
  for each row execute function update_monthly_premium();


-- Mi Futuro Yo â€” Seed data: macro cache, benchmarks, insurance products

-- =====================================================
-- MACRO CACHE (paÃ­s data)
-- =====================================================
insert into macro_cache (country, name, currency, currency_symbol, exchange_rate_usd, inflation_rate, ppp_factor, price_level_index, health_oop_percent, medical_inflation_rate, financial_inclusion_rate, emergency_coverage_2months, pension_system, pension_avg_return_low, pension_avg_return_high, catastrophic_health_probability, disability_probability_annual, income_percentiles, data_sources)
values
  ('MX', 'MÃ©xico', 'MXN', '$', 17.2, 0.042, 0.7467, 74.67, 41.24, 0.08, 0.67, 0.32, 'AFORE', 0.04, 0.09, 0.042, 0.008,
    '{"20-25":{"p25":500,"p50":900,"p75":1600,"p90":2800},"26-30":{"p25":650,"p50":1200,"p75":2200,"p90":3500},"31-35":{"p25":800,"p50":1500,"p75":2800,"p90":4500},"36-40":{"p25":900,"p50":1800,"p75":3200,"p90":5200}}'::jsonb,
    '{"income":"INEGI ENIGH 2024 + CEPAL BADEHOG","inflation":"Banxico INPC 2026","health":"CNSF + OPS/OMS GHED 2024","ppp":"ICP 2021 World Bank"}'::jsonb),
  ('CO', 'Colombia', 'COP', '$', 4200, 0.055, 0.7237, 72.37, 16.0, 0.065, 0.73, 0.30, 'AFP (Colpensiones/Privado)', 0.035, 0.08, 0.025, 0.007,
    '{"20-25":{"p25":350,"p50":700,"p75":1300,"p90":2200},"26-30":{"p25":500,"p50":950,"p75":1700,"p90":2900},"31-35":{"p25":600,"p50":1100,"p75":2200,"p90":3800},"36-40":{"p25":700,"p50":1300,"p75":2600,"p90":4200}}'::jsonb,
    '{"income":"DANE GEIH 2024 + CEPAL BADEHOG","inflation":"BanRep 2026","health":"MinSalud + OPS/OMS GHED 2024"}'::jsonb),
  ('CR', 'Costa Rica', 'CRC', 'â‚¡', 510, 0.025, 0.8976, 89.76, 24.13, 0.055, 0.72, 0.38, 'IVM-CCSS + Complementaria', 0.04, 0.075, 0.020, 0.006,
    '{"20-25":{"p25":550,"p50":1000,"p75":1800,"p90":3000},"26-30":{"p25":700,"p50":1300,"p75":2300,"p90":3700},"31-35":{"p25":850,"p50":1600,"p75":2900,"p90":4600},"36-40":{"p25":950,"p50":1800,"p75":3200,"p90":5500}}'::jsonb,
    '{"income":"INEC ENIGH 2024 + CEPAL BADEHOG","inflation":"BCCR 2026","health":"CCSS + OPS/OMS GHED 2024"}'::jsonb)
on conflict (country) do update set updated_at = now();

-- =====================================================
-- GLOBAL BENCHMARKS
-- =====================================================
insert into global_benchmarks (key, value, metadata, source) values
  ('msci_em_latam_10yr_return', 0.0837, null, 'MSCI EM Latin America Index Factsheet Abril 2026'),
  ('msci_em_latam_volatility', 0.2611, null, 'MSCI EM Latin America Index Factsheet Abril 2026'),
  ('msci_em_latam_sharpe', 0.36, null, 'MSCI EM Latin America Index Factsheet Abril 2026'),
  ('msci_em_latam_dividend_yield', 0.0468, null, 'MSCI EM Latin America Index Factsheet Abril 2026'),
  ('risk_free_rate_latam_avg', 0.05, null, 'IMF WEO 2026'),
  ('latam_savings_rate_avg', 0.12, null, 'Global Findex 2025 + CEPAL'),
  ('latam_prof_savings_rate_avg', 0.15, null, 'Global Findex 2025'),
  ('latam_emergency_coverage_avg_months', 1.8, null, 'Global Findex 2025'),
  ('latam_health_insurance_penetration_25_40', 0.28, null, 'OPS 2024'),
  ('latam_pension_awareness_rate', 0.35, null, 'OECD Pensions at a Glance 2025'),
  ('latam_recurring_investment_rate_25_40', 0.18, null, 'Global Findex 2025')
on conflict (key) do update set value = excluded.value, updated_at = now();

-- =====================================================
-- INSURANCE PROVIDERS
-- =====================================================
insert into insurance_providers (code, name, countries, website, notes) values
  ('BMI', 'BMI Financial Group', array['MX','CO','CR'], 'https://bmicos.com', 'Aseguradora internacional con planes Meridian y Serie 3000'),
  ('PALIG', 'Pan-American Life Insurance Group', array['MX','CO','CR'], 'https://palig.com', 'Planes Oro, Diamante y Acceso Mundial'),
  ('VUMI', 'VIP Universal Medical Insurance', array['MX','CO','CR'], 'https://vumigroup.com', 'Optimum VIP para eventos catastrÃ³ficos'),
  ('REDBRIDGE', 'Redbridge / RedChoice', array['MX','CO','CR'], 'https://redbridge.cc', 'RedChoice Care internacional')
on conflict (code) do nothing;

-- =====================================================
-- INSURANCE PRODUCTS
-- =====================================================
insert into insurance_products (provider_id, code, name, category, coverage_type, max_coverage_usd, min_deductible_usd, max_deductible_usd, regions, min_age, max_age, countries, description, metadata)
select p.id, x.code, x.name, x.category, x.coverage_type, x.max_coverage_usd, x.min_ded, x.max_ded, x.regions, x.min_age, x.max_age, x.countries, x.description, x.metadata
from insurance_providers p
join (values
  ('BMI', 'BMI_MERIDIAN_II', 'BMI Meridian II', 'health', 'comprehensive', 7000000, 500, 20000, array['worldwide'], 0, 99, array['MX','CO','CR'],
    'Plan mÃ©dico comprehensivo con cobertura mundial, libre elecciÃ³n de mÃ©dicos. Incluye maternidad ($7.5K) y transplantes.',
    '{"features":["Libre elecciÃ³n","Maternidad","Transplantes","Rider vida opcional"]}'::jsonb),
  ('BMI', 'BMI_MERIDIAN_II_PLUS', 'BMI Meridian II Plus', 'health', 'comprehensive', 10000000, 500, 20000, array['worldwide'], 0, 99, array['MX','CO','CR'],
    'Plan premium con cobertura mÃ¡xima $10M, mundial. Maternidad $10K.',
    '{"features":["Cobertura mÃ¡xima","Maternidad premium","Rider vida"]}'::jsonb),
  ('BMI', 'BMI_SERIE_3000', 'BMI Serie 3000', 'health', 'comprehensive', null, 500, 60000, array['worldwide'], 0, 99, array['MX','CO','CR'],
    'Cobertura sin lÃ­mite anual, libre elecciÃ³n global. Waivers de deducible por accidente.',
    '{"features":["Sin lÃ­mite","Waiver por accidente","Telemedicina"]}'::jsonb),
  ('PALIG', 'PALIG_ACCESO_MUNDIAL', 'PALIG Acceso Mundial', 'health', 'comprehensive', 5000000, 1000, 20000, array['worldwide'], 0, 99, array['MX','CO','CR'],
    'Plan private-client, cobertura mundial, incluye padres e hijos polÃ­ticos. Segunda opiniÃ³n mÃ©dica.',
    '{"features":["Padres/in-laws","Segunda opiniÃ³n","MultilingÃ¼e","Maternidad $10K"]}'::jsonb),
  ('PALIG', 'PALIG_ORO', 'PALIG Plan Oro (Menores)', 'pediatric', 'comprehensive', 350000, 100, 100, array['central_america'], 0, 18, array['CR'],
    'Plan pediÃ¡trico regional. 20% coaseguro. Consultas $15-$90.',
    '{"features":["PediÃ¡trico","Red PALIGMED","Maternidad $3K"]}'::jsonb),
  ('PALIG', 'PALIG_DIAMANTE', 'PALIG Plan Diamante (Menores Intl)', 'pediatric', 'comprehensive', 500000, 250, 1000, array['central_america','international'], 0, 18, array['CR'],
    'Plan pediÃ¡trico con cobertura internacional. 10% coaseguro. Maternidad $4K.',
    '{"features":["PediÃ¡trico","Intl","Red PALIGMED"]}'::jsonb),
  ('VUMI', 'VUMI_OPTIMUM_VIP', 'VUMI Optimum VIP', 'catastrophic', 'catastrophic', 1000000, 1000, 50000, array['worldwide'], 0, 99, array['MX','CO','CR'],
    'Plan catastrÃ³fico para 8 condiciones crÃ³nicas especÃ­ficas (cÃ¡ncer, ACV, infarto, insuficiencia renal, etc). Hasta $1M por condiciÃ³n.',
    '{"features":["8 condiciones crÃ­ticas","Cobertura mundial","Segunda opiniÃ³n Cleveland Clinic","Sin maternidad"]}'::jsonb),
  ('REDBRIDGE', 'RB_REDCHOICE_CARE_I', 'RedChoice Care I', 'health', 'comprehensive', 1000000, 500, 25000, array['worldwide'], 0, 74, array['MX','CO','CR'],
    'Plan internacional con mÃºltiples redes (Prime, Max, Ultra). Cobertura mundial hasta $1M. Riders opcionales de accidentes y medicamentos.',
    '{"features":["MÃºltiples redes","MultilingÃ¼e 24/7","Rider medicamentos","Rider accidentes"]}'::jsonb),
  ('BMI', 'BMI_TERM_LIFE_RIDER', 'BMI Rider Vida Temporal', 'life', 'term_life', 500000, null, null, array['worldwide'], 18, 65, array['MX','CO','CR'],
    'Rider de seguro de vida temporal, hasta $500K de suma asegurada. Complemento de planes BMI.',
    '{"features":["Suma hasta $500K","Beneficiarios mÃºltiples","Renovable"]}'::jsonb),
  ('PALIG', 'PALIG_INCOME_PROTECTION', 'PALIG ProtecciÃ³n de Ingreso', 'income_protection', 'disability', 0, null, null, array['latam'], 18, 60, array['MX','CO','CR'],
    'Seguro de invalidez / protecciÃ³n de ingreso. Reemplaza hasta 70% del salario por incapacidad total o parcial.',
    '{"features":["Hasta 70% salario","Corto y largo plazo","Independientes elegibles"]}'::jsonb)
) as x(provider_code, code, name, category, coverage_type, max_coverage_usd, min_ded, max_ded, regions, min_age, max_age, countries, description, metadata)
on p.code = x.provider_code
on conflict (code) do nothing;

-- =====================================================
-- INSURANCE PRICING (primas anuales USD por edad; datos reales de brochures)
-- =====================================================
-- Basado en tablas RedChoice Care I extraÃ­das + rangos observados en cotizaciones BMI/PALIG/VUMI
-- Formato: (product_code, country, age_from, age_to, deductible, annual_premium, dependents)
insert into insurance_pricing (product_id, country, age_from, age_to, deductible_usd, annual_premium_usd, dependents, effective_year)
select p.id, x.country, x.age_from, x.age_to, x.deductible, x.premium, x.dep, 2025 from insurance_products p
join (values
  -- RedChoice Care I (datos reales del brochure)
  ('RB_REDCHOICE_CARE_I','MX', 0, 17, 500,  330, 0),
  ('RB_REDCHOICE_CARE_I','MX', 18, 39, 500, 780, 0),
  ('RB_REDCHOICE_CARE_I','MX', 40, 59, 500, 1350, 0),
  ('RB_REDCHOICE_CARE_I','MX', 60, 74, 500, 2400, 0),
  ('RB_REDCHOICE_CARE_I','MX', 0, 17, 2000,  260, 0),
  ('RB_REDCHOICE_CARE_I','MX', 18, 39, 2000, 620, 0),
  ('RB_REDCHOICE_CARE_I','MX', 40, 59, 2000, 1080, 0),
  ('RB_REDCHOICE_CARE_I','MX', 60, 74, 2000, 1920, 0),
  ('RB_REDCHOICE_CARE_I','CO', 0, 17, 500,  310, 0),
  ('RB_REDCHOICE_CARE_I','CO', 18, 39, 500, 740, 0),
  ('RB_REDCHOICE_CARE_I','CO', 40, 59, 500, 1280, 0),
  ('RB_REDCHOICE_CARE_I','CR', 0, 17, 500,  340, 0),
  ('RB_REDCHOICE_CARE_I','CR', 18, 39, 500, 820, 0),
  ('RB_REDCHOICE_CARE_I','CR', 40, 59, 500, 1410, 0),
  ('RB_REDCHOICE_CARE_I','CR', 60, 74, 500, 2540, 0),
  -- BMI Meridian II
  ('BMI_MERIDIAN_II','MX', 18, 29, 1000,  980, 0),
  ('BMI_MERIDIAN_II','MX', 30, 39, 1000, 1250, 0),
  ('BMI_MERIDIAN_II','MX', 40, 49, 1000, 1780, 0),
  ('BMI_MERIDIAN_II','CO', 18, 29, 1000,  920, 0),
  ('BMI_MERIDIAN_II','CO', 30, 39, 1000, 1180, 0),
  ('BMI_MERIDIAN_II','CO', 40, 49, 1000, 1680, 0),
  ('BMI_MERIDIAN_II','CR', 18, 29, 1000, 1040, 0),
  ('BMI_MERIDIAN_II','CR', 30, 39, 1000, 1320, 0),
  ('BMI_MERIDIAN_II','CR', 40, 49, 1000, 1890, 0),
  -- BMI Serie 3000 (mÃ¡s econÃ³mico)
  ('BMI_SERIE_3000','MX', 18, 29, 2000,  620, 0),
  ('BMI_SERIE_3000','MX', 30, 39, 2000,  820, 0),
  ('BMI_SERIE_3000','MX', 40, 49, 2000, 1220, 0),
  ('BMI_SERIE_3000','CO', 18, 29, 2000,  580, 0),
  ('BMI_SERIE_3000','CO', 30, 39, 2000,  770, 0),
  ('BMI_SERIE_3000','CO', 40, 49, 2000, 1140, 0),
  ('BMI_SERIE_3000','CR', 18, 29, 2000,  650, 0),
  ('BMI_SERIE_3000','CR', 30, 39, 2000,  860, 0),
  ('BMI_SERIE_3000','CR', 40, 49, 2000, 1290, 0),
  -- PALIG Acceso Mundial (premium)
  ('PALIG_ACCESO_MUNDIAL','MX', 18, 29, 1500, 1520, 0),
  ('PALIG_ACCESO_MUNDIAL','MX', 30, 39, 1500, 1980, 0),
  ('PALIG_ACCESO_MUNDIAL','MX', 40, 49, 1500, 2680, 0),
  ('PALIG_ACCESO_MUNDIAL','CO', 18, 29, 1500, 1420, 0),
  ('PALIG_ACCESO_MUNDIAL','CO', 30, 39, 1500, 1850, 0),
  ('PALIG_ACCESO_MUNDIAL','CR', 18, 29, 1500, 1620, 0),
  ('PALIG_ACCESO_MUNDIAL','CR', 30, 39, 1500, 2110, 0),
  -- VUMI Optimum VIP (catastrÃ³fico, mÃ¡s econÃ³mico)
  ('VUMI_OPTIMUM_VIP','MX', 18, 29, 5000,  380, 0),
  ('VUMI_OPTIMUM_VIP','MX', 30, 39, 5000,  520, 0),
  ('VUMI_OPTIMUM_VIP','MX', 40, 49, 5000,  780, 0),
  ('VUMI_OPTIMUM_VIP','CO', 18, 29, 5000,  360, 0),
  ('VUMI_OPTIMUM_VIP','CO', 30, 39, 5000,  495, 0),
  ('VUMI_OPTIMUM_VIP','CR', 18, 29, 5000,  400, 0),
  ('VUMI_OPTIMUM_VIP','CR', 30, 39, 5000,  545, 0),
  -- BMI Rider Vida
  ('BMI_TERM_LIFE_RIDER','MX', 18, 29, null, 144, 0),
  ('BMI_TERM_LIFE_RIDER','MX', 30, 39, null, 168, 0),
  ('BMI_TERM_LIFE_RIDER','MX', 40, 49, null, 268, 0),
  ('BMI_TERM_LIFE_RIDER','CO', 18, 29, null, 132, 0),
  ('BMI_TERM_LIFE_RIDER','CO', 30, 39, null, 156, 0),
  ('BMI_TERM_LIFE_RIDER','CR', 18, 29, null, 156, 0),
  ('BMI_TERM_LIFE_RIDER','CR', 30, 39, null, 180, 0),
  -- PALIG ProtecciÃ³n de Ingreso
  ('PALIG_INCOME_PROTECTION','MX', 18, 29, null, 264, 0),
  ('PALIG_INCOME_PROTECTION','MX', 30, 39, null, 312, 0),
  ('PALIG_INCOME_PROTECTION','MX', 40, 49, null, 420, 0),
  ('PALIG_INCOME_PROTECTION','CO', 18, 29, null, 240, 0),
  ('PALIG_INCOME_PROTECTION','CO', 30, 39, null, 288, 0),
  ('PALIG_INCOME_PROTECTION','CR', 18, 29, null, 276, 0),
  ('PALIG_INCOME_PROTECTION','CR', 30, 39, null, 336, 0)
) as x(product_code, country, age_from, age_to, deductible, premium, dep)
on p.code = x.product_code
on conflict do nothing;

