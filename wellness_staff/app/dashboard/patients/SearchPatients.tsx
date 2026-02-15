'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useDebounce } from 'use-debounce';

export default function SearchPatients() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [text, setText] = useState(searchParams.get('q') || '');
    const [query] = useDebounce(text, 300);

    useEffect(() => {
        if (!query) {
            router.push('/dashboard/patients');
        } else {
            router.push(`/dashboard/patients?q=${query}`);
        }
    }, [query, router]);

    return (
        <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Search by Name, Phone, Email, or UHID..."
                className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-slate-700 placeholder:text-slate-400 shadow-sm"
            />
            {text && (
                <button
                    onClick={() => setText('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            )}
        </div>
    );
}
