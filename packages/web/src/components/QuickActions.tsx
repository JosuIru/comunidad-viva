import Link from 'next/link';

export default function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
      <div className="space-y-3">
        <Link
          href="/offers/new"
          className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
        >
          + Crear Oferta
        </Link>
        <Link
          href="/events/new"
          className="block w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
        >
          + Crear Evento
        </Link>
        <Link
          href="/timebank"
          className="block w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center"
        >
          Banco de Tiempo
        </Link>
        <Link
          href="/mutual-aid/needs/new"
          className="block w-full py-3 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-center"
        >
          + Publicar Necesidad
        </Link>
        <Link
          href="/mutual-aid/projects/new"
          className="block w-full py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-center"
        >
          + Crear Proyecto
        </Link>
        <Link
          href="/housing"
          className="block w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
        >
          🏡 Vivienda Comunitaria
        </Link>
        <Link
          href="/mutual-aid"
          className="block w-full py-3 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-center"
        >
          🤝 Ver Ayuda Mutua
        </Link>
      </div>
    </div>
  );
}
