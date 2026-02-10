import { Users, Stethoscope, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { prisma } from "@/lib/db";
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
    // Fetch real-time stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [doctorCount, staffCount, inventoryAlerts, ledgerAgg] = await Promise.all([
        prisma.profile.count({ where: { role: 'doctor' } }),
        prisma.profile.count({ where: { role: 'staff' } }),
        prisma.pharmacyInventory.count({ where: { stock: { lt: 10 } } }),
        prisma.ledger.aggregate({
            where: {
                transactionDate: {
                    gte: today
                }
            },
            _sum: {
                amount: true
            }
        })
    ]);

    // For a more accurate "Net" daily balance, we'd need separate sums for income/expense
    // but the schema uses transactionType string. Let's fetch the actual items for today.
    const todayTransactions = await prisma.ledger.findMany({
        where: {
            transactionDate: {
                gte: today
            }
        }
    });

    const dailyIncome = todayTransactions
        .filter(t => t.transactionType === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    const dailyExpense = todayTransactions
        .filter(t => t.transactionType === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    const dailyNet = dailyIncome - dailyExpense;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome back, Administrator. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                            <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Doctors</p>
                            <h3 className="text-2xl font-bold">{doctorCount}</h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                            <h3 className="text-2xl font-bold">{staffCount}</h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Daily Ledger</p>
                            <h3 className={cn(
                                "text-2xl font-bold",
                                dailyNet >= 0 ? "text-emerald-600" : "text-red-600"
                            )}>
                                {dailyNet >= 0 ? '+' : ''}₹{dailyNet.toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                            <h3 className="text-2xl font-bold">{inventoryAlerts}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity or Quick Actions - Placeholder */}
            <div className="grid gap-8 md:grid-cols-2">
                <div className="p-6 rounded-xl border border-border bg-card">
                    <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/dashboard/staff" className="p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left">
                            <span className="font-semibold block">Add New Staff</span>
                            <span className="text-xs text-muted-foreground">Create staff account</span>
                        </Link>
                        <Link href="/dashboard/ledger" className="p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left">
                            <span className="font-semibold block">Record Transaction</span>
                            <span className="text-xs text-muted-foreground">Add to ledger</span>
                        </Link>
                    </div>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card">
                    <h2 className="text-lg font-semibold mb-4">System Status</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Database Connection</span>
                            <span className="text-green-600 font-medium">Healthy</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">API Latency</span>
                            <span className="text-foreground font-medium">45ms</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last Backup</span>
                            <span className="text-foreground font-medium">2 hours ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
