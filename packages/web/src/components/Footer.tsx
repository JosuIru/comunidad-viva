import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  BookOpenIcon,
  BoltIcon,
  AcademicCapIcon,
  SparklesIcon,
  UsersIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  HomeIcon,
  HandRaisedIcon,
  LockClosedIcon,
  DocumentTextIcon,
  BugAntIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

export default function Footer() {
  // useTranslations con manejo de errores inline
  const t = useTranslations('footer');

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sobre Truk */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">{t('title')}</h3>
            <p className="text-sm text-gray-400 mb-4">
              {t('description')}
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/JosuIru/comunidad-viva" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">{t('sections.resources.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-sm hover:text-white transition-colors flex items-center gap-2">
                  <BookOpenIcon className="h-4 w-4" />
                  {t('sections.resources.generalDocs')}
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="text-sm hover:text-white transition-colors flex items-center gap-2">
                  <BoltIcon className="h-4 w-4" />
                  {t('sections.resources.apiReference')}
                </Link>
              </li>
              <li>
                <Link href="/docs/guides" className="text-sm hover:text-white transition-colors flex items-center gap-2">
                  <AcademicCapIcon className="h-4 w-4" />
                  {t('sections.resources.guides')}
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-sm hover:text-white transition-colors flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4" />
                  {t('sections.resources.features')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Comunidad */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">{t('sections.community.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/communities" className="text-sm hover:text-white transition-colors flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  {t('sections.community.communities')}
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-sm hover:text-white transition-colors flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4" />
                  {t('sections.community.events')}
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-sm hover:text-white transition-colors flex items-center gap-2">
                  <BriefcaseIcon className="h-4 w-4" />
                  {t('sections.community.offers')}
                </Link>
              </li>
              <li>
                <Link href="/housing" className="text-sm hover:text-white transition-colors flex items-center gap-2">
                  <HomeIcon className="h-4 w-4" />
                  {t('sections.community.housing')}
                </Link>
              </li>
              <li>
                <Link href="/mutual-aid" className="text-sm hover:text-white transition-colors flex items-center gap-2">
                  <HandRaisedIcon className="h-4 w-4" />
                  {t('sections.community.mutualAid')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal y Soporte */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">{t('sections.legal.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm hover:text-white transition-colors flex items-center gap-2">
                  <LockClosedIcon className="h-4 w-4" />
                  {t('sections.legal.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-white transition-colors flex items-center gap-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  {t('sections.legal.terms')}
                </Link>
              </li>
              <li>
                <a href="https://github.com/JosuIru/comunidad-viva/issues" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors flex items-center gap-2">
                  <BugAntIcon className="h-4 w-4" />
                  {t('sections.legal.reportBug')}
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4" />
                  {t('sections.legal.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Truk.
            <span className="mx-2">•</span>
            {t('tagline')}
            <span className="mx-2">•</span>
            <span className="text-green-500">v3.7.0</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
