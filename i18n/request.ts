import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['ja', 'en'];

export default getRequestConfig(async ({locale}) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    locale,
    // Correct path: Go up one level (..) to find messages folder
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
