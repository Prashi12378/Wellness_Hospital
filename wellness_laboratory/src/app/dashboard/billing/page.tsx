"use client";

import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, Printer, CheckCircle2, Search, Calculator, UserSearch, X, FileText, Loader2 } from "lucide-react";
import { createLabInvoice, getLabInvoices } from "../../actions/billing";
import { getPatientDepositBalance } from "../../actions/patient-billing";
import { getUnbilledLabRequests, getLabRequestById } from "../../actions/lab";
import LabInvoicePrint from "../../../components/LabInvoicePrint";
import { format } from "date-fns";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { cn } from "@/lib/utils";

import { Suspense } from "react";

function LabBillingPageContent() {
    const searchParams = useSearchParams();
    const requestIdParam = searchParams.get("requestId");

    const [patientInfo, setPatientInfo] = useState({ name: "", phone: "", doctor: "" });
    const [items, setItems] = useState<any[]>([]);
    const [newItem, setNewItem] = useState({ name: "", price: "", gst: "0" });
    const [discount, setDiscount] = useState({ type: "percentage", value: "" });
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
    const [viewingInvoice, setViewingInvoice] = useState<any>(null);
    const [recentBills, setRecentBills] = useState<any[]>([]);
    const [isFetchingBills, setIsFetchingBills] = useState(false);
    const [depositBalance, setDepositBalance] = useState<number>(0);
    const [patientDeposits, setPatientDeposits] = useState<any[]>([]);
    const [useDeposit, setUseDeposit] = useState(false);
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
        fetchRecentBills();
    }, [requestIdParam]);

    const fetchRecentBills = async () => {
        setIsFetchingBills(true);
        const res = await getLabInvoices();
        if (res.success && res.invoices) {
            setRecentBills(res.invoices.slice(0, 50));
        }
        setIsFetchingBills(false);
    };

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

    // Fetch Deposit Balance when patient profile is found
    useEffect(() => {
        if (selectedPatientId) {
            const fetchBalance = async () => {
                const res = await getPatientDepositBalance(selectedPatientId);
                if (res.success) {
                    setDepositBalance(res.balance);
                    setPatientDeposits(res.deposits || []);
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

        const grandTotalPreDeposit = subTotal + totalGst - discountAmount;
        const appliedDeposit = useDeposit ? Math.min(grandTotalPreDeposit, depositBalance) : 0;
        return { subTotal, totalGst, discountAmount, grandTotal: grandTotalPreDeposit - appliedDeposit, appliedDeposit };
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
            depositAmount: totals.appliedDeposit,
            depositId: totals.appliedDeposit > 0 ? patientDeposits[0]?.id : undefined,
            grandTotal: totals.grandTotal,
            items: items.map(t => ({ name: t.name, price: t.price, gstRate: t.gstRate, amount: t.amount })),
            requestIds: selectedRequestIds
        };

        const result = await createLabInvoice(payload);
        if (result.success) {
            setGeneratedInvoice(result.invoice);
            fetchRecentBills();
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

    if (generatedInvoice || viewingInvoice) {
        const activeInvoice = generatedInvoice || viewingInvoice;
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl flex items-center justify-between border border-emerald-200">
                    <div className="flex items-center gap-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <div>
                            <h2 className="text-xl font-bold">{generatedInvoice ? "Invoice Generated Successfully" : "Invoice Details"}</h2>
                            <p className="opacity-80">Bill No: {activeInvoice.billNo}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => { setGeneratedInvoice(null); setViewingInvoice(null); setItems([]); setPatientInfo({ name: "", phone: "", doctor: "" }); setSelectedRequestIds([]) }}>
                            {generatedInvoice ? "New Bill" : "Back to Billing"}
                        </Button>
                        <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                            <Printer className="w-4 h-4" /> Print Invoice
                        </Button>
                    </div>
                </div>

                <div className="hidden">
                    <div ref={printRef}>
                        <LabInvoicePrint invoice={activeInvoice} />
                    </div>
                </div>

                <div className="bg-white shadow-xl rounded-2xl p-8 border border-slate-200 pointer-events-none opacity-90 overflow-hidden">
                    <LabInvoicePrint invoice={activeInvoice} />
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
                            {/* Deposit Section */}
                            <div className="pt-4 border-t border-slate-800">
                                {depositBalance > 0 ? (
                                    <button
                                        onClick={() => setUseDeposit(!useDeposit)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-300",
                                            useDeposit
                                                ? "bg-emerald-500 border-emerald-600"
                                                : "bg-slate-800 border-slate-700 hover:border-slate-600"
                                        )}
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest", useDeposit ? "text-white/70" : "text-slate-500")}>
                                                Patient Deposit
                                            </span>
                                            <span className={cn("text-base font-black tabular-nums", useDeposit ? "text-white" : "text-slate-300")}>
                                                ₹{depositBalance.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                                            useDeposit
                                                ? "bg-white/20 text-white"
                                                : "bg-slate-700 text-slate-400"
                                        )}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full", useDeposit ? "bg-white" : "bg-slate-500")} />
                                            {useDeposit ? "Applied" : "Apply"}
                                        </div>
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800 border border-slate-700">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Patient Deposit</span>
                                        <span className="text-[10px] font-bold text-slate-600 bg-slate-700 px-2 py-1 rounded-lg">No Balance</span>
                                    </div>
                                )}
                                {useDeposit && depositBalance > 0 && (
                                    <div className="mt-2 flex justify-between items-center text-xs font-bold px-1">
                                        <span className="text-slate-500">Deducted from Total:</span>
                                        <span className="text-emerald-400">− ₹{totals.appliedDeposit.toLocaleString()}</span>
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

            {/* Recent Bills History */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-500" /> Recent Bills History
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Last 50 generated laboratory invoices</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchRecentBills} disabled={isFetchingBills} className="text-xs font-bold bg-white">
                        {isFetchingBills ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
                        Refresh List
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill No</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Payment</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentBills.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                                        No recent bills found.
                                    </td>
                                </tr>
                            ) : (
                                recentBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                                                {bill.billNo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-600">
                                            {bill.date ? format(new Date(bill.date), "dd MMM yyyy, hh:mm a") : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                            {bill.patientName}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-black text-slate-900">
                                            ₹{Number(bill.grandTotal).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                {bill.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                bill.status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                                                bill.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                                                "bg-red-100 text-red-700"
                                            )}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setViewingInvoice(bill)}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                title="View / Print"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function LabBillingPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading...</p>
            </div>
        }>
            <LabBillingPageContent />
        </Suspense>
    );
}
