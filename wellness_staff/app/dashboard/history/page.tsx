'use client';

import { useState, useEffect } from 'react';
import { Search, History, User, Phone, Fingerprint, ArrowRight, Loader2 } from 'lucide-react';
import { searchPatientsForHistory } from '@/app/actions/history';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function HistorySearchPage() {
    const [query, setQuery] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPatients = async (searchQuery?: string) => {
        setIsLoading(true);
        const res = await searchPatientsForHistory(searchQuery);
        if (res.success) setResults(res.patients || []);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length >= 2 || query.length === 0) {
                fetchPatients(query);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const filteredResults = results.filter(patient => {
        if (!nameFilter) return true;
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        return fullName.includes(nameFilter.toLowerCase());
    });

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-primary/10 rounded-3xl text-primary mb-2">
                    <History className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Medical History</h1>
                <p className="text-slate-500 font-medium max-w-xl mx-auto">
                    Search and access comprehensive medical records, IPD dossiers, and OPD prescriptions for any registered patient.
                </p>
            </div>

            {/* Search & Filter Bar Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search globally by UHID, Phone, Name..."
                        className="w-full pl-14 pr-12 py-5 bg-white border border-slate-100 rounded-[24px] shadow-lg shadow-slate-200/40 outline-none focus:ring-4 focus:ring-primary/10 text-sm font-bold transition-all placeholder:text-slate-300"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    {isLoading && (
                        <div className="absolute inset-y-0 right-5 flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        </div>
                    )}
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter list by patient name..."
                        className="w-full pl-14 pr-8 py-5 bg-white border border-slate-100 rounded-[24px] shadow-lg shadow-slate-200/40 outline-none focus:ring-4 focus:ring-primary/10 text-sm font-bold transition-all placeholder:text-slate-300"
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Loading Patients...</p>
                    </div>
                ) : filteredResults.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredResults.map((patient) => (
                            <Link
                                key={patient.id}
                                href={`/dashboard/history/${patient.id}`}
                                className="group flex items-center justify-between p-6 bg-white rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all active:scale-[0.99]"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                            {patient.firstName} {patient.lastName}
                                        </h3>
                                        <div className="flex items-center gap-6 text-sm font-bold text-slate-500 mt-1">
                                            <span className="flex items-center gap-2">
                                                <Fingerprint className="w-4 h-4 text-primary" />
                                                {patient.uhid}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-primary" />
                                                {patient.phone}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 animate-in fade-in duration-300">
                        <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-400 uppercase tracking-wider">No matching patient found</h3>
                        <p className="text-slate-400 text-xs font-medium mt-1">Check the spelling or try searching by UHID/Phone globally.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
