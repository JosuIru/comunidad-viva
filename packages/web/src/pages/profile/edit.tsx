import { useState, useEffect } from 'react';
import { getI18nProps } from '@/lib/i18n';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('profileEdit');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [avatar, setAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Get current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error(t('auth.mustLogin'));
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    setUserId(user.id);
  }, [router, t]);

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
      setAvatar(profile.avatar || '');
    }
  }, [profile]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`/users/${userId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(t('success.profileUpdated'));
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
      const message = error.response?.data?.message || t('errors.updateProfile');
      toast.error(message);
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      toast.error(t('errors.invalidImage'));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('errors.imageTooLarge'));
      return;
    }

    setUploadingAvatar(true);

    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(t('errors.imageUploadError'));
      }

      const data = await response.json();
      setAvatar(data.url);
      toast.success(t('success.imageUploaded'));
    } catch (error: any) {
      toast.error(error.message || t('errors.imageUploadError'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t('errors.nameRequired'));
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
      avatar: avatar || undefined,
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
          <p className="text-gray-600">{t('errors.loadProfile')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('layout.title')}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← {t('back')}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('heading')}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.name.label')} <span className="text-red-500">{t('form.name.required')}</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('form.name.placeholder')}
                  required
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.email.label')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('form.email.cannotModify')}</p>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.bio.label')}
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={t('form.bio.placeholder')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('form.bio.maxChars', { count: bio.length })}
                </p>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.address.label')}
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('form.address.placeholder')}
                />
              </div>

              {/* Neighborhood */}
              <div>
                <label
                  htmlFor="neighborhood"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('form.neighborhood.label')}
                </label>
                <input
                  id="neighborhood"
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('form.neighborhood.placeholder')}
                />
              </div>

              {/* Interests */}
              <div>
                <label
                  htmlFor="interests"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('form.interests.label')}
                </label>
                <input
                  id="interests"
                  type="text"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('form.interests.placeholder')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('form.interests.helper')}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('form.avatar.label')}</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-2xl">
                        {name.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className={`inline-block px-4 py-2 rounded-lg transition-colors ${
                        uploadingAvatar
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                      }`}
                    >
                      {uploadingAvatar ? t('form.avatar.uploading') : t('form.avatar.upload')}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('form.avatar.fileTypes')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateMutation.isPending ? t('form.submitting') : t('form.submit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                  >
                    {t('form.cancel')}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Additional info */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">{t('tip.title')}</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t('tip.description')}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Disabled for client-side rendering with React Query
// export const getStaticProps = async (context: any) => getI18nProps(context);
