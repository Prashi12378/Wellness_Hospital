'use client';

import { useState, useEffect } from 'react';
import { X, IndianRupee, Plus, Trash2, Calendar, CreditCard, CheckCircle2, Loader2, User } from 'lucide-react';
import { format } from 'date-fns';

interface EditBillModalProps {
    bill: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditBillModal({ bill, isOpen, onClose, onSuccess }: EditBillModalProps) {
    const [items, setItems] = useState<Array<{ name: string; amount: number }>>([]);
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
    const [billDate, setBillDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemAmount, setNewItemAmount] = useState('');
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isOpen || !bill) return;

        const loadBillDetails = async () => {
            setLoadingDetails(true);
            try {
                if (bill.isInvoice) {
                    const res = await fetch(`/api/invoices/${bill.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        const inv = data.invoice;
                        if (inv) {
                            setItems((inv.items || []).map((i: any) => ({
                                name: i.name,
                                amount: Number(i.amount) || Number(i.mrp) || 0
                            })));
                            setDiscountAmount(Number(inv.discountAmount) || 0);
                            setPaymentMethod(inv.paymentMethod || 'CASH');
                            if (inv.date || inv.createdAt) {
                                setBillDate(new Date(inv.date || inv.createdAt).toISOString().split('T')[0]);
                            }
                            setLoadingDetails(false);
                            return;
                        }
                    }
                }

                // Fallback for admission or raw objects
                if (bill.rawAdmission?.HospitalCharge) {
                    setItems(bill.rawAdmission.HospitalCharge.map((c: any) => ({
                        name: c.description,
                        amount: Number(c.amount) || 0
                    })));
                } else {
                    setItems([{ name: 'Hospital Services', amount: Number(bill.amount) || 0 }]);
                }
                setDiscountAmount(Number(bill.discountAmount) || 0);
                setPaymentMethod(bill.paymentMethod || 'CASH');
                if (bill.date) {
                    setBillDate(new Date(bill.date).toISOString().split('T')[0]);
                }
            } catch (err) {
                console.error("Failed to load bill details:", err);
            } finally {
                setLoadingDetails(false);
            }
        };

        loadBillDetails();
    }, [isOpen, bill]);

    if (!isOpen || !bill) return null;

    const subTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const grandTotal = Math.max(0, subTotal - (Number(discountAmount) || 0));

    const handleAddItem = () => {
        if (!newItemName.trim() || !newItemAmount || Number(newItemAmount) <= 0) return;
        setItems([...items, { name: newItemName.trim(), amount: Number(newItemAmount) }]);
        setNewItemName('');
        setNewItemAmount('');
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: 'name' | 'amount', value: any) => {
        const next = [...items];
        if (field === 'amount') {
            next[index].amount = Math.max(0, Number(value) || 0);
        } else {
            next[index].name = value;
        }
        setItems(next);
    };

    const handleSave = async () => {
        if (items.length === 0) {
            alert('Bill must have at least one charge item.');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`/api/invoices/${bill.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    discountAmount,
                    paymentMethod,
                    date: billDate
                })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update bill');
            }
        } catch (error) {
            console.error("Error updating bill:", error);
            alert('Failed to update bill. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Edit Finalised Bill</h2>
                        <p className="text-xs text-slate-500 font-medium">Bill No: {bill.billNo}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {loadingDetails ? (
                    <div className="p-12 flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="w-8 h-8 border-primary animate-spin text-primary" />
                        <p className="text-sm font-medium text-slate-500">Loading bill items & details...</p>
                    </div>
                ) : (
                    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                        {/* Patient Summary Card */}
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                                <User className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-blue-900 text-base">{bill.patientName}</h3>
                                <p className="text-xs text-blue-600 font-medium">{bill.type} Bill • {bill.status}</p>
                            </div>
                        </div>

                        {/* Charges / Items List */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Service Charges & Items</h4>
                                <span className="text-xs text-slate-400 font-medium">{items.length} items</span>
                            </div>

                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="Item description"
                                        />
                                        <div className="relative w-32">
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.amount}
                                                onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                                                className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 text-right outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(idx)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {items.length === 0 && (
                                    <p className="text-center py-6 text-slate-400 text-sm italic">No items recorded. Add an item below.</p>
                                )}
                            </div>

                            {/* Add Item Form */}
                            <div className="flex gap-2 pt-2">
                                <input
                                    type="text"
                                    placeholder="Add new charge description..."
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <div className="relative w-28">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        value={newItemAmount}
                                        onChange={(e) => setNewItemAmount(e.target.value)}
                                        className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 font-mono text-right"
                                    />
                                </div>
                                <button
                                    onClick={handleAddItem}
                                    type="button"
                                    className="px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add
                                </button>
                            </div>
                        </div>

                        {/* Financial Parameters */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex justify-between items-center text-sm text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-bold text-slate-900 text-base">₹{subTotal.toLocaleString()}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">Discount Amount (₹)</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            min="0"
                                            max={subTotal}
                                            value={discountAmount}
                                            onChange={(e) => setDiscountAmount(Number(e.target.value))}
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="UPI">UPI / QR</option>
                                        <option value="CARD">Card</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                        <option value="CREDIT">Credit</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Bill Date</label>
                                <input
                                    type="date"
                                    value={billDate}
                                    onChange={(e) => setBillDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-base font-bold text-slate-800">Grand Total Payable</span>
                                <span className="text-2xl font-black text-primary">₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-[2] py-3 bg-primary text-white hover:bg-primary/90 font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Update Bill
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
