'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95 border border-slate-700"
        >
            <Printer className="w-5 h-5" />
            Print Invoice
        </button>
    );
}
