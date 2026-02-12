'use client';

import { X, CheckCircle, Info, Stethoscope, Activity, ShieldCheck, Droplets, Zap, Eye, Pill, ShieldAlert } from 'lucide-react';

const testDescriptions: Record<string, string> = {
    'CBC Test': 'Complete Blood Count measures different components of your blood. It helps detect anemia, infections, and various other disorders.',
    'CBC': 'Complete Blood Count measures different components of your blood. It helps detect anemia, infections, and various other disorders.',
    'Thyroid Profile': 'Assesses your thyroid gland function (T3, T4, TSH). Essential for metabolism, energy levels, and mood regulation.',
    'Thyroid Profile (Total T3, Total T4 & TSH Ultra-sensitive)': 'Comprehensive assessment of thyroid function, regulating metabolism and energy levels.',
    'Vitamin D Test': 'Measures the level of Vitamin D in your blood. Essential for bone health, immune function, and overall vitality.',
    'Vitamin D': 'Measures the level of Vitamin D in your blood. Essential for bone health, immune function, and overall vitality.',
    'Calcium Test': 'Checks the level of calcium in your blood. Important for healthy bones, teeth, nerves, and heart function.',
    'Calcium': 'Checks the level of calcium in your blood. Important for healthy bones, teeth, nerves, and heart function.',
    'Gynecologist Consultation': 'A specialized consultation with a doctor focusing on women\'s reproductive wellness and preventive care.',
    'Diabetes Screening': 'Includes blood sugar tests to screen for pre-diabetes and monitoring for diabetes management.',
    'Fasting Blood Sugar': 'Measures blood glucose after an overnight fast. Primary screening for diabetes and insulin resistance.',
    'HbA1c': 'Measures your average blood sugar levels over the past 3 months. Gold standard for long-term diabetes monitoring.',
    'Lipid Profile': 'Measures cholesterol and triglyceride levels to assess your cardiovascular health and heart disease risk.',
    'Kidney Function Test (KFT)': 'Group of tests that measure how well your kidneys are filtering waste from your blood.',
    'Liver Function Test (LFT)': 'Measures enzymes and proteins in your blood to evaluate your liver health and function.',
    'Iron Profile': 'Assesses iron levels and storage in the body, crucial for oxygen transport and energy production.',
    'Urine Routine & Microscopy': 'Standard screening for kidney health, urinary tract infections, and various metabolic conditions.',
    'Urine Test': 'Standard screening for kidney health, urinary tract infections, and various metabolic conditions.',
    'Blood Sugar': 'Measures the concentration of glucose in your blood to screen for diabetes and insulin resistance.',
    'Vitamin B12': 'Measures B12 levels, essential for nerve function, brain health, and red blood cell production.',
    'B12': 'Measures B12 levels, essential for nerve function, brain health, and red blood cell production.'
};

const getIcon = (testName: string) => {
    const name = testName.toLowerCase();
    if (name.includes('consultation')) return Stethoscope;
    if (name.includes('sugar') || name.includes('diabetes') || name.includes('hba1c')) return Zap;
    if (name.includes('heart') || name.includes('lipid')) return Activity;
    if (name.includes('thyroid')) return ShieldCheck;
    if (name.includes('blood') || name.includes('cbc') || name.includes('iron')) return Droplets;
    if (name.includes('eye')) return Eye;
    if (name.includes('vitamin') || name.includes('calcium')) return Pill;
    return Info;
};

interface PackageDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    packageName: string;
    tests: string[];
}

export default function PackageDetailsModal({ isOpen, onClose, packageName, tests }: PackageDetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-card w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] border border-border shadow-2xl overflow-hidden animate-fade-in-up flex flex-col">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-border bg-muted/30 sticky top-0 z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground leading-none mb-2">{packageName}</h2>
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">{tests.length} Parameters Included</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-primary/10">
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Detailed Inclusions</h3>

                        <div className="grid gap-4">
                            {tests.map((test, index) => {
                                const Icon = getIcon(test);
                                const description = testDescriptions[test] || testDescriptions[test.split('(')[0].trim()] || 'Standard clinical assessment included as part of your comprehensive health checkup.';

                                return (
                                    <div
                                        key={index}
                                        className="group p-5 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all duration-300"
                                    >
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <h4 className="font-bold text-foreground text-lg leading-tight">{test}</h4>
                                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                </div>
                                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                    {description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pre-test Instructions */}
                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 space-y-3">
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-wider">
                            <ShieldAlert className="w-4 h-4" /> Pre-Test Instructions
                        </div>
                        <p className="text-xs text-amber-700/80 font-semibold leading-relaxed">
                            For accurate results, 10-12 hours of overnight fasting is mandatory. You may drink plain water. Please avoid any caffeine or medication unless advised by your doctor.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 md:p-8 border-t border-border bg-muted/30 flex items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground font-bold">
                        Need help understanding these tests?
                    </p>
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
