'use client';

import { useState, useEffect } from 'react';
import { TestTube, Info, Download, Clock, FileText, CheckCircle2 } from 'lucide-react';

export default function LabReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/reports');
                if (res.ok) {
                    const data = await res.json();
                    setReports(data);
                }
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Lab Reports</h1>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 shadow-sm">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-semibold">Processing Notice</p>
                    <p>Current turnaround time for blood work is 24-48 hours. COVID-19 and RT-PCR results are typically available within 6 hours.</p>
                </div>
            </div>

            {reports.length > 0 ? (
                <div className="grid gap-4">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 shrink-0 border border-purple-100">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground">{report.test_name}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            Status:
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${report.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {report.status}
                                            </span>
                                        </p>
                                        <div className="mt-3 flex gap-2">
                                            <button className="text-xs bg-primary text-white px-3 py-1.5 rounded flex items-center gap-1 font-bold hover:bg-primary/90 transition-all">
                                                <Download className="w-3 h-3" /> Download PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Tested On</p>
                                    <p className="text-sm font-bold text-foreground">{report.report_date}</p>
                                    <div className="mt-2 p-2 bg-muted/30 rounded border border-border max-w-[200px] md:ml-auto">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">Quick Summary</p>
                                        <p className="text-xs text-foreground font-medium truncate">{report.result_summary || 'Normal results observed'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-100">
                            <TestTube className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">No reports found</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                            Once you visit our pathology lab or use our home collection service, your digital reports will be uploaded here instantly.
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> How to read your report
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs shrink-0 border border-green-200">1</div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Reference Range</p>
                            <p className="text-xs text-muted-foreground mt-1">Check the "Normal range" column to see where your values fall.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs shrink-0 border border-blue-200">2</div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Flag Indicators</p>
                            <p className="text-xs text-muted-foreground mt-1">High (H) or Low (L) values will be clearly marked for quick identification.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
