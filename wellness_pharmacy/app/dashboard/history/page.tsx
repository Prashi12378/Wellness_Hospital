'use client';

import { History } from 'lucide-react';

export default function HistoryPage() {
    return (
        <div className="p-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-yellow-900 mb-2 flex items-center gap-2">
                    <History className="w-6 h-6" />
                    History Module - Under Development
                </h2>
                <p className="text-yellow-700">
                    The history module is being migrated to use Prisma and Server Actions.
                    Please check back soon or contact your administrator.
                </p>
            </div>
        </div>
    );
}
