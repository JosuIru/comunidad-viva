import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { getI18nProps } from '@/lib/i18n';
import { logger } from '@/lib/logger';

const CATEGORIES = [
  'Educación',
  'Tecnología',
  'Hogar',
  'Transporte',
  'Salud y Bienestar',
  'Arte y Creatividad',
  'Jardinería',
  'Reparaciones',
  'Idiomas',
  'Cocina',
  'Cuidados',
  'Deportes',
  'Asesoría',
  'Otros',
];

const EXPERIENCE_LEVELS = [
  { value: 'BEGINNER', label: 'Principiante', description: 'Estoy aprendiendo' },
  { value: 'INTERMEDIATE', label: 'Intermedio', description: 'Tengo experiencia' },
  { value: 'EXPERT', label: 'Experto', description: 'Domino la materia' },
];

export default function CreateTimeBankOffer() {
  const router = useRouter();
  const t = useTranslations('timebank');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    estimatedHours: 1,
    experienceLevel: 'INTERMEDIATE',
    canTeach: false,
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    handleChange('tags', formData.tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validación básica
      if (!formData.title.trim()) {
        toast.error('El título es obligatorio');
        return;
      }
      if (!formData.description.trim()) {
        toast.error('La descripción es obligatoria');
        return;
      }
      if (!formData.category) {
        toast.error('Selecciona una categoría');
        return;
      }

      const token = localStorage.getItem('access_token');

      // Primero crear la oferta base
      const offerData = {
        title: formData.title,
        description: formData.description,
        type: 'SERVICE',
        category: formData.category,
        priceCredits: formData.estimatedHours, // El precio en créditos es igual a las horas estimadas
        tags: formData.tags,
      };

      const offerResponse = await api.post('/offers', offerData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const offerId = offerResponse.data.id;

      // Luego crear la entrada de TimeBankOffer vinculada
      const timeBankData = {
        offerId,
        estimatedHours: formData.estimatedHours,
        experienceLevel: formData.experienceLevel,
        canTeach: formData.canTeach,
      };

      await api.post('/timebank/offers', timeBankData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('¡Servicio de tiempo creado exitosamente! 🎉');
      router.push('/manage');
    } catch (error: any) {
      logger.error('Error creating time bank offer', { error, response: error.response?.data });
      toast.error(error.response?.data?.message || 'Error al crear el servicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Crear Servicio de Tiempo - Banco de Tiempo | Truk</title>
        <meta
          name="description"
          content="Ofrece tus habilidades y tiempo a la comunidad. Intercambia servicios basados en horas."
        />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>

              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                ⏰ Crear Servicio de Tiempo
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Comparte tus habilidades con la comunidad. Cada hora vale un crédito, sin importar el tipo de servicio.
              </p>

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-semibold mb-1">¿Cómo funciona el Banco de Tiempo?</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                      <li>1 hora de tu tiempo = 1 crédito</li>
                      <li>Todos los servicios valen lo mismo por hora</li>
                      <li>Ofreces servicios y ganas créditos para usar en otros servicios</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
              {/* Título */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Título del servicio *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: Clases de euskera, Reparación de bicicletas, Ayuda con mudanza..."
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Descripción detallada *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Describe qué servicio ofreces, qué incluye, requisitos previos, etc."
                  required
                />
              </div>

              {/* Categoría */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Categoría *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Horas estimadas */}
              <div>
                <label htmlFor="estimatedHours" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Horas estimadas por sesión
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    id="estimatedHours"
                    min="0.5"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => handleChange('estimatedHours', parseFloat(e.target.value))}
                    className="w-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    = {formData.estimatedHours} crédito{formData.estimatedHours !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Duración aproximada de una sesión de este servicio
                </p>
              </div>

              {/* Nivel de experiencia */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Tu nivel de experiencia *
                </label>
                <div className="space-y-3">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <label
                      key={level.value}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.experienceLevel === level.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="experienceLevel"
                        value={level.value}
                        checked={formData.experienceLevel === level.value}
                        onChange={(e) => handleChange('experienceLevel', e.target.value)}
                        className="mt-1"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 dark:text-white">{level.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{level.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Puede enseñar */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <input
                  type="checkbox"
                  id="canTeach"
                  checked={formData.canTeach}
                  onChange={(e) => handleChange('canTeach', e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="canTeach" className="flex-1 cursor-pointer">
                  <p className="font-medium text-gray-900 dark:text-white">¿Puedes enseñar esta habilidad?</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Marca esta opción si además de ofrecer el servicio, puedes enseñar a otros a hacerlo
                  </p>
                </label>
              </div>

              {/* Etiquetas */}
              <div>
                <label htmlFor="tagInput" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Etiquetas (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="tagInput"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Añade etiquetas y presiona Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Añadir
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-blue-900 dark:hover:text-blue-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creando...
                    </span>
                  ) : (
                    '⏰ Crear Servicio de Tiempo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps = async (context: any) => getI18nProps(context);
