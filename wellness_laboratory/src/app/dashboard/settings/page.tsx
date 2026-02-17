"use client";

import { useState, useEffect } from "react";
import {
    Settings,
    User as UserIcon,
    FlaskConical,
    Shield,
    Save,
    Bell,
    Globe,
    Lock,
    UserCircle,
    Building,
    Loader2,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { updateUserProfile } from "@/app/actions/lab";

export default function LabConfigurationPage() {
    const { data: session, update } = useSession();
    const [activeTab, setActiveTab] = useState("profile");

    // Profile State
    const [userName, setUserName] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (session?.user?.name) {
            setUserName(session.user.name);
        }
    }, [session]);

    const handleUpdateProfile = async () => {
        const userId = (session?.user as any)?.id;
        if (!userId || !userName.trim()) return;

        setIsSavingProfile(true);
        const res = await updateUserProfile(userId, { name: userName });
        if (res.success) {
            setSaveSuccess(true);
            await update({ name: userName }); // Update local session
            setTimeout(() => setSaveSuccess(false), 3000);
        }
        setIsSavingProfile(false);
    };

    const tabs = [
        { id: "profile", label: "Diagnostic Profile", icon: UserCircle },
        { id: "lab", label: "Laboratory Defaults", icon: FlaskConical },
        { id: "security", label: "Security & access", icon: Shield },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Lab Configuration</h1>
                <p className="text-slate-500 font-medium">Manage your laboratory identity and system preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Tabs Sidebar */}
                <div className="lg:w-72 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black uppercase text-[11px] tracking-widest",
                                    activeTab === tab.id
                                        ? "bg-primary text-white shadow-xl shadow-primary/20"
                                        : "bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-100 shadow-sm"
                                )}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 min-h-[600px]">
                        {activeTab === "profile" && (
                            <div className="space-y-10">
                                <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
                                    <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-400 border border-slate-200">
                                        <UserIcon className="w-12 h-12" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase">Profile Identity</h3>
                                        <p className="text-slate-400 font-medium">Personal diagnostic credentials</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={session?.user?.email || "lab@hospital.com"}
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-500 font-bold focus:outline-none cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value="Clinical Diagnostics"
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-500 font-bold focus:outline-none cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Portal Role</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value="Lab Technologist"
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-500 font-bold focus:outline-none cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50 flex justify-end items-center gap-4">
                                    {saveSuccess && (
                                        <span className="text-xs font-black text-emerald-500 uppercase flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                            <Check className="w-4 h-4" />
                                            Update Successful
                                        </span>
                                    )}
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={isSavingProfile || !userName.trim() || userName === session?.user?.name}
                                        className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Update Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "lab" && (
                            <div className="space-y-10">
                                <div className="pb-8 border-b border-slate-50">
                                    <h3 className="text-xl font-black text-slate-900 uppercase">Laboratory Defaults</h3>
                                    <p className="text-slate-400 font-medium">Standard parameters for diagnostic reports</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Technician</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. NAVEENA"
                                                defaultValue="NAVEENA"
                                                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Consultant</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Dr. Somashekar K."
                                                defaultValue="Dr. Somashekar K."
                                                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-8 bg-blue-50/50 rounded-[32px] border border-blue-100 flex items-start gap-4">
                                        <FlaskConical className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase mb-1">Standard Processing Time</p>
                                            <p className="text-xs text-slate-500 font-medium">System defaults to 24-hour turnaround for non-urgent diagnostics. Manual priority overrides are available per accession.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50 flex justify-end">
                                    <button className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        <Save className="w-4 h-4" />
                                        Save Parameters
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="space-y-10 text-center py-20">
                                <div className="w-20 h-20 bg-amber-50 rounded-[32px] flex items-center justify-center text-amber-500 mx-auto mb-6">
                                    <Shield className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase">Access Control</h3>
                                    <p className="text-slate-400 font-medium">Manage clinical data integrity and authentication</p>
                                </div>
                                <button className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">
                                    Privacy Settings
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
