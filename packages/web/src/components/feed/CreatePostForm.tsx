'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface CreatePostFormProps {
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  onSubmit: (content: string, media?: string[]) => void;
  loading?: boolean;
}

export default function CreatePostForm({
  currentUser,
  onSubmit,
  loading = false,
}: CreatePostFormProps) {
  const tToasts = useTranslations('toasts');
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const invalidFiles = files.filter(file => !file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/));
    if (invalidFiles.length > 0) {
      toast.error(tToasts('error.invalidImageType'));
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(tToasts('error.imageTooLarge'));
      return;
    }

    setImages(files);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    const token = localStorage.getItem('access_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    for (const image of images) {
      const formData = new FormData();
      formData.append('file', image);

      try {
        const response = await fetch(`${API_URL}/upload/image`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error al subir ${image.name}`);
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`Error al subir ${image.name}`);
      }
    }

    setUploadingImages(false);
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      // Upload images if any
      const mediaUrls = await uploadImages();

      // Submit post with content and media
      onSubmit(content.trim(), mediaUrls.length > 0 ? mediaUrls : undefined);

      // Reset form
      setContent('');
      setImages([]);
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImagePreviews([]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(tToasts('error.createPost'));
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center text-gray-500">
        <p>Inicia sesión para compartir publicaciones</p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-semibold">
                {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 text-left rounded-full hover:bg-gray-200 transition-colors"
          >
            ¿Qué estás pensando, {currentUser?.name?.split(' ')[0] || 'Usuario'}?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3 mb-4">
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-semibold">
                {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¿Qué estás pensando?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px] resize-none"
              autoFocus
              disabled={loading}
            />
          </div>
        </div>

        {/* Image previews */}
        {imagePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-sm"
                  disabled={loading || uploadingImages}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-600">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              disabled={loading || uploadingImages}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Añadir foto"
              disabled={loading || uploadingImages}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setContent('');
                setImages([]);
                imagePreviews.forEach(url => URL.revokeObjectURL(url));
                setImagePreviews([]);
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading || uploadingImages}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!content.trim() || loading || uploadingImages}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {uploadingImages ? 'Subiendo...' : loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
