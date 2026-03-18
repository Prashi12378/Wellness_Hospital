"use client";

import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, Printer, CheckCircle2, Search, Calculator, UserSearch, X, FileText, Loader2 } from "lucide-react";
import { createLabInvoice } from "../../actions/billing";
import { getPatientAdvanceBalance } from "../../actions/patient-billing";
import { getUnbilledLabRequests, getLabRequestById } from "../../actions/lab";
import LabInvoicePrint from "../../../components/LabInvoicePrint";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { cn } from "@/lib/utils";

export default function LabBillingPage() {
    const searchParams = useSearchParams();
    const requestIdParam = searchParams.get("requestId");

    const [patientInfo, setPatientInfo] = useState({ name: "", phone: "", doctor: "" });
    const [items, setItems] = useState<any[]>([]);
    const [newItem, setNewItem] = useState({ name: "", price: "", gst: "0" });
    const [discount, setDiscount] = useState({ type: "percentage", value: "" });
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
    const [advanceBalance, setAdvanceBalance] = useState<number>(0);
    const [patientAdvances, setPatientAdvances] = useState<any[]>([]);
    const [useAdvance, setUseAdvance] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    // Search and Selection for Lab Reports
    const [searchQuery, setSearchQuery] = useState("");
    const [foundReports, setFoundReports] = useState<any[]>([]);
    const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!requestIdParam);

    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Lab_Invoice_${generatedInvoice?.billNo || "Draft"}`,
    });

    useEffect(() => {
        if (requestIdParam) {
            loadInitialRequest(requestIdParam);
        }
    }, [requestIdParam]);

    const loadInitialRequest = async (id: string) => {
        setInitialLoading(true);
        const res = await getLabRequestById(id);
        if (res.success && res.data) {
            selectReport(res.data);
        }
        setInitialLoading(false);
    };

    useEffect(() => {
        if (searchQuery.length > 2) {
            const delayDebounceFn = setTimeout(() => {
                performSearch();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setFoundReports([]);
        }
    }, [searchQuery]);

    // Fetch Advance Balance when patient profile is found
    useEffect(() => {
        if (selectedPatientId) {
            const fetchBalance = async () => {
                const res = await getPatientAdvanceBalance(selectedPatientId);
                if (res.success) {
                    setAdvanceBalance(res.balance);
                    setPatientAdvances(res.advances || []);
                }
            };
            fetchBalance();
        }
    }, [selectedPatientId]);

    const performSearch = async () => {
        setIsSearching(true);
        const res = await getUnbilledLabRequests(searchQuery);
        if (res.success) {
            setFoundReports(res.data || []);
        }
        setIsSearching(false);
    };

    const selectReport = (report: any) => {
        // Auto-populate patient info if not already set or matches
        if (!patientInfo.name) {
            setPatientInfo({
                name: report.patientName,
                phone: report.patient?.phone || "",
                doctor: report.requestedByName || ""
            });
            setSelectedPatientId(report.patientId);
        }

        // Add the test to the items list
        const price = Number(report.amount) || 0;
        const gstRate = 0; // Default or fetch from somewhere?
        const amount = price;

        const newItemEntry = {
            id: report.id, // Keep track for requestIds
            name: report.testName,
            price,
            gstRate,
            amount
        };

        setItems([...items, newItemEntry]);
        setSelectedRequestIds([...selectedRequestIds, report.id]);
        setSearchQuery("");
        setFoundReports([]);
    };

    const addItem = () => {
        if (!newItem.name || !newItem.price) return;
        const price = parseFloat(newItem.price);
        const gstRate = parseFloat(newItem.gst);
        const amount = price + (price * gstRate) / 100;

        setItems([...items, { name: newItem.name, price, gstRate, amount }]);
        setNewItem({ name: "", price: "", gst: "0" });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const updatedItems = [...items];
        const item = { ...updatedItems[index] };
        
        if (field === 'price') {
            item.price = parseFloat(value) || 0;
        } else if (field === 'gstRate') {
            item.gstRate = parseFloat(value) || 0;
        } else if (field === 'name') {
            item.name = value;
        }

        item.amount = item.price + (item.price * item.gstRate) / 100;
        updatedItems[index] = item;
        setItems(updatedItems);
    };

    const removeItem = (index: number) => {
        const itemToRemove = items[index];
        if (itemToRemove.id) {
            setSelectedRequestIds(selectedRequestIds.filter(id => id !== itemToRemove.id));
        }
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

        const grandTotalPreAdvance = subTotal + totalGst - discountAmount;
        const appliedAdvance = useAdvance ? Math.min(grandTotalPreAdvance, advanceBalance) : 0;
        return { subTotal, totalGst, discountAmount, grandTotal: grandTotalPreAdvance - appliedAdvance, appliedAdvance };
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
            advanceAmount: totals.appliedAdvance,
            advancePaymentId: totals.appliedAdvance > 0 ? patientAdvances[0]?.id : undefined,
            grandTotal: totals.grandTotal,
            items: items.map(t => ({ name: t.name, price: t.price, gstRate: t.gstRate, amount: t.amount })),
            requestIds: selectedRequestIds
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

    if (initialLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Report Data...</p>
            </div>
        );
    }

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
                        <Button variant="outline" onClick={() => { setGeneratedInvoice(null); setItems([]); setPatientInfo({ name: "", phone: "", doctor: "" }); setSelectedRequestIds([]) }}>
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Generate Lab Bill</h1>
                    <p className="text-slate-500">Create an invoice for laboratory diagnostics and tests.</p>
                </div>
                
                {/* Search Lab Report Search */}
                <div className="relative w-96">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Patient Name or Report..." 
                            className="pl-10 h-11 border-emerald-100 focus:border-emerald-500 rounded-xl"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                            </button>
                        )}
                    </div>
                    
                    {foundReports.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2 border-b border-slate-50 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Unbilled Lab Reports
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {foundReports.map((report) => (
                                    <button
                                        key={report.id}
                                        onClick={() => selectReport(report)}
                                        className="w-full text-left p-4 hover:bg-emerald-50 transition-colors border-b border-slate-50 last:border-0 group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase text-xs">
                                                    {report.patientName}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                                    {report.testName} • {report.status}
                                                </div>
                                            </div>
                                            <div className="text-xs font-black text-emerald-600">
                                                ₹{Number(report.amount).toFixed(2)}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Patient Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <UserSearch className="w-4 h-4" /> Patient Information
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
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Add Investigations
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
                            <div className="mt-6 border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                        <tr className="uppercase tracking-widest text-[10px] font-black">
                                            <th className="px-6 py-4 text-left font-medium">Test Name</th>
                                            <th className="px-6 py-4 text-right font-medium">Price</th>
                                            <th className="px-6 py-4 text-center font-medium">GST</th>
                                            <th className="px-6 py-4 text-right font-medium">Total</th>
                                            <th className="px-6 py-4 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-black text-slate-700 uppercase text-xs">{item.name}</div>
                                                    {item.id && <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Linked Report</div>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <span className="text-slate-400">₹</span>
                                                        <input 
                                                            type="number" 
                                                            value={item.price} 
                                                            onChange={(e) => updateItem(i, 'price', e.target.value)}
                                                            className="w-24 bg-transparent border-b border-dashed border-slate-200 focus:border-emerald-500 focus:outline-none text-right font-medium text-slate-900 px-1"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <select 
                                                        value={item.gstRate} 
                                                        onChange={(e) => updateItem(i, 'gstRate', e.target.value)}
                                                        className="bg-transparent text-slate-400 text-xs font-bold focus:outline-none"
                                                    >
                                                        <option value="0">0%</option>
                                                        <option value="5">5%</option>
                                                        <option value="12">12%</option>
                                                        <option value="18">18%</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-slate-900">₹{item.amount.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => removeItem(i)} className="text-red-300 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {items.length === 0 && (
                            <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <div className="mx-auto w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-3">
                                    <Search className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Use the search bar above to pull patient reports</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bill Summary */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 sticky top-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Calculator className="w-4 h-4" /> Payment Summary
                        </h2>

                        <div className="space-y-3 pt-2 text-sm">
                            <div className="flex justify-between text-slate-600 font-medium">
                                <span>Subtotal</span>
                                <span>₹{totals.subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 font-medium">
                                <span>GST Taxes</span>
                                <span>+ ₹{totals.totalGst.toFixed(2)}</span>
                            </div>

                            <div className="pt-3 border-t border-slate-100">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Apply Discount</label>
                                <div className="flex gap-2">
                                    <select
                                        className="h-10 px-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 transition-all focus:ring-2 focus:ring-emerald-500/10 outline-none"
                                        value={discount.type}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDiscount({ ...discount, type: e.target.value })}
                                    >
                                        <option value="percentage">% OFF</option>
                                        <option value="flat">₹ FLAT</option>
                                    </select>
                                    <Input
                                        type="number"
                                        className="h-10 text-right font-black"
                                        placeholder="0"
                                        value={discount.value}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscount({ ...discount, value: e.target.value })}
                                    />
                                </div>
                                {totals.discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-black mt-3 text-xs bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                        <span className="uppercase tracking-widest">Savings Applied</span>
                                        <span>- ₹{totals.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <div className="flex justify-between items-center text-slate-400">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Advance Balance</span>
                                        <span className={cn("text-sm font-black", advanceBalance > 0 ? "text-emerald-600" : "text-slate-400")}>
                                            ₹{advanceBalance.toLocaleString()}
                                        </span>
                                    </div>
                                    {advanceBalance > 0 ? (
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={useAdvance}
                                                onChange={(e) => setUseAdvance(e.target.checked)}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-10 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </label>
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter bg-slate-50 px-2 py-1 rounded">No Balance</span>
                                    )}
                                </div>
                                {useAdvance && advanceBalance > 0 && (
                                    <div className="flex justify-between items-center text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                                        <span className="uppercase tracking-widest">Advance Deducted</span>
                                        <span>- ₹{totals.appliedAdvance.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Grand Total</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{totals.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Payment Method</label>
                            <div className="grid grid-cols-2 gap-2">
                                {["CASH", "UPI", "CARD", "CREDIT"].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setPaymentMethod(type)}
                                        className={cn(
                                            "py-3 rounded-xl text-[10px] font-black tracking-widest transition-all border uppercase",
                                            paymentMethod === type 
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10 scale-105 z-10' 
                                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-600'
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-600/20 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest disabled:opacity-50 disabled:grayscale"
                            onClick={handleGenerate}
                            disabled={isGenerating || items.length === 0 || !patientInfo.name}
                        >
                            {isGenerating ? "Processing..." : "Generate Invoice"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
