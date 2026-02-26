"use client"

import React, { useEffect } from "react"
import { TopNav } from "./TopNav"
import { Sidebar } from "./Sidebar"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"

export function Shell({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
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
            <TopNav onSearchClick={() => setOpen(true)} />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 min-h-[calc(100vh-4rem)]">
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
