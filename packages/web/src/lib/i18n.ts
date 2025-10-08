import { GetStaticPropsContext } from 'next';

export async function getMessages(locale: string) {
  return (await import(`../../messages/${locale}.json`)).default;
}

export async function getI18nProps(context: GetStaticPropsContext, additionalProps = {}) {
  const locale = context.locale || 'es';

  return {
    props: {
      messages: await getMessages(locale),
      ...additionalProps,
    },
  };
}
