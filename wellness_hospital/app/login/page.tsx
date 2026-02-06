'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid email or password");
                setLoading(false);
            } else {
                router.push('/portal');
                router.refresh();
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background">
            {/* Left Side - Hero/Image */}
            <div className="hidden md:flex flex-col justify-between w-1/2 lg:w-[45%] bg-primary relative overflow-hidden p-12 text-primary-foreground">
                <div className="z-10">
                    <div className="flex items-center gap-4 mb-12">
                        <Image src="/logo.png" alt="Wellness Hospital Logo" width={48} height={48} className="w-12 h-12 brightness-0 invert" />
                        <div className="font-bold text-3xl tracking-tight">Wellness Hospital</div>
                    </div>
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Your Health, <br />
                        <span className="text-secondary">Our Priority.</span>
                    </h1>
                    <p className="text-primary-foreground/90 text-lg max-w-md">
                        Access your medical records, appointments, and lab reports securely from anywhere.
                    </p>
                </div>
                <div className="z-10 text-sm text-primary-foreground/80">
                    © 2026 Wellness Hospital. All rights reserved.
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
                <Link
                    href="/"
                    className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <div className="md:hidden flex justify-center mb-6">
                            <Image src="/logo.png" alt="Logo" width={64} height={64} className="h-16 w-auto" />
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
                        <p className="text-muted-foreground mt-2">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-input rounded-xl outline-none focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground placeholder:text-muted-foreground"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 bg-muted/50 border border-input rounded-xl outline-none focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground placeholder:text-muted-foreground"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                                <span className="text-sm text-muted-foreground">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-semibold text-primary hover:underline">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Sign in <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-muted-foreground">
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-bold text-primary hover:underline">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
