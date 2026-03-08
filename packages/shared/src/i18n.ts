type Params = Record<string, string | number>;

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] !== undefined ? String(params[k]) : `{${k}}`,
  );
}

const EMAIL_TRANSLATIONS = {
  en: {
    renewal: {
      dayLabelTomorrow: "tomorrow",
      dayLabelDays: "in {days} days",
      subjectTomorrow: "Reminder: {name} renews tomorrow",
      subjectDays: "Reminder: {name} renews in {days} days",
      previewTomorrow: "Your {name} subscription renews tomorrow.",
      previewDays: "Your {name} subscription renews in {days} days.",
      heading: "Renewal Reminder",
      bodyTomorrow:
        "Your <strong>{name}</strong> subscription renews tomorrow.",
      bodyDays:
        "Your <strong>{name}</strong> subscription renews in {days} days.",
      cta: "View in TrackrApp",
      footerText: "Log in to TrackrApp to manage your subscriptions.",
      textGreeting: "Hi there,",
      textBodyTomorrow:
        "This is a reminder that your {name} subscription renews tomorrow.",
      textBodyDays:
        "This is a reminder that your {name} subscription renews in {days} days.",
      textAmount: "Amount: {currency} {price}",
      textFooter: "Log in to TrackrApp to manage your subscriptions.",
      textSignature: "— TrackrApp",
    },
  },
  es: {
    renewal: {
      dayLabelTomorrow: "mañana",
      dayLabelDays: "en {days} días",
      subjectTomorrow: "Recordatorio: {name} se renueva mañana",
      subjectDays: "Recordatorio: {name} se renueva en {days} días",
      previewTomorrow: "Tu suscripción a {name} se renueva mañana.",
      previewDays: "Tu suscripción a {name} se renueva en {days} días.",
      heading: "Recordatorio de renovación",
      bodyTomorrow:
        "Tu suscripción a <strong>{name}</strong> se renueva mañana.",
      bodyDays:
        "Tu suscripción a <strong>{name}</strong> se renueva en {days} días.",
      cta: "Ver en TrackrApp",
      footerText:
        "Inicia sesión en TrackrApp para gestionar tus suscripciones.",
      textGreeting: "Hola,",
      textBodyTomorrow:
        "Este es un recordatorio de que tu suscripción a {name} se renueva mañana.",
      textBodyDays:
        "Este es un recordatorio de que tu suscripción a {name} se renueva en {days} días.",
      textAmount: "Importe: {currency} {price}",
      textFooter:
        "Inicia sesión en TrackrApp para gestionar tus suscripciones.",
      textSignature: "— TrackrApp",
    },
  },
} as const;

const NOTIFICATION_TRANSLATIONS = {
  en: {
    renewal: {
      titleTomorrow: "{name} renews tomorrow",
      titleDays: "{name} renews in {days} days",
      messageTomorrow:
        "Your {name} subscription ({currency} {price}) renews tomorrow.",
      messageDays:
        "Your {name} subscription ({currency} {price}) renews in {days} days.",
    },
    aiTips: {
      title: "New AI Tips Available",
      messageSingular: "1 new personalized spending tip generated for you.",
      messagePlural:
        "{count} new personalized spending tips generated for you.",
    },
  },
  es: {
    renewal: {
      titleTomorrow: "{name} se renueva mañana",
      titleDays: "{name} se renueva en {days} días",
      messageTomorrow:
        "Tu suscripción a {name} ({currency} {price}) se renueva mañana.",
      messageDays:
        "Tu suscripción a {name} ({currency} {price}) se renueva en {days} días.",
    },
    aiTips: {
      title: "Nuevos consejos de IA disponibles",
      messageSingular:
        "1 nuevo consejo de gasto personalizado generado para ti.",
      messagePlural:
        "{count} nuevos consejos de gasto personalizados generados para ti.",
    },
  },
} as const;

type SupportedLocale = "en" | "es";
type Domain = "email" | "notification";

type TranslationsMap = {
  email: typeof EMAIL_TRANSLATIONS;
  notification: typeof NOTIFICATION_TRANSLATIONS;
};

const TRANSLATIONS: TranslationsMap = {
  email: EMAIL_TRANSLATIONS,
  notification: NOTIFICATION_TRANSLATIONS,
};

function safeLocale(locale: string): SupportedLocale {
  return locale === "es" ? "es" : "en";
}

function getNestedValue(
  obj: Record<string, unknown>,
  keyPath: string,
): unknown {
  const parts = keyPath.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (
      current &&
      typeof current === "object" &&
      part in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

export function getTranslator(
  locale: string,
  domain: Domain,
): (key: string, params?: Params) => string {
  const l = safeLocale(locale);
  const messages = TRANSLATIONS[domain][l] as Record<string, unknown>;

  return function t(key: string, params?: Params): string {
    const raw = getNestedValue(messages, key);
    if (typeof raw !== "string") return key;
    return interpolate(raw, params);
  };
}
