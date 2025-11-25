import { useTranslations as useNextIntlTranslations } from 'next-intl';

/**
 * Hook personalizado para facilitar el uso de traducciones
 *
 * Uso:
 * const { t } = useI18n('nav');
 * <h1>{t('title')}</h1>
 */
export function useI18n(namespace?: string) {
  const t = useNextIntlTranslations(namespace);

  return {
    t,
  };
}
