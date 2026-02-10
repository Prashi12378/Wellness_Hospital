'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Percent, Loader2, CheckCircle2 } from 'lucide-react';
import { getPharmacySettings, updatePharmacySettings } from '@/app/actions/settings';

export default function SettingsPage() {
    const [gstRate, setGstRate] = useState<number>(5);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const result = await getPharmacySettings();
        if (result.success && result.settings) {
            setGstRate(result.settings.defaultGstRate);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        const result = await updatePharmacySettings({ defaultGstRate: gstRate });

        if (result.success) {
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to update settings' });
        }

        setSaving(false);

        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-primary" />
                    System Settings
                </h1>
                <p className="text-slate-500 text-sm">Manage global configurations for all Wellness Hospital portals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Navigation Sidebar for Settings Sections (Optional enhancement) */}
                <div className="space-y-1">
                    <button className="w-full text-left px-4 py-3 rounded-lg bg-primary/10 text-primary font-bold text-sm border border-primary/20">
                        Pharmacy Configuration
                    </button>
                    <button disabled className="w-full text-left px-4 py-3 rounded-lg text-slate-400 font-medium text-sm hover:bg-slate-50 transition-colors opacity-50 cursor-not-allowed">
                        General Settings
                    </button>
                    <button disabled className="w-full text-left px-4 py-3 rounded-lg text-slate-400 font-medium text-sm hover:bg-slate-50 transition-colors opacity-50 cursor-not-allowed">
                        User Roles & Permissions
                    </button>
                </div>

                {/* Main Settings Form */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800">Pharmacy Billing Settings</h3>
                            <p className="text-xs text-slate-500">Configure tax rates and default values for the pharmacy module.</p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* GST Rate Setting */}
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            Default GST Rate
                                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded uppercase font-black">Live Update</span>
                                        </label>
                                        <p className="text-xs text-slate-500 max-w-sm">
                                            This rate will be applied to all items in the pharmacy billing counter that do not have a specific GST rate defined in inventory.
                                        </p>
                                    </div>
                                    <div className="relative w-32">
                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                            <Percent className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="number"
                                            value={gstRate}
                                            onChange={(e) => setGstRate(Number(e.target.value))}
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-slate-800"
                                            placeholder="5"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                                    <div className="p-1 rounded-full bg-amber-100 text-amber-600 shrink-0">
                                        <Settings className="w-4 h-4" />
                                    </div>
                                    <p className="text-xs text-amber-800 leading-relaxed">
                                        <strong>Note:</strong> Changes to the default GST rate will affect all new invoices. Existing invoices will maintain the rate they were generated with.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                {message && (
                                    <div className={`flex items-center gap-2 text-sm font-bold ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {message.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                                        {message.text}
                                    </div>
                                )}
                                <div className="ml-auto">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
