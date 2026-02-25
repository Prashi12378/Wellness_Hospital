'use client';

import { useState } from 'react';
import { RefreshCcw, Loader2, CheckCircle2 } from 'lucide-react';
import { backfillLedger } from '@/app/actions/backfill-ledger';

export default function BackfillLedgerButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleBackfill = async () => {
        if (!confirm("This will scan all past IPD discharges and OPD invoices to ensure they are in the ledger. Proceed?")) return;

        setIsLoading(true);
        setResult(null);
        const res = await backfillLedger();
        if (res.success) {
            setResult(res.message || "Success!");
        } else {
            setResult("Error: " + (res.error || "Unknown error"));
        }
        setIsLoading(false);
    };

    return (
        <div className="mt-8 p-6 bg-slate-900 text-white rounded-2xl shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-lg font-black tracking-tight uppercase">Ledger Synchronization</h3>
                    <p className="text-xs text-slate-400 font-medium">Synchronize historical IPD/OPD payments with Admin Ledger.</p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3">
                    {result ? (
                        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/30">
                            <CheckCircle2 className="w-4 h-4" />
                            {result}
                        </div>
                    ) : (
                        <button
                            onClick={handleBackfill}
                            disabled={isLoading}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-primary/20"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                            Sync Historical Data
                        </button>
                    )}
                </div>
            </div>

            <div className="absolute -bottom-10 -right-10 opacity-5">
                <RefreshCcw className="w-48 h-48" />
            </div>
        </div>
    );
}
