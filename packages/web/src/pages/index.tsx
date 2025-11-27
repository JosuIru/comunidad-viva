import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth only on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Bienvenido a Truk
          </h1>
          <p className="text-xl text-gray-700 mb-12">
            Economía colaborativa local
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Explorar</h2>
              <p className="text-gray-600 mb-6">
                Descubre ofertas, eventos y recursos en tu comunidad
              </p>
              <Link
                href="/offers"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Ver Ofertas
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Comunidad</h2>
              <p className="text-gray-600 mb-6">
                Conecta con personas de tu zona
              </p>
              <Link
                href="/communities"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                Ver Comunidades
              </Link>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ¿Nuevo aquí?
              </h3>
              <p className="text-gray-600 mb-6">
                Únete gratis para acceder a todas las funcionalidades
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/auth/login"
                  className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          )}

          {isAuthenticated && (
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/offers/new"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Publicar Oferta</h3>
                <p className="text-sm text-gray-600">Comparte tus servicios</p>
              </Link>
              <Link
                href="/events"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Eventos</h3>
                <p className="text-sm text-gray-600">Descubre actividades</p>
              </Link>
              <Link
                href="/profile"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Mi Perfil</h3>
                <p className="text-sm text-gray-600">Gestiona tu cuenta</p>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
