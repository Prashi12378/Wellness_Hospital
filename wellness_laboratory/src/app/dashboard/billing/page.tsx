"use client";

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Plus, Trash2, Printer, CheckCircle2, Search, Calculator } from "lucide-react";
import { createLabInvoice } from "../../actions/billing";
import LabInvoicePrint from "../../../components/LabInvoicePrint";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

export default function LabBillingPage() {
    const [patientInfo, setPatientInfo] = useState({ name: "", phone: "", doctor: "" });
    const [items, setItems] = useState<any[]>([]);
    const [newItem, setNewItem] = useState({ name: "", price: "", gst: "0" });
    const [discount, setDiscount] = useState({ type: "percentage", value: "" });
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Lab_Invoice_${generatedInvoice?.billNo || "Draft"}`,
    });

    const addItem = () => {
        if (!newItem.name || !newItem.price) return;
        const price = parseFloat(newItem.price);
        const gstRate = parseFloat(newItem.gst);
        const amount = price + (price * gstRate) / 100;

        setItems([...items, { ...newItem, price, gstRate, amount }]);
        setNewItem({ name: "", price: "", gst: "0" });
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        const subTotal = items.reduce((sum, item) => sum + item.price, 0);
        const totalGst = items.reduce((sum, item) => sum + ((item.price * item.gstRate) / 100), 0);
        let discountAmount = 0;

        if (discount.value) {
            const val = parseFloat(discount.value);
            if (discount.type === "percentage") discountAmount = (subTotal * val) / 100;
            else discountAmount = val;
        }

        const grandTotal = subTotal + totalGst - discountAmount;
        return { subTotal, totalGst, discountAmount, grandTotal };
    };

    const handleGenerate = async () => {
        if (!patientInfo.name || items.length === 0) {
            alert("Please enter patient name and add at least one test.");
            return;
        }

        setIsGenerating(true);
        const totals = calculateTotals();

        const payload = {
            patientName: patientInfo.name,
            patientPhone: patientInfo.phone,
            doctorName: patientInfo.doctor,
            paymentMethod,
            subTotal: totals.subTotal,
            totalGst: totals.totalGst,
            discountAmount: totals.discountAmount,
            grandTotal: totals.grandTotal,
            items: items.map(t => ({ name: t.name, price: t.price, gstRate: t.gstRate, amount: t.amount }))
        };

        const result = await createLabInvoice(payload);
        if (result.success) {
            setGeneratedInvoice(result.invoice);
        } else {
            alert("Failed: " + result.error);
        }
        setIsGenerating(false);
    };

    const totals = calculateTotals();

    if (generatedInvoice) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl flex items-center justify-between border border-emerald-200">
                    <div className="flex items-center gap-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <div>
                            <h2 className="text-xl font-bold">Invoice Generated Successfully</h2>
                            <p className="opacity-80">Bill No: {generatedInvoice.billNo}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => { setGeneratedInvoice(null); setItems([]); setPatientInfo({ name: "", phone: "", doctor: "" }) }}>
                            New Bill
                        </Button>
                        <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                            <Printer className="w-4 h-4" /> Print Invoice
                        </Button>
                    </div>
                </div>

                <div className="hidden">
                    <div ref={printRef}>
                        <LabInvoicePrint invoice={generatedInvoice} />
                    </div>
                </div>

                <div className="bg-white shadow-xl rounded-2xl p-8 border border-slate-200 pointer-events-none opacity-90 overflow-hidden">
                    <LabInvoicePrint invoice={generatedInvoice} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Generate Lab Bill</h1>
                <p className="text-slate-500">Create an invoice for laboratory diagnostics and tests.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Patient Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Patient Information
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500">Patient Name *</label>
                                <Input value={patientInfo.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientInfo({ ...patientInfo, name: e.target.value })} placeholder="Full Name" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500">Phone Number</label>
                                <Input value={patientInfo.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientInfo({ ...patientInfo, phone: e.target.value })} placeholder="+91..." />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-semibold text-slate-500">Referring Doctor</label>
                                <Input value={patientInfo.doctor} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientInfo({ ...patientInfo, doctor: e.target.value })} placeholder="Dr. Name (Leave blank for Self)" />
                            </div>
                        </div>
                    </div>

                    {/* Add Tests */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            Add Investigations
                        </h2>
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-slate-500">Test Name</label>
                                <Input value={newItem.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. Complete Blood Count (CBC)" />
                            </div>
                            <div className="w-32">
                                <label className="text-xs font-semibold text-slate-500">Price (₹)</label>
                                <Input type="number" value={newItem.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, price: e.target.value })} placeholder="0.00" />
                            </div>
                            <div className="w-24">
                                <label className="text-xs font-semibold text-slate-500">GST %</label>
                                <select className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm" value={newItem.gst} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewItem({ ...newItem, gst: e.target.value })}>
                                    <option value="0">0%</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                </select>
                            </div>
                            <Button onClick={addItem} className="bg-slate-900 text-white hover:bg-slate-800"><Plus className="w-4 h-4 mr-1" /> Add</Button>
                        </div>

                        {/* Bill Items Table */}
                        {items.length > 0 && (
                            <div className="mt-6 border border-slate-100 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Test Name</th>
                                            <th className="px-4 py-3 text-right font-medium">Price</th>
                                            <th className="px-4 py-3 text-center font-medium">GST</th>
                                            <th className="px-4 py-3 text-right font-medium">Total</th>
                                            <th className="px-4 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-3 font-semibold text-slate-700">{item.name}</td>
                                                <td className="px-4 py-3 text-right">₹{item.price.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center text-slate-400 text-xs">{item.gstRate}%</td>
                                                <td className="px-4 py-3 text-right font-bold text-slate-900">₹{item.amount.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bill Summary */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Calculator className="w-4 h-4" /> Payment Summary
                        </h2>

                        <div className="space-y-3 pt-2 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>₹{totals.subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>GST Taxes</span>
                                <span>+ ₹{totals.totalGst.toFixed(2)}</span>
                            </div>

                            <div className="pt-3 border-t border-slate-100">
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Apply Discount</label>
                                <div className="flex gap-2">
                                    <select
                                        className="h-9 px-2 border border-slate-200 rounded-md text-xs bg-slate-50"
                                        value={discount.type}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDiscount({ ...discount, type: e.target.value })}
                                    >
                                        <option value="percentage">% off</option>
                                        <option value="flat">₹ flat</option>
                                    </select>
                                    <Input
                                        type="number"
                                        className="h-9 text-right"
                                        placeholder="0"
                                        value={discount.value}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscount({ ...discount, value: e.target.value })}
                                    />
                                </div>
                                {totals.discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-medium mt-2">
                                        <span>Discount Applied</span>
                                        <span>- ₹{totals.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-500 font-semibold">Grand Total</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{totals.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <label className="text-xs font-semibold text-slate-500 block">Payment Method</label>
                            <div className="grid grid-cols-2 gap-2">
                                {["CASH", "UPI", "CARD", "CREDIT"].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setPaymentMethod(type)}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${paymentMethod === type ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-white text-slate-500 border-slate-200 hover:border-primary/30'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-600/20"
                            onClick={handleGenerate}
                            disabled={isGenerating || items.length === 0 || !patientInfo.name}
                        >
                            {isGenerating ? "Generating..." : "Generate Invoice"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
