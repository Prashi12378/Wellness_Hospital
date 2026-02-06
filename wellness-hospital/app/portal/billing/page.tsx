'use client';

import { CreditCard, Download, ExternalLink, Receipt } from 'lucide-react';

export default function BillingPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Billing & Payments</h1>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-sm opacity-80 mb-1">Total Outstanding</p>
                        <h2 className="text-3xl font-bold mb-6">₹0.00</h2>
                        <div className="flex items-center gap-2 text-xs bg-white/10 w-fit px-2 py-1 rounded-full border border-white/20">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span> All accounts settled
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -right-8 -bottom-8 opacity-10">
                        <CreditCard className="w-48 h-48" />
                    </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Saved Payment Methods</h3>
                        <div className="flex items-center gap-3 p-3 border border-border rounded-xl bg-muted/30">
                            <div className="w-10 h-6 bg-slate-200 rounded shrink-0"></div>
                            <p className="text-sm font-medium">No saved cards found</p>
                        </div>
                    </div>
                    <button className="mt-4 text-primary text-sm font-bold flex items-center gap-2 hover:underline">
                        Add new method <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Receipt className="w-5 h-5" /> Recent Invoices
                    </h3>
                </div>
                <div className="p-12 text-center">
                    <p className="text-muted-foreground text-sm">No transaction history found in this account.</p>
                </div>
            </div>

            <div className="p-4 bg-muted border border-border rounded-xl text-center">
                <p className="text-xs text-muted-foreground">
                    For corporate billing or insurance claims assistance, contact our accounts department at
                    <span className="text-primary font-medium ml-1">accounts@wellnesshospital.com</span>
                </p>
            </div>
        </div>
    );
}
