'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, FileText, Loader2, Hospital } from 'lucide-react';
import { searchMedicines, createInvoice, getPharmacySettings, searchPatients, searchAdmittedPatients } from '@/app/actions/billing';
import InvoicePreview from '@/components/billing/InvoicePreview';
import { cn } from '@/lib/utils';

export default function BillingPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [defaultGstRate, setDefaultGstRate] = useState(5);

    // Billing State
    const [cart, setCart] = useState<any[]>([]);
    const [patientInfo, setPatientInfo] = useState({
        name: '',
        phone: '',
        doctor: '',
        insurance: '',
    });
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdInvoice, setCreatedInvoice] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [discountRate, setDiscountRate] = useState<number>(0);

    // Patient Lookup State
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
    const [isSearchingPatient, setIsSearchingPatient] = useState(false);

    // IPD State
    const [isIpdEnabled, setIsIpdEnabled] = useState(false);
    const [admittedPatientSearchTerm, setAdmittedPatientSearchTerm] = useState('');
    const [admittedSearchResults, setAdmittedSearchResults] = useState<any[]>([]);
    const [isSearchingAdmitted, setIsSearchingAdmitted] = useState(false);
    const [selectedAdmittedPatient, setSelectedAdmittedPatient] = useState<any>(null);

    // Search logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length > 2) {
                setIsSearching(true);
                const { data } = await searchMedicines(searchTerm);
                if (data) setSearchResults(data);
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Patient Search logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (patientSearchTerm.length > 2) {
                setIsSearchingPatient(true);
                const { data } = await searchPatients(patientSearchTerm);
                if (data) setPatientSearchResults(data);
                setIsSearchingPatient(false);
            } else {
                setPatientSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [patientSearchTerm]);

    // Admitted Patient Search logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (admittedPatientSearchTerm.length > 2) {
                setIsSearchingAdmitted(true);
                const { data } = await searchAdmittedPatients(admittedPatientSearchTerm);
                if (data) setAdmittedSearchResults(data);
                setIsSearchingAdmitted(false);
            } else {
                setAdmittedSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [admittedPatientSearchTerm]);

    // Barcode Scanner Logic
    useEffect(() => {
        let buffer = '';
        let lastKeyTime = Date.now();

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore ONLY if inside an input field
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            const currentTime = Date.now();
            const char = e.key;

            if (currentTime - lastKeyTime > 100) {
                buffer = '';
            }
            lastKeyTime = currentTime;

            if (char === 'Enter') {
                if (buffer.length > 2) {
                    const processScan = async () => {
                        const { data } = await searchMedicines(buffer);
                        if (data && data.length > 0) {
                            // Try exact match on batchNo
                            const exactMatch = data.find(m => m.batchNo?.toLowerCase() === buffer.toLowerCase());
                            const item = exactMatch || (data.length === 1 ? data[0] : null);

                            if (item) {
                                addToCart(item);
                                console.log(`Auto-added: ${item.name} | Price: ₹${item.price}`);
                            } else {
                                setSearchTerm(buffer);
                            }
                        } else {
                            setSearchTerm(buffer);
                        }
                    };
                    processScan();
                    buffer = '';
                }
            } else if (char.length === 1) {
                buffer += char;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart]); // Removed showPreview from dependencies

    // Fetch default GST rate
    useEffect(() => {
        const fetchSettings = async () => {
            const result = await getPharmacySettings();
            if (result.success && result.settings) {
                setDefaultGstRate(result.settings.defaultGstRate);
            }
        };
        fetchSettings();
    }, []);

    // Scroll Lock Logic
    useEffect(() => {
        if (showPreview) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showPreview]);

    const addToCart = (medicine: any) => {
        const existing = cart.find(item => item.medicineId === medicine.id);
        if (existing) {
            setCart(cart.map(item =>
                item.medicineId === medicine.id ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            setCart([...cart, {
                medicineId: medicine.id,
                name: medicine.name,
                hsnCode: medicine.hsnCode || '30049099',
                batchNo: medicine.batchNo || 'NA',
                expiryDate: medicine.expiryDate,
                qty: 1,
                mrp: medicine.price,
                gstRate: 0, // Default to 0% as per user request
                stock: medicine.stock
            }]);
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleUpdateGst = (medicineId: string, rate: number) => {
        setCart(cart.map(item =>
            item.medicineId === medicineId ? { ...item, gstRate: rate } : item
        ));
    };

    const removeFromCart = (medicineId: string) => {
        setCart(cart.filter(item => item.medicineId !== medicineId));
    };

    const updateQty = (medicineId: string, qty: number) => {
        if (qty < 1) return;
        setCart(cart.map(item => {
            if (item.medicineId === medicineId) {
                // Ensure qty doesn't exceed stock
                if (qty > item.stock) return item;
                return { ...item, qty };
            }
            return item;
        }));
    };

    // Calculations
    const subTotal = cart.reduce((acc, item) => acc + (item.qty * item.mrp), 0);
    const totalGst = cart.reduce((acc, item) => acc + ((item.qty * item.mrp) * item.gstRate / 100), 0);
    const discountAmount = (subTotal + totalGst) * (discountRate / 100);
    const grandTotal = subTotal + totalGst - discountAmount;

    const handleCreateBilling = async () => {
        if (!patientInfo.name || cart.length === 0) {
            alert('Please enter patient name and add at least one item');
            return;
        }

        setIsSubmitting(true);
        const result = await createInvoice({
            patientName: patientInfo.name,
            patientPhone: patientInfo.phone,
            doctorName: patientInfo.doctor,
            insuranceNo: patientInfo.insurance,
            admissionId: isIpdEnabled ? selectedAdmittedPatient?.admissionId : undefined,
            paymentMethod: isIpdEnabled ? 'CREDIT' : paymentMethod,
            items: cart,
            discountRate,
            discountAmount,
            date: billDate
        });

        if (result.success && result.invoice) {
            setCreatedInvoice(result.invoice);
            setShowPreview(true);
            // Reset form
            setCart([]);
            setPatientInfo({ name: '', phone: '', doctor: '', insurance: '' });
            setDiscountRate(0);
        } else {
            alert(result.error || 'Failed to create invoice');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Billing Counter</h1>
                    <p className="text-slate-500">Generate GST invoices and manage sales.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm">
                    <Hospital className="w-4 h-4" />
                    GSTIN: 29JNVPS4919B2Z5
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Form & Search */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Patient Info Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-6 bg-primary rounded-full" />
                                Patient Information
                            </h3>
                            <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => {
                                        setIsIpdEnabled(false);
                                        setPaymentMethod('CASH');
                                        setPatientInfo({ name: '', phone: '', doctor: '', insurance: '' });
                                    }}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        !isIpdEnabled ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Regular / OPD
                                </button>
                                <button
                                    onClick={() => {
                                        setIsIpdEnabled(true);
                                        setPaymentMethod('CREDIT');
                                        setPatientInfo({ name: '', phone: '', doctor: '', insurance: '' });
                                    }}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        isIpdEnabled ? "bg-primary text-white shadow" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    IPD Credit
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                                    {isIpdEnabled ? 'Admitted Patient Search (Name/Phone/UHID)' : 'Patient Lookup (UHID / Phone)'}
                                    {(isSearchingPatient || isSearchingAdmitted) && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={isIpdEnabled ? admittedPatientSearchTerm : patientSearchTerm}
                                        onChange={(e) => isIpdEnabled ? setAdmittedPatientSearchTerm(e.target.value) : setPatientSearchTerm(e.target.value)}
                                        className={cn(
                                            "w-full px-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all",
                                            isIpdEnabled && "border-primary/30 bg-primary/5"
                                        )}
                                        placeholder={isIpdEnabled ? "Search admitted patient..." : "Search existing patient..."}
                                    />

                                    {/* OPD Search Results */}
                                    {!isIpdEnabled && patientSearchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-auto">
                                            {patientSearchResults.map((p) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => {
                                                        setPatientInfo({
                                                            name: `${p.firstName} ${p.lastName}`,
                                                            phone: p.phone || '',
                                                            doctor: '',
                                                            insurance: '',
                                                        });
                                                        setPatientSearchTerm('');
                                                        setPatientSearchResults([]);
                                                    }}
                                                    className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{p.firstName} {p.lastName}</p>
                                                        <p className="text-[10px] text-slate-500">{p.uhid || 'No UHID'} | {p.phone}</p>
                                                    </div>
                                                    <Plus className="w-4 h-4 text-primary" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* IPD Search Results */}
                                    {isIpdEnabled && admittedSearchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-auto">
                                            {admittedSearchResults.map((p) => (
                                                <button
                                                    key={p.admissionId}
                                                    onClick={() => {
                                                        setSelectedAdmittedPatient(p);
                                                        setPatientInfo({
                                                            name: `${p.firstName} ${p.lastName}`,
                                                            phone: p.phone || '',
                                                            doctor: p.doctorName || '',
                                                            insurance: p.uhid || '',
                                                        });
                                                        setAdmittedPatientSearchTerm('');
                                                        setAdmittedSearchResults([]);
                                                    }}
                                                    className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{p.firstName} {p.lastName}</p>
                                                        <p className="text-[10px] text-slate-500">
                                                            {p.uhid} | Ward: {p.ward} | Bed: {p.bedNumber}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">ADMITTED</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Patient Name *</label>
                                <input
                                    type="text"
                                    value={patientInfo.name}
                                    onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    readOnly={isIpdEnabled}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                                <input
                                    type="text"
                                    value={patientInfo.phone}
                                    onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    readOnly={isIpdEnabled}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Doctor Name</label>
                                <input
                                    type="text"
                                    value={patientInfo.doctor}
                                    onChange={(e) => setPatientInfo({ ...patientInfo, doctor: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    readOnly={isIpdEnabled}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">IP / UHID / Insurance</label>
                                <input
                                    type="text"
                                    value={patientInfo.insurance}
                                    onChange={(e) => setPatientInfo({ ...patientInfo, insurance: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    readOnly={isIpdEnabled}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Bill Date</label>
                                <input
                                    type="date"
                                    value={billDate}
                                    onChange={(e) => setBillDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medicine Search Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-6 bg-emerald-500 rounded-full" />
                            Add Medicines
                        </h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-lg"
                                placeholder="Search medicine by name..."
                            />
                            {isSearching && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                </div>
                            )}

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 max-h-60 overflow-auto">
                                    {searchResults.map((med) => (
                                        <button
                                            key={med.id}
                                            onClick={() => addToCart(med)}
                                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0"
                                        >
                                            <div className="text-left">
                                                <p className="font-bold text-slate-900">{med.name}</p>
                                                <p className="text-xs text-slate-500">Batch: {med.batchNo || 'N/A'} | Stock: {med.stock}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-primary">₹{med.price}</p>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Add to Bill</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cart Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b-2 border-slate-100">
                                    <tr>
                                        <th className="py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Item</th>
                                        <th className="py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Qty</th>
                                        <th className="py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
                                        <th className="py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">GST %</th>
                                        <th className="py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                                        <th className="py-4 w-10 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {cart.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400 italic">No items added to bill yet.</td>
                                        </tr>
                                    ) : (
                                        cart.map((item) => (
                                            <tr key={item.medicineId} className="group hover:bg-slate-50/50 transition-all">
                                                <td className="py-4">
                                                    <p className="font-bold text-slate-800">{item.name}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-medium">Batch: {item.batchNo}</p>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => updateQty(item.medicineId, item.qty - 1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-all text-slate-600"
                                                        >-</button>
                                                        <span className="font-bold w-6 text-center">{item.qty}</span>
                                                        <button
                                                            onClick={() => updateQty(item.medicineId, item.qty + 1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-all text-slate-600"
                                                        >+</button>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right font-medium text-slate-600">₹{item.mrp}</td>
                                                <td className="py-4 text-right">
                                                    <select
                                                        value={item.gstRate}
                                                        onChange={(e) => handleUpdateGst(item.medicineId, Number(e.target.value))}
                                                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                    >
                                                        <option value="0">0%</option>
                                                        <option value="5">5%</option>
                                                        <option value="12">12%</option>
                                                        <option value="18">18%</option>
                                                    </select>
                                                </td>
                                                <td className="py-4 text-right font-black text-slate-900">₹{(item.qty * item.mrp * (1 + item.gstRate / 100)).toFixed(2)}</td>
                                                <td className="py-4 text-center">
                                                    <button
                                                        onClick={() => removeFromCart(item.medicineId)}
                                                        className="p-2 text-slate-300 hover:text-red-500 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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

                {/* Right Column: Checkout */}
                <div className="space-y-6">
                    <div className="bg-[#0B1120] text-white p-8 rounded-2xl shadow-xl space-y-8 sticky top-6">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <FileText className="w-6 h-6 text-primary-light" />
                            Final Checkout
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-slate-400">
                                <span>Sub Total</span>
                                <span className="font-bold text-white">₹{subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                                <span>Total Tax (GST)</span>
                                <span className="font-bold text-emerald-400">+₹{totalGst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                                <div className="flex items-center gap-2">
                                    <span>Discount</span>
                                    <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                                        <input
                                            type="number"
                                            value={discountRate}
                                            onChange={(e) => setDiscountRate(Number(e.target.value))}
                                            className="w-12 bg-transparent text-white font-bold outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                            min="0"
                                            max="100"
                                        />
                                        <span className="text-primary-light font-bold text-xs">%</span>
                                    </div>
                                </div>
                                <span className="font-bold text-red-400">-₹{discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                                <span className="text-lg font-bold">Grand Total</span>
                                <span className="text-3xl font-black text-primary-light">₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Payment Method {isIpdEnabled && <span className="text-primary">(Locked to Credit)</span>}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {['CASH', 'UPI', 'CARD', 'INSURANCE'].map((method) => (
                                    <button
                                        key={method}
                                        onClick={() => !isIpdEnabled && setPaymentMethod(method)}
                                        disabled={isIpdEnabled}
                                        className={cn(
                                            "py-2.5 rounded-xl text-xs font-bold transition-all border",
                                            paymentMethod === method || (isIpdEnabled && method === 'CREDIT') // Force highlight if credit needed but usually CREDIT isn't in list? Wait, CREDIT is not in the list.
                                                ? "bg-primary-light/10 border-primary-light text-primary-light shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                                : "bg-white/5 border-slate-800 text-slate-400 hover:border-slate-700",
                                            isIpdEnabled && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {method}
                                    </button>
                                ))}
                                {/* Add CREDIT option if IPD enabled */}
                                {isIpdEnabled && (
                                    <button
                                        disabled
                                        className="py-2.5 rounded-xl text-xs font-bold transition-all border bg-primary-light/10 border-primary-light text-primary-light shadow-[0_0_15px_rgba(59,130,246,0.1)] col-span-2"
                                    >
                                        CREDIT (IPD BILL)
                                    </button>
                                )}
                            </div>
                        </div>

                        <button
                            disabled={isSubmitting || cart.length === 0}
                            onClick={handleCreateBilling}
                            className="w-full py-5 bg-primary-light hover:bg-blue-400 text-white font-black rounded-2xl shadow-lg shadow-primary-light/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                'GENERATE INVOICE'
                            )}
                        </button>

                        <p className="text-[10px] text-center text-slate-500 uppercase font-black tracking-widest opacity-50">
                            Authorized personnel only
                        </p>
                    </div>
                </div>
            </div>

            {/* Invoice Preview Modal */}
            {showPreview && createdInvoice && (
                <InvoicePreview
                    invoice={createdInvoice}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </div>
    );
}
