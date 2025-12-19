import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl border border-slate-100">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        
        <h1 className="mb-4 text-3xl font-extrabold text-slate-900">Order Confirmed!</h1>
        <p className="mb-8 text-lg text-slate-600">
          Thank you for your purchase. A confirmation email has been sent to you.
        </p>

        <Link 
          href="/" 
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}