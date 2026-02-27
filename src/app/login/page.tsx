"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Mail, Lock, ArrowRight, Loader2, Target } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(true)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                setSuccess("Account created! Check your email to verify, or sign in directly.")
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push("/")
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        try {
            setGoogleLoading(true)
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })
            if (error) throw error
        } catch (err: any) {
            setError(err.message || "Failed to sign in with Google")
            setGoogleLoading(false)
        }
        // Redirect is handled by Supabase OAuth redirection
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background font-sans">
            {/* Left side - Branding/Hero (Desktop only) */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden md:flex md:w-1/2 bg-muted/40 border-r border-border/60 items-center justify-center p-12 relative overflow-hidden"
            >
                {/* Smooth masking background effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.03)_-1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                        className="h-16 w-16 rounded-2xl bg-primary overflow-hidden flex items-center justify-center mb-8 shadow-xl"
                    >
                        <img src="/logo.png" alt="VC Scout" className="h-full w-full object-cover" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 text-foreground"
                    >
                        Deal Sourcing, <span className="text-muted-foreground block mt-2">Elevated by AI.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="text-lg text-muted-foreground/90 leading-relaxed mb-12 font-medium"
                    >
                        VC Scout combines automated enrichment, pipeline management, and intelligent thesis matching into a single, cohesive workflow for modern venture capital teams.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="grid grid-cols-2 gap-8 text-sm text-muted-foreground font-medium"
                    >
                        <div className="flex flex-col gap-2">
                            <span className="text-foreground font-bold text-3xl">10x</span>
                            Faster diligence
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-foreground font-bold text-3xl">AI</span>
                            Automated enrichment
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right side - Auth Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-background overflow-hidden">
                {/* Subtle ambient blur behind form */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    className="w-full max-w-[420px] relative z-10"
                >
                    <div className="md:hidden flex items-center gap-3 mb-10">
                        <div className="h-10 w-10 rounded-xl bg-primary overflow-hidden flex items-center justify-center shadow-lg">
                            <img src="/logo.png" alt="VC Scout" className="h-full w-full object-cover" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">VC Scout</span>
                    </div>

                    <div className="mb-8 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isSignUp ? 'signup' : 'signin'}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
                                    {isSignUp ? 'Create an account' : 'Welcome back'}
                                </h2>
                                <p className="text-sm text-muted-foreground font-medium">
                                    {isSignUp ? 'Enter your details below to get started.' : 'Enter your credentials to access your workspace.'}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={googleLoading || loading}
                        className="w-full h-12 bg-card hover:bg-muted border border-border/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-all mb-6 disabled:opacity-50 text-foreground overflow-hidden relative group"
                    >
                        {googleLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <svg className="w-5 h-5 z-10" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                <path d="M1 1h22v22H1z" fill="none" />
                            </svg>
                        )}
                        <span className="z-10 relative">Continue with Google</span>
                    </motion.button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/80" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-3 text-muted-foreground font-bold tracking-wider">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                    className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold origin-top overflow-hidden"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                    className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold origin-top overflow-hidden"
                                >
                                    {success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground">
                                Work Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-border/80 bg-card text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground">
                                Password
                            </label>
                            <div className="relative group overflow-hidden rounded-xl">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                                <AnimatePresence mode="wait">
                                    <motion.input
                                        key={isSignUp ? 'signup-pass' : 'signin-pass'}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.15 }}
                                        type="password"
                                        placeholder={isSignUp ? "Create a password (min 6 chars)" : "Enter your password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-border/80 bg-card text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] absolute inset-0"
                                    />
                                </AnimatePresence>
                                <div className="h-12 w-full invisible">placeholder</div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full h-12 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2 shadow-lg relative overflow-hidden group"
                        >
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div key="loading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="text" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center">
                                        {isSignUp ? 'Create account' : 'Sign in'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground mt-8 font-medium h-8 flex items-center justify-center gap-1">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isSignUp ? 'text-signup' : 'text-signin'}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                            >
                                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                            </motion.span>
                        </AnimatePresence>
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null) }}
                            className="font-bold text-foreground hover:underline decoration-primary/50 underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={isSignUp ? 'btn-signup' : 'btn-signin'}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.15 }}
                                    className="inline-block"
                                >
                                    {isSignUp ? "Sign in" : "Sign up"}
                                </motion.span>
                            </AnimatePresence>
                        </button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground/80 mt-6 font-medium">
                        By signing in, you agree to our <a href="#" className="underline decoration-muted-foreground/30 underline-offset-4 hover:text-foreground transition-colors">Terms of Service</a> and <a href="#" className="underline decoration-muted-foreground/30 underline-offset-4 hover:text-foreground transition-colors">Privacy Policy</a>.
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
