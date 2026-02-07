'use client';

import { FileText } from 'lucide-react';

export default function PrescriptionsPage() {
    return (
        <div className="p-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-yellow-900 mb-2 flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Prescriptions Module - Under Development
                </h2>
                <p className="text-yellow-700">
                    The prescriptions module is being migrated to use Prisma and Server Actions.
                    Please check back soon or contact your administrator.
                </p>
            </div>
        </div>
    );
}
