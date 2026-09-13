"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, IndianRupee, CheckCircle2, Loader2 } from "lucide-react";
import { updateLabInvoice } from "../../app/actions/billing";

interface EditLabBillModalProps {
    bill: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PAYMENT_METHODS = ["CASH", "UPI", "CARD", "CREDIT"];

export default function EditLabBillModal({ bill, isOpen, onClose, onSuccess }: EditLabBillModalProps) {
    const [items, setItems] = useState<Array<{ name: string; price: number; gstRate: number; amount: number }>>([]);
    const [discountType, setDiscountType] = useState<"percentage" | "flat">("flat");
    const [discountValue, setDiscountValue] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
    const [newItem, setNewItem] = useState({ name: "", price: "", gst: "0" });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && bill) {
            const mappedItems = (bill.items || []).map((i: any) => ({
                name: i.name,
                price: Number(i.mrp || i.price || 0),
                gstRate: Number(i.gstRate || 0),
                amount: Number(i.amount || i.mrp || 0),
            }));
            setItems(mappedItems);
            setDiscountType("flat");
            setDiscountValue(String(Number(bill.discountAmount) || ""));
            setPaymentMethod(bill.paymentMethod || "CASH");
            setNewItem({ name: "", price: "", gst: "0" });
            setError(null);
        }
    }, [isOpen, bill]);

    if (!isOpen || !bill) return null;

    const subTotal = items.reduce((s, i) => s + i.price, 0);
    const totalGst = items.reduce((s, i) => s + (i.price * (i.gstRate / 100)), 0);
    const discountAmount = (() => {
        const v = Number(discountValue) || 0;
        if (discountType === "percentage") return Math.min((subTotal + totalGst) * (v / 100), subTotal + totalGst);
        return Math.min(v, subTotal + totalGst);
    })();
    const grandTotal = Math.max(0, subTotal + totalGst - discountAmount);

    const recalcItem = (price: number, gstRate: number) => {
        const gst = price * (gstRate / 100);
        return price + gst;
    };

    const handleAddItem = () => {
        if (!newItem.name.trim() || !newItem.price || Number(newItem.price) <= 0) return;
        const price = Number(newItem.price);
        const gstRate = Number(newItem.gst) || 0;
        setItems([...items, { name: newItem.name.trim(), price, gstRate, amount: recalcItem(price, gstRate) }]);
        setNewItem({ name: "", price: "", gst: "0" });
    };

    const handleRemoveItem = (idx: number) => {
        setItems(items.filter((_, i) => i !== idx));
    };

    const handleItemChange = (idx: number, field: "name" | "price" | "gstRate", value: any) => {
        const next = [...items];
        if (field === "name") {
            next[idx].name = value;
        } else if (field === "price") {
            next[idx].price = Math.max(0, Number(value) || 0);
            next[idx].amount = recalcItem(next[idx].price, next[idx].gstRate);
        } else {
            next[idx].gstRate = Math.max(0, Number(value) || 0);
            next[idx].amount = recalcItem(next[idx].price, next[idx].gstRate);
        }
        setItems(next);
    };

    const handleSave = async () => {
        if (items.length === 0) {
            setError("Bill must have at least one test item.");
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            const res = await updateLabInvoice(bill.id, {
                items,
                subTotal,
                totalGst,
                discountAmount,
                grandTotal,
                paymentMethod,
            });
            if (res.success) {
                onSuccess();
                onClose();
            } else {
                setError((res as any).error || "Failed to update invoice.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
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
                        <h2 className="text-xl font-bold text-slate-800">Edit Lab Invoice</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Bill No: {bill.billNo}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Patient Info */}
                    <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <div className="flex-1">
                            <p className="font-bold text-emerald-900">{bill.patientName}</p>
                            <p className="text-xs text-emerald-600 font-medium">Lab Invoice • {bill.status}</p>
                        </div>
                    </div>

                    {/* Test Items */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Test Items</h4>
                            <span className="text-xs text-slate-400 font-medium">{items.length} tests</span>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-400/20"
                                        placeholder="Test name"
                                    />
                                    <div className="relative w-28">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.price}
                                            onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                                            className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-right outline-none focus:ring-2 focus:ring-emerald-400/20 font-mono"
                                        />
                                    </div>
                                    <div className="relative w-20">
                                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="28"
                                            value={item.gstRate}
                                            onChange={(e) => handleItemChange(idx, "gstRate", e.target.value)}
                                            className="w-full pl-2 pr-6 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-right outline-none focus:ring-2 focus:ring-emerald-400/20 font-mono"
                                            title="GST %"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleRemoveItem(idx)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <p className="text-center py-4 text-slate-400 text-sm italic">No test items. Add a test below.</p>
                            )}
                        </div>
                        {/* Add Item */}
                        <div className="flex gap-2 pt-2">
                            <input
                                type="text"
                                placeholder="Test name..."
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-400/20"
                            />
                            <div className="relative w-24">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={newItem.price}
                                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                    className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-right outline-none focus:ring-2 focus:ring-emerald-400/20 font-mono"
                                />
                            </div>
                            <div className="relative w-20">
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                                <input
                                    type="number"
                                    placeholder="GST"
                                    value={newItem.gst}
                                    onChange={(e) => setNewItem({ ...newItem, gst: e.target.value })}
                                    className="w-full pl-2 pr-6 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-right outline-none focus:ring-2 focus:ring-emerald-400/20 font-mono"
                                    title="GST %"
                                />
                            </div>
                            <button
                                onClick={handleAddItem}
                                type="button"
                                className="px-3 py-2 bg-slate-900 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-bold text-slate-900">₹{subTotal.toFixed(2)}</span>
                        </div>
                        {totalGst > 0 && (
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>GST</span>
                                <span className="font-bold text-slate-900">₹{totalGst.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Discount Type</label>
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value as "flat" | "percentage")}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none"
                                >
                                    <option value="flat">Flat (₹)</option>
                                    <option value="percentage">Percentage (%)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Discount Value</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">{discountType === "flat" ? "₹" : "%"}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-red-600">
                                <span>Discount</span>
                                <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Payment Method</label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {PAYMENT_METHODS.map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setPaymentMethod(m)}
                                        className={`py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase border ${
                                            paymentMethod === m
                                                ? "bg-slate-900 text-white border-slate-900"
                                                : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
                                        }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-base font-bold text-slate-800">Grand Total</span>
                            <span className="text-2xl font-black text-emerald-700">₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-red-600 font-medium bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
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
                            className="flex-[2] py-3 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Update Invoice
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
