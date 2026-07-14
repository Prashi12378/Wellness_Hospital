'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { updateBillDate } from './actions';
import { Loader2, Edit2, Check, X } from 'lucide-react';

interface BillDateEditorProps {
    id: string;
    initialDate: string;
    isInvoice: boolean;
    type: string;
}

export default function BillDateEditor({ id, initialDate, isInvoice, type }: BillDateEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [dateValue, setDateValue] = useState(format(new Date(initialDate), "yyyy-MM-dd'T'HH:mm"));
    const [displayDate, setDisplayDate] = useState(initialDate);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        const res = await updateBillDate(id, dateValue, isInvoice, type);
        if (res.success) {
            setDisplayDate(new Date(dateValue).toISOString());
            setIsEditing(false);
        } else {
            alert(res.error || "Failed to update date & time");
        }
        setIsLoading(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center justify-end gap-2 print:hidden mt-1">
                <input
                    type="datetime-local"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                    className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                />
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                    title="Save date"
                >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                    onClick={() => {
                        setDateValue(format(new Date(displayDate), "yyyy-MM-dd'T'HH:mm"));
                        setIsEditing(false);
                    }}
                    className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                    title="Cancel"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        );
    }

    return (
        <div 
            className="flex items-center justify-end gap-2 group cursor-pointer mt-1" 
            onClick={() => setIsEditing(true)}
            title="Click to edit date & time"
        >
            <p className="text-[12px] font-bold text-slate-900 uppercase">
                {format(new Date(displayDate), 'dd-MMM-yyyy hh:mm a')}
            </p>
            <span className="p-1 bg-slate-100 text-slate-400 hover:text-primary hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all print:hidden">
                <Edit2 className="w-3 h-3" />
            </span>
        </div>
    );
}
