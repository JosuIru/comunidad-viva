import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '../i18n';

export default createMiddleware({
  // Lista de idiomas soportados
  locales,

  // Idioma por defecto cuando ninguno coincide
  defaultLocale,

  // Estrategia de detección de locale
  localeDetection: true,

  // Prefijo de ruta (ej: /es/inicio, /eu/hasiera)
  localePrefix: 'as-needed', // Solo muestra el prefijo para idiomas no-default
});

export const config = {
  // Matcher que ignora archivos estáticos y APIs
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
