'use client';

import { useState } from 'react';
import { IndianRupee } from 'lucide-react';
import DepositModal from './DepositModal';

interface RecordDepositButtonProps {
    patientId: string;
    patientName: string;
}

export default function RecordDepositButton({ patientId, patientName }: RecordDepositButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all active:scale-95"
            >
                <IndianRupee className="w-3.5 h-3.5" />
                Record Deposit
            </button>

            <DepositModal
                patientId={patientId}
                patientName={patientName}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
