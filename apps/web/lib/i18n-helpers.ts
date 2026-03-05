/**
 * Translates known server-side API error codes to localised messages.
 * Falls back to the generic "something went wrong" key for unknown errors.
 *
 * Usage:
 *   const t = useTranslations("apiError");
 *   toast.error(translateApiError(err.message, t));
 */
export function translateApiError(
  message: string,
  t: (key: string) => string,
): string {
  const map: Record<string, string> = {
    Unauthorized: t("unauthorized"),
    "Pro subscription required": t("proRequired"),
    "Validation failed": t("validationFailed"),
    "Not found": t("notFound"),
  };
  return map[message] ?? t("generic");
}
