/**
 * Contenido narrativo generado por Claude Fable 5.
 * Copy en español LATAM, tono cercano-aspiracional.
 * NO editar directamente sin rerun de Fable — este es el "brand voice" del app.
 */

export const WEALTH_LEVELS = [
  {
    key: "seed" as const,
    min: 0,
    max: 30,
    name: "Despertador",
    emoji: "⏰",
    tagline: "Tu Futuro Yo acaba de sonar la alarma",
    description:
      "Estás empezando a mirar de frente tu dinero, y eso ya te pone adelante de quienes siguen dormidos. El primer paso es el que más cuesta, y tú ya lo diste.",
    color: "#E85D4A",
  },
  {
    key: "explorer" as const,
    min: 31,
    max: 55,
    name: "Explorador",
    emoji: "🧭",
    tagline: "Ya tienes mapa, ahora falta la ruta",
    description:
      "Tienes intención y algo de terreno avanzado, pero todavía hay fugas que te frenan. Con pocos ajustes, tu patrimonio puede cambiar de trayectoria por completo.",
    color: "#F5A623",
  },
  {
    key: "builder" as const,
    min: 56,
    max: 70,
    name: "Constructor",
    emoji: "🧱",
    tagline: "Estás construyendo algo que va a durar",
    description:
      "Tus hábitos financieros ya trabajan a tu favor y se nota. Ahora toca proteger lo que construyes para que ningún imprevisto lo derrumbe.",
    color: "#4A90D9",
  },
  {
    key: "optimizer" as const,
    min: 71,
    max: 85,
    name: "Estratega",
    emoji: "♟️",
    tagline: "Juegas ajedrez mientras otros juegan lotería",
    description:
      "Piensas a largo plazo y tomas decisiones con cabeza fría. Estás en el grupo pequeño que hace crecer y blinda su dinero al mismo tiempo.",
    color: "#7B61C4",
  },
  {
    key: "architect" as const,
    min: 86,
    max: 100,
    name: "Arquitecto de Legado",
    emoji: "🏛️",
    tagline: "No solo aseguras tu futuro: diseñas uno",
    description:
      "Estás en la élite financiera de tu generación en LATAM. Tu reto ya no es llegar, es sostenerlo y convertirte en referente para los tuyos.",
    color: "#1FA97C",
  },
];

export const NARRATIVE_TEMPLATES = {
  critico:
    "{name}, seamos honestos sin drama: hoy tu dinero se te está escapando por {leak_count} fugas, y la más grande —{top_leak_name}— podría costarte {top_leak_impact} en 20 años. Pero aquí está la buena noticia: acabas de hacer lo que la mayoría evita, mirar los números de frente. Tu Futuro Yo no necesita que seas perfecto, necesita que empieces esta semana. Un solo movimiento, como {top_booster_name}, ya cambia la historia.",
  vulnerable:
    "{name}, se nota que lo estás intentando: entre los profesionales de {age_range} en {country_name}, ya vas más adelante de lo que crees. Pero hay una fuga que no puede esperar: {top_leak_name} te está costando {top_leak_impact} proyectado a 20 años, en silencio. Ahorras {savings_rate} de tu ingreso y eso es una base real; el problema es que sin blindaje, un solo imprevisto puede borrar años de esfuerzo. Es momento de pasar de la intención a la estrategia.",
  buen_camino:
    "{name}, esto hay que decirlo claro: vas bien, y no es casualidad. Con una tasa de ahorro de {savings_rate} y camino a {financial_goal}, estás construyendo un patrimonio que podría llegar a {future_wealth}. Pero detectamos {leak_count} fugas que le ponen freno de mano a ese crecimiento, empezando por {top_leak_name} ({top_leak_impact} a 20 años). Cierra esa fuga con {top_booster_name} y tu curva deja de ser buena para volverse imparable.",
  optimizado:
    "{name}, esto casi nadie lo logra: estás en la élite financiera de tu generación en {country_name}. Tu disciplina de ahorro de {savings_rate} y tu visión te tienen en ruta hacia {future_wealth}. ¿Lo único que te separa de ser un referente absoluto? {top_leak_name}, un detalle que aún vale {top_leak_impact} a 20 años. Ajusta eso con {top_booster_name} y no solo aseguras tu futuro: te conviertes en la persona a la que los demás le preguntan cómo lo hizo.",
};

export const HERO_HOOKS = [
  "¿Cómo se ve tu Yo del 2045? Descúbrelo en 3 minutos",
  "Tu Futuro Yo ya sabe si vas bien. ¿Te atreves a preguntarle?",
  "12 preguntas te separan de saber cuánto vale tu futuro",
  "No es un test de dinero. Es una carta de tu Yo de 60 años",
];

export const LOADING_MESSAGES = [
  "Consultando a tu Yo del 2045…",
  "Buscando las fugas que nadie te había mostrado…",
  "Comparándote con miles de profesionales LATAM…",
  "Calculando cuánto vale realmente tu futuro…",
  "Proyectando 20 años en 3 segundos…",
  "Detectando tu superpoder financiero oculto…",
  "Tu Futuro Yo está escribiendo su veredicto…",
  "Casi listo. Esto te va a interesar…",
];

export interface AchievementDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: "comun" | "raro" | "epico" | "legendario";
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: "savings_ninja", name: "Ninja del Ahorro", emoji: "🥷", description: "Ahorras más del 20% de tu ingreso. Top 15% de LATAM, sin hacer ruido.", rarity: "raro" },
  { id: "debt_free", name: "Cielo Despejado", emoji: "🕊️", description: "Cero deudas que te persigan. Tu ingreso trabaja solo para ti.", rarity: "raro" },
  { id: "emergency_fortress", name: "Fortaleza de 6 Meses", emoji: "🏰", description: "Podrías perder tu ingreso hoy y dormir tranquilo medio año. Eso es paz.", rarity: "epico" },
  { id: "health_shielded", name: "Escudo Vital", emoji: "🛡️", description: "Tu salud está asegurada. Ningún hospital podrá vaciar tu patrimonio.", rarity: "comun" },
  { id: "income_prodigy", name: "Prodigio del Ingreso", emoji: "🚀", description: "Ganas más que el 80% de tu edad en tu país. Ahora haz que ese dinero crezca.", rarity: "epico" },
  { id: "master_plan", name: "Plan Maestro", emoji: "🗺️", description: "Tienes un plan financiero claro. La mayoría improvisa; tú diseñas.", rarity: "comun" },
  { id: "crypto_pioneer", name: "Pionero Digital", emoji: "🔮", description: "Exploraste cripto antes que la mayoría. Curiosidad que puede pagar bien.", rarity: "raro" },
  { id: "north_star", name: "Estrella Polar", emoji: "⭐", description: "Sabes exactamente hacia dónde va tu dinero. Meta clara, camino claro.", rarity: "comun" },
  { id: "full_armor", name: "Blindaje Total", emoji: "⚔️", description: "Salud, emergencias y futuro cubiertos. Eres prácticamente indestructible.", rarity: "legendario" },
  { id: "steady_investor", name: "Inversor de Acero", emoji: "📈", description: "Inviertes todos los meses, llueva o truene. El interés compuesto te ama.", rarity: "raro" },
  { id: "zero_leaks", name: "Casco Sellado", emoji: "💎", description: "Cero fugas detectadas. Tu barco no pierde ni una gota.", rarity: "legendario" },
  { id: "top_percentile", name: "Uno entre Diez", emoji: "🏆", description: "Estás arriba del 90% de tus pares en LATAM. Nivel referente.", rarity: "legendario" },
];

export const SHARE_COPY = {
  whatsapp:
    "🔮 Acabo de conocer a mi Yo del futuro… Saqué {score}/100 en el Índice de Riqueza Futura y soy nivel {level_name} 👀 Tiene 12 preguntas y te dice cuánto dinero se te está fugando. Hazlo y me cuentas 👉",
  twitter:
    "Hice el test de Mi Futuro Yo y saqué {score}/100: nivel {level_name} 🔮 Me dijo exactamente cuánto dinero se me fuga a 20 años (spoiler: dolió). Son 12 preguntas, 3 minutos. ¿Cuánto sacas tú? #MiFuturoYo #FinanzasLATAM",
  linkedin:
    "Acabo de hacer un diagnóstico de riqueza patrimonial y el resultado me sorprendió: {score}/100, nivel {level_name}. En 3 minutos identifica tus fugas financieras y proyecta tu patrimonio a 20 años. Recomendado para cualquier profesional que piense a largo plazo. #MiFuturoYo",
  instagram_story: "Mi Yo del 2045 ya sabe la verdad 🔮 {score}/100 · {level_name}",
  og_title: "Mi Futuro Yo | ¿Cuánto vale tu futuro?",
  og_description:
    "12 preguntas, 3 minutos. Descubre tu Índice de Riqueza Futura, tus fugas de dinero y cómo se ve tu patrimonio en 20 años.",
};

export const LEAK_PERSONALITY: Record<string, { story_intro: string; emoji: string }> = {
  no_health_insurance: {
    story_intro:
      "Estás caminando por la cuerda floja sin red. Una sola emergencia médica puede borrar en una noche lo que ahorraste en años. No es mala suerte: es un riesgo con nombre y solución.",
    emoji: "🩹",
  },
  high_debt: {
    story_intro:
      "Cada mes, antes de que tu sueldo llegue a ti, alguien más ya cobró su parte. Tus deudas son un socio silencioso que se lleva tu futuro en cuotas. Hora de renegociar quién manda aquí.",
    emoji: "⛓️",
  },
  no_emergency_fund: {
    story_intro:
      "Vives a un imprevisto de distancia del modo pánico. Sin colchón, cualquier golpe —un despido, una avería, una urgencia— te obliga a endeudarte o vender tu futuro barato.",
    emoji: "🎢",
  },
  inflation_erosion: {
    story_intro:
      "Tu dinero guardado parece quieto, pero está en una banda que camina hacia atrás. Cada año que pasa sin invertir, la inflación le da una mordida silenciosa a tu esfuerzo.",
    emoji: "🧊",
  },
  no_investment: {
    story_intro:
      "Tu dinero está sentado en la banca mirando el partido. Tiene talento para multiplicarse, pero nadie lo ha puesto a jugar. El interés compuesto premia a quien empieza, no a quien espera.",
    emoji: "🛋️",
  },
  no_pension_awareness: {
    story_intro:
      "Tu Yo de 65 años te está mandando mensajes y los estás dejando en visto. No saber cómo va tu pensión hoy es firmarle un cheque en blanco a la incertidumbre de mañana.",
    emoji: "👀",
  },
  low_savings_rate: {
    story_intro:
      "Tu ingreso entra por la puerta y sale por la ventana. No es que ganes poco: es que tu dinero no tiene instrucciones de quedarse. Un pequeño ajuste aquí cambia toda tu curva.",
    emoji: "🕳️",
  },
  no_financial_plan: {
    story_intro:
      "Estás manejando de noche sin luces: puedes avanzar, pero no sabes hacia dónde. Sin un plan, cada decisión financiera es una apuesta en lugar de una jugada.",
    emoji: "🌫️",
  },
};

/** Cohort size estimates (para el "~X profesionales" en share) */
export const COHORT_SIZE_HINTS: Record<string, string> = {
  MX: "~12,400 profesionales en México",
  CO: "~7,800 profesionales en Colombia",
  CR: "~2,100 profesionales en Costa Rica",
};
