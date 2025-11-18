import { NextRequest, NextResponse } from 'next/server';

const locales = ['es', 'eu', 'en', 'ca'];
const defaultLocale = 'es';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Ignorar archivos estáticos, API routes, y otros recursos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // archivos con extensión
  ) {
    return NextResponse.next();
  }

  // Verificar si la ruta ya tiene un locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // La ruta ya tiene locale, continuar
    return NextResponse.next();
  }

  // Si no tiene locale, redirigir al locale por defecto
  // Pero solo si es necesario (as-needed)
  const locale = defaultLocale;

  // No redirigir para el locale por defecto (as-needed)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
