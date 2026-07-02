-- Mi Futuro Yo — Seed data: macro cache, benchmarks, insurance products

-- =====================================================
-- MACRO CACHE (país data)
-- =====================================================
insert into macro_cache (country, name, currency, currency_symbol, exchange_rate_usd, inflation_rate, ppp_factor, price_level_index, health_oop_percent, medical_inflation_rate, financial_inclusion_rate, emergency_coverage_2months, pension_system, pension_avg_return_low, pension_avg_return_high, catastrophic_health_probability, disability_probability_annual, income_percentiles, data_sources)
values
  ('MX', 'México', 'MXN', '$', 17.2, 0.042, 0.7467, 74.67, 41.24, 0.08, 0.67, 0.32, 'AFORE', 0.04, 0.09, 0.042, 0.008,
    '{"20-25":{"p25":500,"p50":900,"p75":1600,"p90":2800},"26-30":{"p25":650,"p50":1200,"p75":2200,"p90":3500},"31-35":{"p25":800,"p50":1500,"p75":2800,"p90":4500},"36-40":{"p25":900,"p50":1800,"p75":3200,"p90":5200}}'::jsonb,
    '{"income":"INEGI ENIGH 2024 + CEPAL BADEHOG","inflation":"Banxico INPC 2026","health":"CNSF + OPS/OMS GHED 2024","ppp":"ICP 2021 World Bank"}'::jsonb),
  ('CO', 'Colombia', 'COP', '$', 4200, 0.055, 0.7237, 72.37, 16.0, 0.065, 0.73, 0.30, 'AFP (Colpensiones/Privado)', 0.035, 0.08, 0.025, 0.007,
    '{"20-25":{"p25":350,"p50":700,"p75":1300,"p90":2200},"26-30":{"p25":500,"p50":950,"p75":1700,"p90":2900},"31-35":{"p25":600,"p50":1100,"p75":2200,"p90":3800},"36-40":{"p25":700,"p50":1300,"p75":2600,"p90":4200}}'::jsonb,
    '{"income":"DANE GEIH 2024 + CEPAL BADEHOG","inflation":"BanRep 2026","health":"MinSalud + OPS/OMS GHED 2024"}'::jsonb),
  ('CR', 'Costa Rica', 'CRC', '₡', 510, 0.025, 0.8976, 89.76, 24.13, 0.055, 0.72, 0.38, 'IVM-CCSS + Complementaria', 0.04, 0.075, 0.020, 0.006,
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
  ('VUMI', 'VIP Universal Medical Insurance', array['MX','CO','CR'], 'https://vumigroup.com', 'Optimum VIP para eventos catastróficos'),
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
    'Plan médico comprehensivo con cobertura mundial, libre elección de médicos. Incluye maternidad ($7.5K) y transplantes.',
    '{"features":["Libre elección","Maternidad","Transplantes","Rider vida opcional"]}'::jsonb),
  ('BMI', 'BMI_MERIDIAN_II_PLUS', 'BMI Meridian II Plus', 'health', 'comprehensive', 10000000, 500, 20000, array['worldwide'], 0, 99, array['MX','CO','CR'],
    'Plan premium con cobertura máxima $10M, mundial. Maternidad $10K.',
    '{"features":["Cobertura máxima","Maternidad premium","Rider vida"]}'::jsonb),
  ('BMI', 'BMI_SERIE_3000', 'BMI Serie 3000', 'health', 'comprehensive', null, 500, 60000, array['worldwide'], 0, 99, array['MX','CO','CR'],
    'Cobertura sin límite anual, libre elección global. Waivers de deducible por accidente.',
    '{"features":["Sin límite","Waiver por accidente","Telemedicina"]}'::jsonb),
  ('PALIG', 'PALIG_ACCESO_MUNDIAL', 'PALIG Acceso Mundial', 'health', 'comprehensive', 5000000, 1000, 20000, array['worldwide'], 0, 99, array['MX','CO','CR'],
    'Plan private-client, cobertura mundial, incluye padres e hijos políticos. Segunda opinión médica.',
    '{"features":["Padres/in-laws","Segunda opinión","Multilingüe","Maternidad $10K"]}'::jsonb),
  ('PALIG', 'PALIG_ORO', 'PALIG Plan Oro (Menores)', 'pediatric', 'comprehensive', 350000, 100, 100, array['central_america'], 0, 18, array['CR'],
    'Plan pediátrico regional. 20% coaseguro. Consultas $15-$90.',
    '{"features":["Pediátrico","Red PALIGMED","Maternidad $3K"]}'::jsonb),
  ('PALIG', 'PALIG_DIAMANTE', 'PALIG Plan Diamante (Menores Intl)', 'pediatric', 'comprehensive', 500000, 250, 1000, array['central_america','international'], 0, 18, array['CR'],
    'Plan pediátrico con cobertura internacional. 10% coaseguro. Maternidad $4K.',
    '{"features":["Pediátrico","Intl","Red PALIGMED"]}'::jsonb),
  ('VUMI', 'VUMI_OPTIMUM_VIP', 'VUMI Optimum VIP', 'catastrophic', 'catastrophic', 1000000, 1000, 50000, array['worldwide'], 0, 99, array['MX','CO','CR'],
    'Plan catastrófico para 8 condiciones crónicas específicas (cáncer, ACV, infarto, insuficiencia renal, etc). Hasta $1M por condición.',
    '{"features":["8 condiciones críticas","Cobertura mundial","Segunda opinión Cleveland Clinic","Sin maternidad"]}'::jsonb),
  ('REDBRIDGE', 'RB_REDCHOICE_CARE_I', 'RedChoice Care I', 'health', 'comprehensive', 1000000, 500, 25000, array['worldwide'], 0, 74, array['MX','CO','CR'],
    'Plan internacional con múltiples redes (Prime, Max, Ultra). Cobertura mundial hasta $1M. Riders opcionales de accidentes y medicamentos.',
    '{"features":["Múltiples redes","Multilingüe 24/7","Rider medicamentos","Rider accidentes"]}'::jsonb),
  ('BMI', 'BMI_TERM_LIFE_RIDER', 'BMI Rider Vida Temporal', 'life', 'term_life', 500000, null, null, array['worldwide'], 18, 65, array['MX','CO','CR'],
    'Rider de seguro de vida temporal, hasta $500K de suma asegurada. Complemento de planes BMI.',
    '{"features":["Suma hasta $500K","Beneficiarios múltiples","Renovable"]}'::jsonb),
  ('PALIG', 'PALIG_INCOME_PROTECTION', 'PALIG Protección de Ingreso', 'income_protection', 'disability', 0, null, null, array['latam'], 18, 60, array['MX','CO','CR'],
    'Seguro de invalidez / protección de ingreso. Reemplaza hasta 70% del salario por incapacidad total o parcial.',
    '{"features":["Hasta 70% salario","Corto y largo plazo","Independientes elegibles"]}'::jsonb)
) as x(provider_code, code, name, category, coverage_type, max_coverage_usd, min_ded, max_ded, regions, min_age, max_age, countries, description, metadata)
on p.code = x.provider_code
on conflict (code) do nothing;

-- =====================================================
-- INSURANCE PRICING (primas anuales USD por edad; datos reales de brochures)
-- =====================================================
-- Basado en tablas RedChoice Care I extraídas + rangos observados en cotizaciones BMI/PALIG/VUMI
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
  -- BMI Serie 3000 (más económico)
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
  -- VUMI Optimum VIP (catastrófico, más económico)
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
  -- PALIG Protección de Ingreso
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
