'use client';

import { useState, useEffect } from 'react';
import { X, IndianRupee, CalendarDays, FileText, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { updateDeposit } from '@/app/actions/patient-billing';

interface EditDepositModalProps {
    deposit: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PAYMENT_METHODS = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'];

export default function EditDepositModal({ deposit, isOpen, onClose, onSuccess }: EditDepositModalProps) {
    const [amount, setAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
    const [description, setDescription] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && deposit) {
            setAmount(Number(deposit.amount) || 0);
            setPaymentMethod(deposit.paymentMethod || 'CASH');
            setDescription(deposit.description || '');
            setDate(deposit.createdAt ? new Date(deposit.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            setError(null);
        }
    }, [isOpen, deposit]);

    if (!isOpen || !deposit) return null;

    const handleSave = async () => {
        if (!amount || amount <= 0) {
            setError('Amount must be greater than zero.');
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            const res = await updateDeposit(deposit.id, { amount, paymentMethod, description, date });
            if (res.success) {
                onSuccess();
                onClose();
            } else {
                setError((res as any).error || 'Failed to update advance payment.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Edit Advance Payment</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Update advance payment details</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Amount */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">
                            Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Description</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                placeholder="e.g. Pre-admission deposit"
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Payment Date</label>
                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                            {PAYMENT_METHODS.map(m => (
                                <button
                                    key={m}
                                    onClick={() => setPaymentMethod(m)}
                                    className={`py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all border uppercase ${
                                        paymentMethod === m
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {m === 'BANK_TRANSFER' ? 'TRANSFER' : m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-red-600 font-medium bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-[2] py-3 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Update Payment
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
