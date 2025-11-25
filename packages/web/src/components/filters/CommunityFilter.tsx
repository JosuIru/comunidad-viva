'use client';

import { useQuery } from '@tanstack/react-query';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

interface Community {
  id: string;
  name: string;
  slug: string;
  membersCount: number;
}

interface CommunityFilterProps {
  value: string;
  onChange: (communityId: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
}

export default function CommunityFilter({
  value,
  onChange,
  label = 'Comunidad',
  className = '',
  placeholder = 'Todas las comunidades',
}: CommunityFilterProps) {
  const { data: communities, isLoading } = useQuery<Community[]>({
    queryKey: ['communities-filter'],
    queryFn: async () => {
      const response = await api.get('/communities');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
        <BuildingOffice2Icon className="h-4 w-4" />
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>

        {isLoading ? (
          <option disabled>Cargando comunidades...</option>
        ) : communities && communities.length > 0 ? (
          communities.map((community) => (
            <option key={community.id} value={community.id}>
              {community.name} ({community.membersCount} miembros)
            </option>
          ))
        ) : (
          <option disabled>No hay comunidades disponibles</option>
        )}
      </select>

      {value && communities && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Filtrando por: {communities.find((c) => c.id === value)?.name || 'Comunidad seleccionada'}
        </p>
      )}
    </div>
  );
}
