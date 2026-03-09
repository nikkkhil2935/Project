"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Target, Zap, Server, Shield, Layers, Code, Globe, LineChart, BrainCircuit, Database, Workflow, Search } from "lucide-react";
import { HeroScrollDemo } from "@/components/hero-scroll-demo";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-primary/10 via-background to-transparent -z-10" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px] -z-10 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[150px] -z-10 animate-pulse" style={{ animationDuration: '12s' }} />

      {/* Navbar */}
      <header className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center gap-3 group cursor-pointer">
          {/* Smooth Logo */}
          <div className="relative h-10 w-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur transition-all group-hover:bg-primary/40 group-hover:blur-md" />
            <div className="relative h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-950 dark:from-zinc-100 dark:to-zinc-300 rounded-xl flex items-center justify-center border border-border shadow-xl overflow-hidden transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
              <Zap className="h-5 w-5 text-zinc-100 dark:text-zinc-900 fill-zinc-100 dark:fill-zinc-900" />
            </div>
          </div>
          <span className="text-2xl font-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            VC Scout
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/login" className="px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2 relative overflow-hidden group">
            <span className="relative z-10 flex items-center gap-2">Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20 mb-8 backdrop-blur-sm"
        >
          <BrainCircuit className="h-4 w-4" />
          Powered by Gemini 1.5 Pro & Next.js
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-heading font-black tracking-tighter max-w-5xl leading-[1.05] mb-8"
        >
          An AI-Native Platform for <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
            Automated Deal Sourcing
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
        >
          VC Scout is a full-stack intelligence engine. It automates top-of-funnel venture capital sourcing by crawling company websites, synthesizing core products using LLMs, and scoring them against a quantifiable investment thesis.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          <Link href="/login" className="px-8 py-4 text-lg font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 flex items-center justify-center gap-2 group">
            Launch Platform <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <a href="#platform-architecture" className="px-8 py-4 text-lg font-bold bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-all flex items-center justify-center hover:-translate-y-1">
            View Architecture
          </a>
        </motion.div>

        {/* Scroll Demo Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="w-full relative max-w-[100vw] overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8"
        >
          <HeroScrollDemo />
        </motion.div>
      </main>

      {/* Deep Dive: The Project Workflow */}
      <section id="platform-architecture" className="py-24 px-4 bg-background relative border-t border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-4">The VC Scout Engine</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              How the platform replaces hours of manual research with seconds of automated computation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[45px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-blue-500/20 via-purple-500/50 to-amber-500/20 z-0" />

            {[
              {
                step: "01",
                title: "URL Ingestion",
                desc: "Input a startup's web address into the platform. VC Scout immediately initiates a background job to process the target.",
                icon: Globe,
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                step: "02",
                title: "Deep Text Extraction",
                desc: "A server-side crawler navigates through the homepage, 'About Us', and product pages, stripping noise to extract pure contextual text.",
                icon: Search,
                color: "text-indigo-500",
                bg: "bg-indigo-500/10"
              },
              {
                step: "03",
                title: "LLM Synthesis",
                desc: "Google's Gemini 1.5 Pro analyzes the extracted data to identify the true product offering, target market, and underlying technology.",
                icon: BrainCircuit,
                color: "text-purple-500",
                bg: "bg-purple-500/10"
              },
              {
                step: "04",
                title: "Thesis Qualification",
                desc: "The synthesized data is cross-referenced against your configured investment thesis (B2B SaaS, AI, etc.) generating a 0-100 Match Score.",
                icon: Target,
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              }
            ].map((step, i) => (
              <div key={i} className="relative z-10 bg-background/80 backdrop-blur-sm p-6 rounded-2xl border border-border/50 shadow-sm flex flex-col items-center text-center">
                <div className={`h-16 w-16 ${step.bg} ${step.color} rounded-2xl flex items-center justify-center mb-6 border border-background shadow-md transform rotate-3`}>
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="text-sm font-bold text-muted-foreground mb-2 tracking-widest uppercase">Phase {step.step}</div>
                <h3 className="text-xl font-heading font-black mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Architecture & Tech Stack Details */}
      <section className="py-24 px-4 relative overflow-hidden bg-zinc-950 dark:bg-zinc-900 border-y border-zinc-800 text-zinc-100">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-widest border border-zinc-700">
                <Database className="h-4 w-4" />
                System Architecture
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight leading-tight">
                Built on a modern,<br />
                <span className="text-primary">high-performance stack.</span>
              </h2>
              <p className="text-xl text-zinc-400 leading-relaxed">
                VC Scout is engineered for speed, privacy, and seamless user experience. All components are tightly coupled to provide real-time feedback and state management.
              </p>

              <div className="space-y-6 pt-4">
                {[
                  { title: "Next.js 14 App Router", desc: "Leveraging Server Components and Server Actions to securely process data without exposing API keys to the client." },
                  { title: "Supabase Backend-as-a-Service", desc: "Providing robust PostgreSQL database management, Row Level Security (RLS), and seamless Google authentication." },
                  { title: "Gemini AI Engine", desc: "Utilizing advanced prompt engineering to coerce unstructured HTML blob data into structured JSON intelligence reports." },
                  { title: "Tailwind & shadcn/ui", desc: "A rigorously defined design system allowing for rapid prototyping and completely accessible, consistent UI components." }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 items-start border-l-2 border-zinc-800 pl-4 hover:border-primary transition-colors duration-300">
                    <div>
                      <h4 className="text-lg font-bold font-heading text-zinc-100">{feature.title}</h4>
                      <p className="text-zinc-400 text-sm mt-1">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack Visual Box */}
            <div className="relative aspect-square rounded-3xl bg-zinc-900/50 border border-zinc-800/80 p-6 md:p-12 overflow-hidden shadow-2xl flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />
              <div className="grid grid-cols-2 gap-4 w-full h-full relative z-10">
                {/* Box 1 */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center items-center gap-4 hover:scale-105 transition-transform duration-300 shadow-xl">
                  <Layers className="w-12 h-12 text-zinc-400" />
                  <span className="font-heading font-bold text-zinc-300">Frontend UI</span>
                </div>
                {/* Box 2 */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center items-center gap-4 hover:scale-105 transition-transform duration-300 shadow-xl">
                  <Database className="w-12 h-12 text-green-500" />
                  <span className="font-heading font-bold text-zinc-300">Supabase DB</span>
                </div>
                {/* Box 3 */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center items-center gap-4 hover:scale-105 transition-transform duration-300 shadow-xl">
                  <Server className="w-12 h-12 text-blue-500" />
                  <span className="font-heading font-bold text-zinc-300">Next.js Server</span>
                </div>
                {/* Box 4 */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center items-center gap-4 hover:scale-105 transition-transform duration-300 shadow-xl">
                  <BrainCircuit className="w-12 h-12 text-purple-500" />
                  <span className="font-heading font-bold text-zinc-300">Gemini LLM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Interface Features Grid */}
      <section id="features" className="py-24 px-4 bg-muted/30 relative border-t border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-6">Platform Interface Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Designed explicitly to remove friction from the venture capital data management process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-background p-8 rounded-[2rem] border border-border/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3">Custom Thesis Weights</h3>
              <p className="text-muted-foreground leading-relaxed">
                The scoring algorithm isn't locked. Tweak the importance of B2B, Revenue Stage, or AI buzzwords to instantly recalculate match scores across your entire pipeline.
              </p>
            </div>

            <div className="group bg-background p-8 rounded-[2rem] border border-border/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                <Workflow className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3">Interactive Kanban CRM</h3>
              <p className="text-muted-foreground leading-relaxed">
                No more massive spreadsheets. Manage deal flow visually. Drag cards from 'Discovery' to 'Due Diligence' with fully persistent database syncing.
              </p>
            </div>

            <div className="group bg-background p-8 rounded-[2rem] border border-border/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3">Row Level Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your deal pipeline is highly confidential. All companies and thesis settings are strictly isolated to your authenticated Supabase user ID.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-4 text-center border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent -z-10" />
        <h2 className="text-5xl md:text-6xl font-heading font-black tracking-tight mb-8">Deploy VC Scout</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          Experience the technical capability of automated AI deal sourcing and seamless Next.js performance.
        </p>
        <Link href="/login" className="inline-flex px-10 py-5 text-xl font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 items-center justify-center gap-3">
          Access Platform <ArrowRight className="h-6 w-6" />
        </Link>
      </section>

      {/* Actual Footer */}
      <footer className="py-12 text-center text-sm border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-heading font-bold text-foreground text-base">VC Scout Project</span>
            </div>
            <span className="text-muted-foreground">Built to modernize the Venture Capital tech stack.</span>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">© {new Date().getFullYear()} Precision AI Scout. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
