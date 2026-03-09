"use client"

import { useState, useMemo } from "react"
import { Search, Building2, ListTodo, Target, Sparkles, Plus, Globe, AlertTriangle, Bookmark, LogOut, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/lib/store/useCompanyStore"
import { useAuth } from "@/components/auth/AuthProvider"
import { toast } from "sonner"

interface TopNavProps {
    onSearchClick: () => void
    onMenuClick?: () => void
}

export function TopNav({ onSearchClick, onMenuClick }: TopNavProps) {
    const pathname = usePathname()
    const addCompany = useCompanyStore((state) => state.addCompany)
    const companies = useCompanyStore((state) => state.companies)
    const { user, signOut } = useAuth()
    const [open, setOpen] = useState(false)

    const [newCompany, setNewCompany] = useState({
        name: "",
        website: "",
        description: "",
        sector: "Enterprise SaaS",
        stage: "Seed" as const,
        geography: "San Francisco",
    })

    const navItems = [
        { name: "Companies", href: "/companies", icon: Building2 },
        { name: "My Lists", href: "/lists", icon: ListTodo },
        { name: "Saved Views", href: "/saved", icon: Bookmark },
        { name: "Thesis", href: "/settings/thesis", icon: Target },
    ]

    // Duplicate detection
    const duplicateWarning = useMemo(() => {
        if (!newCompany.website.trim()) return null
        try {
            const inputDomain = new URL(newCompany.website.startsWith('http') ? newCompany.website : `https://${newCompany.website}`).hostname.replace('www.', '')
            const existing = companies.find(c => {
                try {
                    return new URL(c.website).hostname.replace('www.', '') === inputDomain
                } catch { return false }
            })
            return existing || null
        } catch { return null }
    }, [newCompany.website, companies])

    const handleAddCompany = () => {
        if (!newCompany.name.trim() || !newCompany.website.trim()) {
            toast.error("Name and website are required")
            return
        }

        const websiteUrl = newCompany.website.startsWith("http")
            ? newCompany.website
            : `https://${newCompany.website}`

        addCompany({
            id: Date.now().toString(),
            name: newCompany.name.trim(),
            website: websiteUrl,
            description: newCompany.description.trim() || `${newCompany.name.trim()} — newly added company.`,
            sector: newCompany.sector,
            stage: newCompany.stage,
            geography: newCompany.geography,
            tags: [],
            derivedSignals: [],
        })

        toast.success(`${newCompany.name.trim()} added to pipeline`)
        setNewCompany({ name: "", website: "", description: "", sector: "Enterprise SaaS", stage: "Seed", geography: "San Francisco" })
        setOpen(false)
    }

    const userInitial = user?.email?.charAt(0).toUpperCase() || 'U'

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 lg:gap-8">
                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-9 w-9"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-primary overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110">
                            <img src="/logo.png" alt="VC Scout" className="h-full w-full object-cover" />
                        </div>
                        <span className="text-xl font-bold tracking-tight gradient-text hidden sm:inline-block">
                            VC Scout
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                                    pathname === item.href || (item.href === "/companies" && pathname.startsWith("/companies"))
                                        ? "bg-secondary text-secondary-foreground"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        variant="outline"
                        className="relative h-9 w-9 p-0 xl:w-60 xl:justify-start xl:px-3 xl:py-2 rounded-full hidden sm:flex"
                        onClick={onSearchClick}
                    >
                        <Search className="h-4 w-4 xl:mr-2" />
                        <span className="hidden xl:inline-flex text-muted-foreground font-normal">Search or cmd + k...</span>
                        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </Button>

                    <ThemeToggle />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="rounded-full gap-2 shadow-lg shadow-primary/20 bg-primary hover:opacity-90 transition-opacity">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Add Company</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg rounded-3xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Add New Company
                                </DialogTitle>
                                <DialogDescription>Add a company to your discovery pipeline. You can enrich it with AI later.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label>Company Name *</Label>
                                    <Input
                                        placeholder="e.g. Stripe"
                                        value={newCompany.name}
                                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                        className="rounded-xl h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Website URL *</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="e.g. stripe.com"
                                            value={newCompany.website}
                                            onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                                            className="rounded-xl h-11 pl-10"
                                        />
                                    </div>
                                    {duplicateWarning && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-medium">
                                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                            <span>Possible duplicate: <strong>{duplicateWarning.name}</strong> already uses this domain.</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        placeholder="Brief description of what they do"
                                        value={newCompany.description}
                                        onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                                        className="rounded-xl h-11"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Sector</Label>
                                        <Select value={newCompany.sector} onValueChange={(v) => setNewCompany({ ...newCompany, sector: v })}>
                                            <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Enterprise SaaS">Enterprise SaaS</SelectItem>
                                                <SelectItem value="Developer Tools">Developer Tools</SelectItem>
                                                <SelectItem value="AI/ML">AI/ML</SelectItem>
                                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                                <SelectItem value="Fintech">Fintech</SelectItem>
                                                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                                <SelectItem value="Consumer">Consumer</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Stage</Label>
                                        <Select value={newCompany.stage} onValueChange={(v: any) => setNewCompany({ ...newCompany, stage: v })}>
                                            <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                                                <SelectItem value="Seed">Seed</SelectItem>
                                                <SelectItem value="Series A">Series A</SelectItem>
                                                <SelectItem value="Series B">Series B</SelectItem>
                                                <SelectItem value="Series C+">Series C+</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Geography</Label>
                                    <Select value={newCompany.geography} onValueChange={(v) => setNewCompany({ ...newCompany, geography: v })}>
                                        <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="San Francisco">San Francisco</SelectItem>
                                            <SelectItem value="New York">New York</SelectItem>
                                            <SelectItem value="United States">United States</SelectItem>
                                            <SelectItem value="Remote">Remote</SelectItem>
                                            <SelectItem value="London">London</SelectItem>
                                            <SelectItem value="Berlin">Berlin</SelectItem>
                                            <SelectItem value="Bangalore">Bangalore</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full rounded-full h-12 font-bold shadow-lg shadow-primary/20 mt-2" onClick={handleAddCompany}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add to Pipeline
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* User profile dropdown */}
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="rounded-full h-9 w-9 p-0 bg-primary/10 hover:bg-primary/20 transition-colors">
                                    <span className="text-sm font-bold text-primary">{userInitial}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                <div className="px-3 py-2">
                                    <p className="text-sm font-bold truncate">{user.email}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">Analyst</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    )
}
