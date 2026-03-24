"use client";

import { useState } from "react";
import { syncMockData, seedWebArchitecture } from "@/actions/sync";
import { RefreshCw, Loader2, Database } from "lucide-react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    setMessage("");
    const res = await syncMockData();
    if (res.success) {
      setMessage("Synced successfully!");
      router.refresh();
    } else {
      setMessage("Error: " + res.error);
    }
    setLoading(false);
  };

  const handleSyncWebArch = async () => {
    setLoading(true);
    setMessage("");
    const res = await seedWebArchitecture();
    if (res.success) {
      setMessage("Web Arch course seeded!");
      router.refresh();
    } else {
      setMessage("Error: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3">
        {message && <span className="text-xs font-bold text-emerald-400">{message}</span>}
        <button 
          onClick={handleSync}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-lg disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Sync Mock Data
        </button>
        <button 
          onClick={handleSyncWebArch}
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-lg disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
          Seed Web Arch
        </button>
      </div>
    </div>
  );
}
