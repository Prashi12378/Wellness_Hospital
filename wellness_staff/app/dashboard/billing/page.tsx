'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    ReceiptText, Search, User, Stethoscope, Plus, X, Printer,
    Loader2, CheckCircle2, AlertCircle, ChevronRight, Bed, Clock,
    CreditCard, Banknote, Smartphone, Building2, Trash2
} from 'lucide-react';
import {
    generateOPDInvoice,
    generateObservationInvoice,
    getAllDoctors,
    searchPatientsForBilling,
    getRecentOPDAndObservationBills,
    deleteObservationInvoice,
    clearInvoicePayment
} from '@/app/actions/billing';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────
interface Patient { id: string; firstName: string; lastName: string; uhid: string; phone: string; }
interface Doctor { id: string; firstName: string; lastName: string; specialization: string; consultationFee: number; }
interface LineItem { id: string; name: string; qty: number; amount: number; }
interface Invoice { id: string; billNo: string; patientName: string; patientPhone: string; grandTotal: number; paymentMethod: string; date: string; items: { medicineId: string }[]; status: string; }

// ── Helpers ──────────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
    { value: 'CASH', label: 'Cash', icon: Banknote },
    { value: 'UPI', label: 'UPI / QR Code', icon: Smartphone },
    { value: 'CARD', label: 'Debit / Credit', icon: CreditCard },
    { value: 'TRANSFER', label: 'Bank Transfer', icon: Building2 },
    { value: 'CREDIT', label: 'Credit', icon: CreditCard },
];

function newItem(): LineItem {
    return { id: crypto.randomUUID(), name: '', qty: 1, amount: 0 };
}

// ── Patient Search ────────────────────────────────────────────────────────────
function PatientSearch({ onSelect }: { onSelect: (p: Patient | null) => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Patient[]>([]);
    const [selected, setSelected] = useState<Patient | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = (v: string) => {
        setQuery(v);
        if (timer.current) clearTimeout(timer.current);
        if (v.length < 2) { setResults([]); return; }
        timer.current = setTimeout(async () => {
            setIsSearching(true);
            const res = await searchPatientsForBilling(v);
            if (res.success && res.patients) setResults(res.patients as Patient[]);
            setIsSearching(false);
        }, 300);
    };

    const choose = (p: Patient) => {
        setSelected(p);
        setQuery('');
        setResults([]);
        onSelect(p);
    };

    const clear = () => {
        setSelected(null);
        onSelect(null);
    };

    if (selected) return (
        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-black text-sm">
                    {selected.firstName[0]}{selected.lastName[0]}
                </div>
                <div>
                    <p className="font-bold text-slate-800">{selected.firstName} {selected.lastName}</p>
                    <p className="text-xs text-slate-500">{selected.uhid} · {selected.phone}</p>
                </div>
            </div>
            <button onClick={clear} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
                <X className="w-4 h-4" /> Change
            </button>
        </div>
    );

    return (
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
                value={query}
                onChange={e => handleChange(e.target.value)}
                placeholder="Search by name, UHID or phone…"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-sm font-medium transition-all"
            />
            {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
            {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-30">
                    {results.map(p => (
                        <button key={p.id} onClick={() => choose(p)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0">
                            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                {p.firstName[0]}{p.lastName[0]}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{p.firstName} {p.lastName}</p>
                                <p className="text-xs text-slate-500">{p.uhid} · {p.phone}</p>
                            </div>
                            <ChevronRight className="ml-auto w-4 h-4 text-slate-300" />
                        </button>
                    ))}
                </div>
            )}
            {query.length >= 2 && !isSearching && results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 text-center text-sm text-slate-500 font-medium z-30">
                    No patients found for &ldquo;{query}&rdquo;
                </div>
            )}
        </div>
    );
}

// ── Line Items Editor ─────────────────────────────────────────────────────────
function LineItems({ items, onChange, locked }: { items: LineItem[]; onChange: (items: LineItem[]) => void; locked?: boolean }) {
    const add = () => onChange([...items, newItem()]);
    const rem = (id: string) => onChange(items.filter(i => i.id !== id));
    const upd = (id: string, field: keyof LineItem, val: string | number) =>
        onChange(items.map(i => i.id === id ? { ...i, [field]: val } : i));

    return (
        <div className="space-y-3">
            {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                        <input
                            value={item.name}
                            onChange={e => upd(item.id, 'name', e.target.value)}
                            placeholder={`Item ${idx + 1} description…`}
                            disabled={locked}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                        />
                    </div>
                    <div className="col-span-2">
                        <input
                            type="number" min={1}
                            value={item.qty}
                            onChange={e => upd(item.id, 'qty', Number(e.target.value))}
                            disabled={locked}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-center outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                        />
                    </div>
                    <div className="col-span-3">
                        <input
                            type="number" min={0} step={0.01}
                            value={item.amount || ''}
                            onChange={e => upd(item.id, 'amount', Number(e.target.value))}
                            placeholder="₹"
                            disabled={locked}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                        />
                    </div>
                    <div className="col-span-1 flex justify-center">
                        {!locked && (
                            <button onClick={() => rem(item.id)} className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
            <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-3">Amount (₹)</div>
            </div>
            {!locked && (
                <button onClick={add} className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors py-1">
                    <Plus className="w-4 h-4" /> Add Line Item
                </button>
            )}
        </div>
    );
}

// ── Invoice Print Modal ───────────────────────────────────────────────────────
function InvoiceModal({ invoice, patientName, doctorName, paymentMethod, type, onClose }: {
    invoice: any; patientName: string; doctorName?: string;
    paymentMethod: string; type: 'OPD' | 'OBS'; onClose: () => void;
}) {
    const total = invoice?.grandTotal ?? 0;
    const items = invoice?.items ?? [];
    const billNo = invoice?.billNo ?? '';
    const date = invoice?.date ? format(new Date(invoice.date), 'dd MMM yyyy, hh:mm a') : format(new Date(), 'dd MMM yyyy, hh:mm a');

    // Scroll lock
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const handlePrint = () => window.print();

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:bg-white print:p-0 print:static print:block" id="invoice-overlay">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { 
                        size: A4;
                        margin: 0 !important; 
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: auto !important;
                        background: white !important;
                    }
                    /* HIDE EVERYTHING EXCEPT THE MODAL */
                    body > *:not(#invoice-overlay) {
                        display: none !important;
                    }
                    #invoice-overlay {
                        position: static !important;
                        display: block !important;
                        width: 100% !important;
                        height: auto !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    #print-invoice-container {
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        display: block !important;
                    }
                    #print-invoice {
                        width: 100% !important;
                        padding: 20mm !important;
                        box-sizing: border-box !important;
                        background: white !important;
                        display: block !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            ` }} />

            <div id="print-invoice-container" className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden print:shadow-none print:rounded-none transition-all duration-500 print:w-full print:max-w-none flex flex-col max-h-[95vh]">
                {/* Top bar (Hidden in print) */}
                <div className="bg-slate-900 text-white px-8 py-5 flex items-center justify-between print:hidden shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                            <ReceiptText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <span className="font-black tracking-tight block leading-none">Invoice Generated v1.5</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{type === 'OBS' ? 'Observation' : 'OPD Consultation'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
                            <Printer className="w-4 h-4" /> Print Invoice
                        </button>
                        <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Bill body */}
                <div className="p-10 space-y-10 bg-white relative overflow-y-auto print:overflow-visible print:p-0 flex-1" id="print-invoice">
                    {/* Watermark Logo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.05] select-none print:opacity-[0.07] z-0">
                        <img src="/logo.png" alt="Watermark" className="w-[500px] h-[500px] object-contain" />
                    </div>

                    {/* Professional Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-100 pb-10 relative z-10">
                        <div className="flex gap-6 items-start">
                            <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain rounded-2xl" />
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">WELLNESS HOSPITAL</h1>
                                <p className="text-slate-600 text-[11px] font-semibold max-w-sm leading-relaxed uppercase tracking-wide">
                                    Beside friend function hall, Gowribidnur main road,<br />
                                    Palanjoghalli, Doddaballapur - 561203<br />
                                    <span className="text-primary font-black mt-1 block">PH: 8105666338 | wellnesshospital8383@gmail.com</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-black uppercase tracking-widest mb-4">
                                TAX INVOICE
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Bill Number</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{billNo}</p>
                            <p className="text-slate-500 text-xs font-medium mt-1">{date}</p>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-3 gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 relative z-10 print:bg-transparent print:p-0 print:border-0">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</p>
                            <p className="font-bold text-slate-800 text-lg leading-tight">{patientName}</p>
                        </div>
                        {doctorName && (
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consulting Doctor</p>
                                <p className="font-bold text-slate-800 text-lg leading-tight">Dr. {doctorName.replace(/^Dr\.\s+/i, '')}</p>
                            </div>
                        )}
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-lg leading-tight">{paymentMethod}</span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-black uppercase tracking-tighter">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> PAID
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="space-y-4">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase tracking-widest">
                                    <th className="px-2 py-4 text-left">Description of Services</th>
                                    <th className="px-2 py-4 text-center w-24">Quantity</th>
                                    <th className="px-2 py-4 text-right w-32">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item: any, i: number) => (
                                    <tr key={i}>
                                        <td className="px-2 py-5 font-bold text-slate-700">{item.name}</td>
                                        <td className="px-2 py-5 text-center text-slate-600 font-medium">{item.qty}</td>
                                        <td className="px-2 py-5 text-right font-black text-slate-900 text-lg">₹{Number(item.amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals & T&C */}
                    <div className="grid grid-cols-2 gap-10 pt-6 border-t-2 border-slate-100">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Terms & Conditions</h4>
                                <ul className="text-[9px] text-slate-500 space-y-1 font-medium leading-relaxed">
                                    <li>• This is a computer generated invoice and does not require a physical signature.</li>
                                    <li>• Fees once paid are non-refundable and non-transferable.</li>
                                    <li>• Please retain this invoice for future follow-ups.</li>
                                    <li>• Disputes are subject to Bangalore jurisdiction only.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-6 text-right">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                                <p className="text-5xl font-black text-slate-900 tracking-tighter leading-none">₹{Number(total).toLocaleString()}</p>
                            </div>

                            <div className="pt-10 w-48 border-t border-slate-200">
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center mt-2">Authorized Signatory</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-10 text-[9px] text-slate-400 font-medium border-t border-slate-50 border-dashed">
                        Thank you for choosing Wellness Hospital. Get well soon!
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ── OPD Billing Tab ───────────────────────────────────────────────────────────
function OPDBillingTab({ doctors, onSuccess }: { doctors: Doctor[]; onSuccess: () => void }) {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [doctor, setDoctor] = useState('');
    const [items, setItems] = useState<LineItem[]>([newItem()]);
    const [payment, setPayment] = useState('CASH');
    const [dateOut, setDateOut] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState<any>(null);

    const selectedDoctor = doctors.find(d => d.id === doctor);
    const total = items.reduce((s, i) => s + (i.amount * i.qty), 0);

    const handleGenerate = async () => {
        if (!patient) return alert('Please select a patient.');
        if (items.some(i => !i.name || i.amount <= 0)) return alert('Fill in all line items with descriptions and amounts.');

        setLoading(true);
        const res = await generateOPDInvoice({
            appointmentId: '',
            patientName: `${patient.firstName} ${patient.lastName}`,
            patientPhone: patient.phone,
            doctorName: selectedDoctor ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}` : undefined,
            subTotal: total,
            totalGst: 0,
            grandTotal: total,
            paymentMethod: payment,
            date: dateOut,
            items: items.map(i => ({ name: i.name, qty: i.qty, mrp: i.amount, gstRate: 0, amount: i.amount * i.qty }))
        });

        if (res.success) {
            setInvoice(res.invoice);
            onSuccess();
        } else {
            alert(res.error || 'Failed to generate invoice');
        }
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" /> Step 1 · Select Patient
                    </h3>
                    <PatientSearch onSelect={setPatient} />
                </div>
                <div className={cn("bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-all", !patient && 'opacity-50 pointer-events-none')}>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" /> Step 2 · Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Doctor</label>
                            <select
                                value={doctor}
                                onChange={e => { setDoctor(e.target.value); const d = doctors.find(x => x.id === e.target.value); if (d) setItems([{ id: crypto.randomUUID(), name: `Consultation Fee – Dr. ${d.firstName} ${d.lastName}`, qty: 1, amount: Number(d.consultationFee) }]); }}
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                            >
                                <option value="">— No doctor / Walk-in —</option>
                                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill Date</label>
                            <input type="date" value={dateOut} onChange={e => setDateOut(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                    </div>
                </div>
                <div className={cn("bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-all", !patient && 'opacity-50 pointer-events-none')}>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ReceiptText className="w-4 h-4" /> Step 3 · Services &amp; Charges
                    </h3>
                    <LineItems items={items} onChange={setItems} />
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl sticky top-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
                    <p className="text-5xl font-black tracking-tighter mb-6">₹{total.toLocaleString()}</p>
                    <div className="space-y-2 mb-6">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Mode</p>
                        <div className="grid grid-cols-2 gap-2">
                            {PAYMENT_METHODS.map(pm => (
                                <button key={pm.value} onClick={() => setPayment(pm.value)} className={cn('flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all border', payment === pm.value ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500')}>
                                    <pm.icon className="w-3.5 h-3.5" /> {pm.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button disabled={loading || !patient || total === 0} onClick={handleGenerate} className="w-full py-4 bg-primary hover:bg-primary/90 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95">
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><ReceiptText className="w-5 h-5" /> Generate OPD Invoice</>}
                    </button>
                </div>
            </div>
            {invoice && <InvoiceModal invoice={invoice} patientName={patient ? `${patient.firstName} ${patient.lastName}` : ''} doctorName={selectedDoctor ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}` : undefined} paymentMethod={payment} type="OPD" onClose={() => setInvoice(null)} />}
        </div>
    );
}

// ── Observation Billing Tab ───────────────────────────────────────────────────
function ObservationBillingTab({ doctors, onSuccess }: { doctors: Doctor[]; onSuccess: () => void }) {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [doctor, setDoctor] = useState('');
    const [ward, setWard] = useState('');
    const [hours, setHours] = useState<number>(6);
    const [dateOut, setDateOut] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<LineItem[]>([{ id: crypto.randomUUID(), name: 'Observation / Bed Charges', qty: 1, amount: 0 }]);
    const [payment, setPayment] = useState('CASH');
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState<any>(null);

    const selectedDoctor = doctors.find(d => d.id === doctor);
    const total = items.reduce((s, i) => s + (i.amount * i.qty), 0);

    const handleGenerate = async () => {
        if (!patient) return alert('Please select a patient.');
        if (items.some(i => !i.name || i.amount <= 0)) return alert('Fill in all line items with descriptions and amounts.');

        setLoading(true);
        const res = await generateObservationInvoice({
            patientId: patient.id,
            patientName: `${patient.firstName} ${patient.lastName}`,
            patientPhone: patient.phone,
            doctorName: selectedDoctor ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}` : undefined,
            observationHours: hours,
            ward,
            subTotal: total,
            totalGst: 0,
            grandTotal: total,
            paymentMethod: payment,
            date: dateOut,
            items: items.map(i => ({ name: i.name, qty: i.qty, mrp: i.amount, gstRate: 0, amount: i.amount * i.qty }))
        });

        if (res.success) {
            setInvoice(res.invoice);
            onSuccess();
        } else {
            alert(res.error || 'Failed to generate invoice');
        }
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" /> Step 1 · Select Patient
                    </h3>
                    <PatientSearch onSelect={setPatient} />
                </div>
                <div className={cn("bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-all", !patient && 'opacity-50 pointer-events-none')}>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Bed className="w-4 h-4" /> Step 2 · Observation Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ward / Room</label>
                            <input value={ward} onChange={e => setWard(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Obs. Hours</label>
                            <input type="number" min={1} value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attending Doctor</label>
                            <select value={doctor} onChange={e => setDoctor(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                                <option value="">— Optional —</option>
                                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className={cn("bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-all", !patient && 'opacity-50 pointer-events-none')}>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ReceiptText className="w-4 h-4" /> Step 3 · Charges
                    </h3>
                    <LineItems items={items} onChange={setItems} />
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl sticky top-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
                    <p className="text-5xl font-black tracking-tighter mb-6">₹{total.toLocaleString()}</p>
                    <div className="space-y-2 mb-6">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Mode</p>
                        <div className="grid grid-cols-2 gap-2">
                            {PAYMENT_METHODS.map(pm => (
                                <button key={pm.value} onClick={() => setPayment(pm.value)} className={cn('flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all border', payment === pm.value ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500')}>
                                    <pm.icon className="w-3.5 h-3.5" /> {pm.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button disabled={loading || !patient || total === 0} onClick={handleGenerate} className="w-full py-4 bg-primary hover:bg-primary/90 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95">
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Bed className="w-5 h-5" /> Generate Obs. Invoice</>}
                    </button>
                </div>
            </div>
            {invoice && <InvoiceModal invoice={invoice} patientName={patient ? `${patient.firstName} ${patient.lastName}` : ''} doctorName={selectedDoctor ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}` : undefined} paymentMethod={payment} type="OBS" onClose={() => setInvoice(null)} />}
        </div>
    );
}

function SwipeableTableRow({ bill, onDelete, onPrint, isDeleting, onClear }: {
    bill: Invoice;
    onDelete: () => void;
    onPrint: () => void;
    onClear: (method: string) => void;
    isDeleting?: boolean;
}) {
    const [startX, setStartX] = useState(0);
    const [currentX, setCurrentX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);

    const onPointerDown = (e: React.PointerEvent) => {
        setStartX(e.clientX);
        setIsSwiping(true);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!isSwiping) return;
        const delta = e.clientX - startX;
        if (delta < 0) setCurrentX(delta);
    };

    const onPointerUp = () => {
        setIsSwiping(false);
        if (currentX < -100) {
            onDelete();
        }
        setCurrentX(0);
    };

    return (
        <tr
            className="group hover:bg-slate-50/50 transition-colors relative"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ touchAction: 'none' }}
        >
            <td className="px-6 py-4">
                <div
                    className="absolute inset-y-0 right-0 bg-red-500 flex items-center justify-center transition-all duration-200"
                    style={{ width: Math.abs(currentX), opacity: Math.min(Math.abs(currentX) / 100, 1) }}
                >
                    <Trash2 className="w-5 h-5 text-white" />
                </div>

                <div className="flex flex-col transform transition-transform duration-200" style={{ transform: `translateX(${currentX}px)` }}>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">#{bill.billNo}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{bill.patientName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{bill.patientPhone || 'No Phone'}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest",
                    bill.billNo.startsWith('OBS') ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                )}>
                    {bill.billNo.startsWith('OBS') ? 'OBS' : 'OPD'}
                </span>
            </td>
            <td className="px-6 py-4 text-right font-black text-slate-900">
                ₹{Number(bill.grandTotal).toLocaleString()}
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bill.paymentMethod}</span>
                    <span className={cn(
                        "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded w-fit",
                        bill.status === 'PAID' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                        {bill.status}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                {format(new Date(bill.date), 'dd MMM yy, hh:mm a')}
            </td>
            <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                    {bill.status === 'UNPAID' && (
                        <div className="relative">
                            <button
                                onClick={() => setShowClearModal(true)}
                                className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 transition-all"
                                title="Clear Payment"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                            </button>
                            {showClearModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm pointer-events-auto">
                                    <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
                                        <h3 className="text-xl font-black text-slate-800 mb-4">Clear Payment?</h3>
                                        <div className="grid grid-cols-2 gap-2 mb-6">
                                            {['CASH', 'UPI', 'CARD', 'TRANSFER'].map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => {
                                                        onClear(m);
                                                        setShowClearModal(false);
                                                    }}
                                                    className="py-2.5 rounded-xl text-xs font-black bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-100 transition-all uppercase"
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={() => setShowClearModal(false)}
                                            className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <button
                        onClick={onPrint}
                        className="p-2 rounded-xl text-slate-300 hover:text-primary hover:bg-primary/5 transition-all"
                        title="Print"
                    >
                        <Printer className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}


// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BillingHubPage() {
    const [tab, setTab] = useState<'opd' | 'obs'>('opd');
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [bills, setBills] = useState<Invoice[]>([]);
    const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const handleDeleteObsBill = async (id: string) => {
        setDeleteConfirmId(null);
        setIsDeleting(id);
        const res = await deleteObservationInvoice(id);
        if (res.success) {
            fetchBills();
        } else {
            alert('Failed to delete bill: ' + res.error);
        }
        setIsDeleting(null);
    };

    const fetchDoctors = useCallback(async () => {
        const res = await getAllDoctors();
        if (res.success && res.doctors) setDoctors(res.doctors as unknown as Doctor[]);
    }, []);

    const fetchBills = useCallback(async () => {
        const res = await getRecentOPDAndObservationBills();
        if (res.success && res.invoices) setBills(res.invoices as Invoice[]);
    }, []);

    useEffect(() => {
        fetchDoctors();
        fetchBills();
    }, [fetchDoctors, fetchBills]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <ReceiptText className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Billing</h1>
                    </div>
                    <p className="text-slate-500 font-medium text-sm ml-13">Raise OPD consultation bills and observation invoices for walk-in patients.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white p-2 rounded-3xl shadow-sm border border-slate-100 w-fit">
                <button
                    onClick={() => setTab('opd')}
                    className={cn(
                        'flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all',
                        tab === 'opd'
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    )}
                >
                    <Stethoscope className="w-4 h-4" />
                    OPD Consultation
                </button>
                <button
                    onClick={() => setTab('obs')}
                    className={cn(
                        'flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all',
                        tab === 'obs'
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    )}
                >
                    <Bed className="w-4 h-4" />
                    Observation
                </button>
            </div>

            {/* Tab Content */}
            {tab === 'opd'
                ? <OPDBillingTab doctors={doctors} onSuccess={fetchBills} />
                : <ObservationBillingTab doctors={doctors} onSuccess={fetchBills} />
            }

            {/* Recent Bills */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Recent Bills</h2>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Last 50 OPD &amp; Observation invoices</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/60 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="px-6 py-4 text-left">Bill No.</th>
                                <th className="px-6 py-4 text-left">Patient</th>
                                <th className="px-6 py-4 text-left">Type</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-left">Payment</th>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-center">Print</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {bills.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-slate-400 font-bold italic">
                                        No bills generated yet.
                                    </td>
                                </tr>
                            )}
                            {bills.map(bill => (
                                <SwipeableTableRow 
                                    key={bill.id} 
                                    bill={bill} 
                                    isDeleting={isDeleting === bill.id} 
                                    onDelete={() => setDeleteConfirmId(bill.id)} 
                                    onPrint={() => setPrintInvoice(bill)} 
                                    onClear={async (method) => {
                                        const res = await clearInvoicePayment(bill.id, method);
                                        if (res.success) fetchBills();
                                        else alert('Failed to clear: ' + res.error);
                                    }}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print modal for recent bills */}
            {printInvoice && (
                <InvoiceModal
                    invoice={printInvoice}
                    patientName={printInvoice.patientName}
                    paymentMethod={printInvoice.paymentMethod}
                    type={printInvoice.items?.some(i => i.medicineId === 'OBSERVATION') ? 'OBS' : 'OPD'}
                    onClose={() => setPrintInvoice(null)}
                />
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 fade-in duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 text-center mb-2">Delete Observation Bill?</h3>
                        <p className="text-sm text-slate-500 text-center mb-6">
                            Are you sure you want to delete this observation bill? This action cannot be undone and the record will be removed from the ledger.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteObsBill(deleteConfirmId)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
