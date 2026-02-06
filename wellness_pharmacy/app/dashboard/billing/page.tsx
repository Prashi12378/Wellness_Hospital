'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Plus, Trash2, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function BillingPage() {
    const supabase = createClient();

    // State
    const [medicines, setMedicines] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    const [customer, setCustomer] = useState({ name: '', phone: '', doctor: '' });
    const [loading, setLoading] = useState(false);
    const [invoiceId, setInvoiceId] = useState<string | null>(null);

    // Fetch Inventory for search
    useEffect(() => {
        const fetchMedicines = async () => {
            const { data } = await supabase
                .from('pharmacy_inventory')
                .select('*')
                .gt('stock', 0) // Only show items in stock
                .order('name');
            if (data) setMedicines(data);
        };
        fetchMedicines();
    }, []);

    // Filter medicines
    const searchResults = medicines.filter(m =>
        searchTerm && (
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.batch_no?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const addToCart = (medicine: any) => {
        const existing = cart.find(item => item.id === medicine.id);
        if (existing) {
            if (existing.quantity >= medicine.stock) {
                alert(`Only ${medicine.stock} units available!`);
                return;
            }
            setCart(cart.map(item =>
                item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...medicine, quantity: 1 }]);
        }
        setSearchTerm(''); // Clear search after adding
    };

    const updateQuantity = (id: string, newQty: number) => {
        if (newQty < 1) return;
        const medicine = medicines.find(m => m.id === id);
        if (newQty > medicine.stock) {
            alert(`Only ${medicine.stock} units available!`);
            return;
        }
        setCart(cart.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // State for the generated invoice to display/print
    const [lastInvoice, setLastInvoice] = useState<any>(null);

    const handleCheckout = async () => {
        if (!customer.name || cart.length === 0) {
            alert('Please enter customer details and add items.');
            return;
        }
        if (!confirm(`Generate Bill for ₹${totalAmount}?`)) return;

        setLoading(true);
        try {
            const invoiceData = {
                customer_name: customer.name,
                customer_phone: customer.phone,
                doctor_name: customer.doctor,
                total_amount: totalAmount,
                payment_method: 'CASH',
                created_at: new Date().toISOString()
            };

            // 1. Create Invoice
            const { data: invoice, error: invoiceError } = await supabase
                .from('pharmacy_invoices')
                .insert([invoiceData])
                .select()
                .single();

            if (invoiceError) throw invoiceError;

            // 2. Add Items & Deduct Stock
            for (const item of cart) {
                const { error: itemError } = await supabase
                    .from('pharmacy_invoice_items')
                    .insert([{
                        invoice_id: invoice.id,
                        medicine_id: item.id,
                        medicine_name: item.name,
                        quantity: item.quantity,
                        price_per_unit: item.price,
                        total_price: item.price * item.quantity
                    }]);

                if (itemError) throw itemError;

                // Deduct Stock (Simple Update)
                const { error: updateError } = await supabase
                    .from('pharmacy_inventory')
                    .update({ stock: item.stock - item.quantity })
                    .eq('id', item.id);

                if (updateError) throw updateError;
            }

            // Store full details for receipt before clearing form
            setLastInvoice({
                ...invoice,
                items: cart
            });
            setInvoiceId(invoice.id);
            setLocalDateTime();
            // Clear form BUT keep lastInvoice for display
            setCart([]);
            setCustomer({ name: '', phone: '', doctor: '' });
            // alert('Billing Successful!'); // Remove alert, show receipt instead

        } catch (error: any) {
            console.error(error);
            alert('Billing Failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Helper for visual feedback
    const setLocalDateTime = () => { };

    if (invoiceId && lastInvoice) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 min-h-screen bg-slate-50">
                {/* Print Styles */}
                <style jsx global>{`
                    @media print {
                        body * { visibility: hidden; }
                        #invoice-section, #invoice-section * { visibility: visible; }
                        #invoice-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
                        #no-print { display: none; }
                    }
                `}</style>

                {/* Success Message (Hidden on Print) */}
                <div id="no-print" className="text-center space-y-2">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Payment Successful</h2>
                    <p className="text-slate-500">Invoice Generated Successfully</p>
                </div>

                {/* Printable Invoice Card */}
                <div id="invoice-section" className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg border border-slate-200">
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-6 mb-6 text-center">
                        <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wider">Wellness Hospital</h1>
                        <p className="text-sm text-slate-500 mt-1">Pharmacy Department</p>
                        <p className="text-xs text-slate-400 mt-1">Doddaballapura - 561203 | Ph: 6366662245</p>
                    </div>

                    {/* Meta */}
                    <div className="flex justify-between text-sm mb-6">
                        <div>
                            <p className="text-slate-500">Bill To:</p>
                            <p className="font-bold text-slate-800">{lastInvoice.customer_name}</p>
                            {lastInvoice.customer_phone && <p className="text-xs text-slate-500">{lastInvoice.customer_phone}</p>}
                        </div>
                        <div className="text-right">
                            <p className="text-slate-500">Invoice #:</p>
                            <p className="font-bold text-slate-800">{lastInvoice.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-slate-500">{format(new Date(lastInvoice.created_at), 'dd MMM yyyy, HH:mm')}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-sm mb-6">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="py-2 text-left">Item</th>
                                <th className="py-2 text-center">Qty</th>
                                <th className="py-2 text-right">Price</th>
                                <th className="py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {lastInvoice.items.map((item: any, i: number) => (
                                <tr key={i}>
                                    <td className="py-2">{item.name}</td>
                                    <td className="py-2 text-center">{item.quantity}</td>
                                    <td className="py-2 text-right">₹{item.price}</td>
                                    <td className="py-2 text-right font-medium">₹{item.price * item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="border-t border-slate-100 pt-4 text-right space-y-1">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span>₹{lastInvoice.total_amount}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-slate-900 mt-2">
                            <span>Total Paid</span>
                            <span>₹{lastInvoice.total_amount}</span>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-[10px] text-slate-400">
                        <p>Thank you for choosing Wellness Hospital.</p>
                        <p>Get Well Soon!</p>
                    </div>
                </div>

                {/* Actions */}
                <div id="no-print" className="flex gap-4">
                    <button
                        onClick={() => { setInvoiceId(null); setLastInvoice(null); }}
                        className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                    >
                        New Bill
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2 bg-primary-text text-white rounded-lg hover:bg-primary transition-colors flex items-center gap-2 font-medium bg-primary"
                    >
                        <Printer className="w-4 h-4" /> Print Invoice
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-theme(spacing.32))]">

            {/* Left: Product Selection */}
            <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Scan or Search Medicine..."
                        className="flex-1 outline-none text-lg"
                        autoFocus
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Search Results */}
                {searchTerm && (
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden max-h-60 overflow-y-auto">
                        {searchResults.length === 0 ? (
                            <div className="p-4 text-slate-500 text-center">No medicines found.</div>
                        ) : (
                            searchResults.map(medicine => (
                                <button
                                    key={medicine.id}
                                    onClick={() => addToCart(medicine)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-50 last:border-none text-left"
                                >
                                    <div>
                                        <div className="font-medium text-slate-900">{medicine.name}</div>
                                        <div className="text-xs text-slate-500">
                                            Batch: {medicine.batch_no} • Exp: {medicine.expiry_date}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-900">₹{medicine.price}</div>
                                        <div className="text-xs text-emerald-600">{medicine.stock} in stock</div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {/* Cart Table */}
                <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 font-semibold text-slate-700">
                        Current Bill Items
                    </div>
                    <div className="flex-1 overflow-y-auto p-0">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Item</th>
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3">Qty</th>
                                    <th className="px-4 py-3">Total</th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {cart.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 font-medium">{item.name}</td>
                                        <td className="px-4 py-3">₹{item.price}</td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                className="w-16 h-8 px-2 border rounded text-center outline-none focus:border-primary-light"
                                                value={item.quantity}
                                                onChange={e => updateQuantity(item.id, parseInt(e.target.value))}
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-bold">₹{item.price * item.quantity}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-slate-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {cart.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                                            Cart is empty. Search to add items.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right: Customer & Total */}
            <div className="flex flex-col gap-6">

                {/* Customer Details */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800">Customer Details</h3>
                    <input
                        type="text"
                        placeholder="Customer Name *"
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-primary-light"
                        value={customer.name}
                        onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    />
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        maxLength={10}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-primary-light"
                        value={customer.phone}
                        onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Prescribed By (Doctor)"
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-primary-light"
                        value={customer.doctor}
                        onChange={e => setCustomer({ ...customer, doctor: e.target.value })}
                    />
                </div>

                {/* Total & Checkout */}
                <div className="flex-1 bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex justify-between text-slate-400">
                            <span>Subtotal</span>
                            <span>₹{totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>Tax (0%)</span>
                            <span>₹0</span>
                        </div>
                        <div className="h-px bg-slate-800 my-4" />
                        <div className="flex justify-between items-end">
                            <span className="text-lg font-medium">Total Payable</span>
                            <span className="text-4xl font-bold">₹{totalAmount}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={loading || cart.length === 0}
                        className="w-full h-14 bg-primary text-white font-bold rounded-xl text-lg hover:bg-white hover:text-primary transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                    >
                        {loading ? 'Processing...' : 'GENERATE BILL'}
                    </button>
                </div>
            </div>
        </div>
    );
}
