'use client';

import { FileText, Search, Filter, Lock } from 'lucide-react';

export default function MedicalRecordsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-foreground">Medical Records</h1>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all md:w-64"
                        />
                    </div>
                    <button className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Your electronic health records</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                        Comprehensive medical history, diagnosis summaries, and immunization records will appear here after your first consultation.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-fit mx-auto">
                        <Lock className="w-3 h-3" /> End-to-end Encrypted
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Discharge Summaries', count: 0 },
                    { label: 'Immunization Records', count: 0 },
                    { label: 'Surgical Reports', count: 0 }
                ].map((stat) => (
                    <div key={stat.label} className="p-6 bg-card border border-border rounded-xl">
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.count}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
