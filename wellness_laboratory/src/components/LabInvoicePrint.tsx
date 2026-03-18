import { format } from "date-fns";

export default function LabInvoicePrint({ invoice }: { invoice: any }) {
    if (!invoice) return null;

    return (
        <div className="w-[800px] bg-white p-10 font-sans text-slate-900 mx-auto" style={{ minHeight: '1100px' }}>
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                <div className="flex gap-4 items-center">
                    <img src="/hospital-logo.png" alt="Logo" className="w-16 h-16 object-contain" style={{ filter: "brightness(1.2)" }} />
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">Wellness Lab</h1>
                        <p className="text-sm text-slate-600 font-medium">Diagnostic & Pathology Center</p>
                        <p className="text-xs text-slate-500 mt-1">Beside friend function hall, Gowribidnur main road, Palanjoghalli</p>
                        <p className="text-xs text-slate-500">Doddaballapur - 561203, Karnataka</p>
                        <p className="text-xs text-slate-500">Phone: +91 81056 66338</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-black text-slate-300 uppercase tracking-widest mb-2">Invoice</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                        <span className="font-bold">Bill No:</span>
                        <span className="font-mono text-slate-900">{invoice.billNo}</span>
                        <span className="font-bold">Date:</span>
                        <span>{format(new Date(invoice.createdAt || invoice.date), "dd MMM yyyy HH:mm")}</span>
                        <span className="font-bold">GSTIN:</span>
                        <span>{invoice.gstin}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Patient Details</h3>
                    <p className="font-bold text-lg mb-1">{invoice.patientName}</p>
                    {invoice.patientPhone && <p className="text-sm text-slate-600">Ph: {invoice.patientPhone}</p>}
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Reference</h3>
                    <p className="text-sm text-slate-600 mb-1"><span className="font-bold text-slate-900">Ref Doctor:</span> {invoice.doctorName}</p>
                    <p className="text-sm text-slate-600 mb-1"><span className="font-bold text-slate-900">Payment:</span> {invoice.paymentMethod} ({invoice.status})</p>
                </div>
            </div>

            <table className="w-full mb-8">
                <thead className="bg-slate-900 text-white">
                    <tr>
                        <th className="py-3 px-4 text-left font-bold text-sm tracking-wider w-12">#</th>
                        <th className="py-3 px-4 text-left font-bold text-sm tracking-wider">Investigation / Test Name</th>
                        <th className="py-3 px-4 text-center font-bold text-sm tracking-wider w-24">GST</th>
                        <th className="py-3 px-4 text-right font-bold text-sm tracking-wider w-32">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 border-b-2 border-slate-900">
                    {invoice.items.map((item: any, i: number) => (
                        <tr key={i} className="even:bg-slate-50">
                            <td className="py-3 px-4 text-sm text-slate-500">{i + 1}</td>
                            <td className="py-3 px-4 font-bold text-slate-800">{item.name}</td>
                            <td className="py-3 px-4 text-center text-sm text-slate-500">{item.gstRate}%</td>
                            <td className="py-3 px-4 text-right font-medium">₹{(Number(item.amount) || 0).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end mb-16">
                <div className="w-80 space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span>₹{(Number(invoice.subTotal) || 0).toFixed(2)}</span>
                    </div>
                    {(Number(invoice.totalGst) || 0) > 0 && (
                        <div className="flex justify-between text-slate-600">
                            <span>GST Added</span>
                            <span>₹{(Number(invoice.totalGst) || 0).toFixed(2)}</span>
                        </div>
                    )}
                    {(Number(invoice.depositAmount) || 0) > 0 && (
                        <div className="flex justify-between text-primary-dark font-bold">
                            <span>Deposit Deducted</span>
                            <span>- ₹{(Number(invoice.depositAmount) || 0).toFixed(2)}</span>
                        </div>
                    )}
                    {(Number(invoice.discountAmount) || 0) > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                            <span>Discount</span>
                            <span>- ₹{(Number(invoice.discountAmount) || 0).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center py-4 border-y-2 border-slate-900 mt-2">
                        <span className="font-black text-lg uppercase tracking-tight">Grand Total</span>
                        <span className="font-black text-2xl tracking-tighter">₹{(Number(invoice.grandTotal) || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-slate-400 mt-auto pt-8 border-t border-slate-200">
                <p className="font-bold text-slate-500 mb-1">Thank you for trusting Wellness Laboratory.</p>
                <p>All test results are subject to clinical correlation by your consulting physician.</p>
                <p>This is a computer generated invoice and does not require a signature.</p>
            </div>
        </div>
    );
}
