import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
//import "../globals.css";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SYNCRA | Business OS",
};

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages({locale});

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}