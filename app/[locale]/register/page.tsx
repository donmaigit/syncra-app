import RegisterClient from "@/components/dashboard/RegisterClient";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Create Account | SYNCRA",
};

export default async function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1121] p-4">
      <RegisterClient />
    </div>
  );
}