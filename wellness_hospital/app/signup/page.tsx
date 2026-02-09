'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, XCircle } from 'lucide-react';

export default function SignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotification(null);

        // Password Complexity Validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setNotification({
                type: 'error',
                message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setNotification({ type: 'error', message: "Passwords do not match" });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setNotification({ type: 'success', message: "Account created! Redirecting to login..." });

            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (error: any) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/30">
            {/* Toast Notification */}
            {notification && (
                <div className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 z-50 ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <p className="font-medium text-sm max-w-xs">{notification.message}</p>
                </div>
            )}

            <div className="bg-card p-8 rounded-xl shadow-lg w-full max-w-md border border-border">
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-2">
                        <Image
                            src="/logo-final.png"
                            alt="Wellness Hospital Logo"
                            width={40}
                            height={40}
                            className="w-10 h-10"
                        />
                        <h1 className="text-2xl font-bold text-primary">Wellness Hospital</h1>
                    </div>
                    <p className="text-muted-foreground">Create your patient account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Must include uppercase, lowercase, number, and special char.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background text-foreground placeholder:text-muted-foreground"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
