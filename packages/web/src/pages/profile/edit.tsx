import { useState, useEffect } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  lat?: number;
  lng?: number;
  address?: string;
  neighborhood?: string;
  interests?: string[];
}

export default function ProfileEditPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [interestsInput, setInterestsInput] = useState('');

  // Get current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('Debes iniciar sesión');
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    setUserId(user.id);
  }, [router]);

  // Fetch user profile
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });

  // Set form values when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setAddress(profile.address || '');
      setNeighborhood(profile.neighborhood || '');
      setInterestsInput(profile.interests?.join(', ') || '');
    }
  }, [profile]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`/users/${userId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Perfil actualizado correctamente');
      // Update localStorage user
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({ ...user, name: data.name }));
      }
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      router.push('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar perfil';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    const interests = interestsInput
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    updateMutation.mutate({
      name: name.trim(),
      bio: bio.trim() || undefined,
      address: address.trim() || undefined,
      neighborhood: neighborhood.trim() || undefined,
      interests: interests.length > 0 ? interests : undefined,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">No se pudo cargar el perfil</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Editar Perfil - Comunidad Viva">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← Volver
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Perfil</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre"
                  required
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Biografía
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Cuéntanos sobre ti..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo 500 caracteres ({bio.length}/500)
                </p>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Calle, número, ciudad..."
                />
              </div>

              {/* Neighborhood */}
              <div>
                <label
                  htmlFor="neighborhood"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Barrio/Vecindario
                </label>
                <input
                  id="neighborhood"
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu barrio"
                />
              </div>

              {/* Interests */}
              <div>
                <label
                  htmlFor="interests"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Intereses
                </label>
                <input
                  id="interests"
                  type="text"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Música, deportes, cocina... (separados por comas)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separa tus intereses con comas. Ejemplo: música, deportes, cocina
                </p>
                {interestsInput && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {interestsInput
                      .split(',')
                      .map((i) => i.trim())
                      .filter((i) => i)
                      .map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Avatar placeholder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">
                      {name.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                    >
                      Subir imagen (próximamente)
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      La funcionalidad de subir avatar estará disponible próximamente
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Additional info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Consejo</h3>
            <p className="text-sm text-blue-800">
              Un perfil completo te ayuda a conectar mejor con tu comunidad. Comparte tus
              intereses y habilidades para encontrar colaboraciones significativas.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export { getI18nProps as getStaticProps };
