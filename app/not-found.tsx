import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#F8FAFC]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
          <SearchX className="w-5 h-5 text-[#2563EB]" />
        </div>
        <h1 className="text-xl font-semibold text-[#2563EB] mb-2">
          Page not found
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          The page you&apos;re looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
