"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Building2, ListTodo, Bookmark, Target, Activity, GitBranch, ArrowLeftRight } from "lucide-react"

const navItems = [
    { name: "Discovery", href: "/companies", icon: Building2, description: "Search & filter" },
    { name: "Pipeline", href: "/pipeline", icon: GitBranch, description: "Kanban board" },
    { name: "Collections", href: "/lists", icon: ListTodo, description: "Organized lists" },
    { name: "Saved Views", href: "/saved", icon: Bookmark, description: "Persisted searches" },
    { name: "Compare", href: "/compare", icon: ArrowLeftRight, description: "Side-by-side" },
    { name: "Analytics", href: "/activity", icon: Activity, description: "Metrics & feed" },
    { name: "Thesis", href: "/settings/thesis", icon: Target, description: "Investment mandate" },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden lg:flex flex-col w-56 border-r bg-card/50 min-h-[calc(100vh-4rem)] p-3 gap-0.5 shrink-0">
            <p className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground px-3 py-3">Navigation</p>
            {navItems.map(item => {
                const isActive = pathname === item.href || (item.href === "/companies" && pathname.startsWith("/companies"))
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group text-sm",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                        <div className="min-w-0">
                            <span className="font-bold text-[13px] block truncate">{item.name}</span>
                            <p className={cn("text-[9px] truncate", isActive ? "text-primary-foreground/70" : "text-muted-foreground/50")}>{item.description}</p>
                        </div>
                    </Link>
                )
            })}
        </aside>
    )
}
