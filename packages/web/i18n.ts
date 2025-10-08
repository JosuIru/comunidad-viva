import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Lista de idiomas soportados
export const locales = ['es', 'eu'] as const;
export type Locale = (typeof locales)[number];

// Idioma por defecto
export const defaultLocale: Locale = 'es';

export default getRequestConfig(async ({ locale }) => {
  // Validar que el locale es uno de los soportados
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
