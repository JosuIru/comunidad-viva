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
      </div>
    </div>
  );
}
