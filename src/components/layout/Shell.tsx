"use client"

import React, { useEffect, useState } from "react"
import { TopNav } from "./TopNav"
import { Sidebar } from "./Sidebar"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"

export function Shell({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <div className="relative min-h-screen bg-background font-sans antialiased">
            <TopNav onSearchClick={() => setOpen(true)} onMenuClick={() => setSidebarOpen(true)} />
            <div className="flex">
                {/* Desktop sidebar */}
                <Sidebar />

                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-2xl lg:hidden animate-in slide-in-from-left duration-300 flex flex-col p-3 gap-0.5 pt-6">
                            <div className="flex items-center justify-between px-3 pb-4 mb-2 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded bg-primary overflow-hidden flex items-center justify-center">
                                        <img src="/logo.png" alt="VC Scout" className="h-full w-full object-cover" />
                                    </div>
                                    <span className="text-sm font-extrabold tracking-tight gradient-text">VC Scout</span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                                >
                                    ✕
                                </button>
                            </div>
                            <Sidebar mobile onNavigate={() => setSidebarOpen(false)} />
                        </aside>
                    </>
                )}

                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 min-h-[calc(100vh-4rem)] w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
            <Toaster position="top-center" />

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Navigation">
                        <CommandItem onSelect={() => { router.push("/companies"); setOpen(false) }}>Discovery</CommandItem>
                        <CommandItem onSelect={() => { router.push("/pipeline"); setOpen(false) }}>Pipeline Board</CommandItem>
                        <CommandItem onSelect={() => { router.push("/lists"); setOpen(false) }}>Collections</CommandItem>
                        <CommandItem onSelect={() => { router.push("/saved"); setOpen(false) }}>Saved Views</CommandItem>
                        <CommandItem onSelect={() => { router.push("/compare"); setOpen(false) }}>Compare Companies</CommandItem>
                        <CommandItem onSelect={() => { router.push("/activity"); setOpen(false) }}>Analytics</CommandItem>
                        <CommandItem onSelect={() => { router.push("/settings/thesis"); setOpen(false) }}>Thesis Config</CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </div>
    )
}
