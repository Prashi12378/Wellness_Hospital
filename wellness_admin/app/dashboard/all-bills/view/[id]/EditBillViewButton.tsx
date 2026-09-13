'use client';

import { useState } from 'react';
import { Edit } from 'lucide-react';
import EditBillModal from '../../EditBillModal';
import { useRouter } from 'next/navigation';

export default function EditBillViewButton({ bill }: { bill: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                title="Edit Finalised Bill"
            >
                <Edit className="w-4 h-4" />
                Edit Bill
            </button>

            <EditBillModal
                bill={bill}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSuccess={() => {
                    router.refresh();
                }}
            />
        </>
    );
}
