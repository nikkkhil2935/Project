"use client"

import { useState, useMemo } from "react"
import { useCompanyStore } from "@/lib/store/useCompanyStore"
import { useThesisStore } from "@/lib/store/useThesisStore"
import { calculateScore } from "@/lib/scoring"
import { CompanyLogo } from "@/components/companies/CompanyLogo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Target, MapPin, Zap, Building2, Globe, Sparkles, ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ComparePage() {
    const companies = useCompanyStore((state) => state.companies)
    const thesis = useThesisStore()
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const selectedCompanies = useMemo(() =>
        selectedIds.map(id => companies.find(c => c.id === id)).filter(Boolean) as typeof companies,
        [selectedIds, companies]
    )

    const addCompany = (id: string) => {
        if (selectedIds.length < 4 && !selectedIds.includes(id)) {
            setSelectedIds([...selectedIds, id])
        }
    }

    const removeCompany = (id: string) => {
        setSelectedIds(selectedIds.filter(sid => sid !== id))
    }

    const availableCompanies = companies.filter(c => !selectedIds.includes(c.id))

    const rows = [
        { label: "Sector", icon: Target, render: (c: typeof companies[0]) => c.sector },
        { label: "Stage", icon: Zap, render: (c: typeof companies[0]) => c.stage },
        { label: "Geography", icon: MapPin, render: (c: typeof companies[0]) => c.geography },
        { label: "Signals", icon: Sparkles, render: (c: typeof companies[0]) => `${c.derivedSignals.length} detected` },
        { label: "Tags", icon: Building2, render: (c: typeof companies[0]) => c.tags.slice(0, 4).join(", ") },
        { label: "Enriched", icon: ShieldCheck, render: (c: typeof companies[0]) => c.lastEnriched ? "Yes" : "No" },
        {
            label: "Thesis Fit", icon: Target, render: (c: typeof companies[0]) => {
                const score = calculateScore(c, thesis)
                return <span className={`font-mono font-black text-2xl ${score >= 70 ? 'text-primary' : 'text-muted-foreground'}`}>{score}</span>
            }
        },
        { label: "Sector Match", icon: ShieldCheck, render: (c: typeof companies[0]) => thesis.preferredSectors.includes(c.sector) ? <ShieldCheck className="h-4 w-4 text-primary" /> : <span className="text-xs text-muted-foreground">—</span> },
        { label: "Stage Match", icon: ShieldCheck, render: (c: typeof companies[0]) => thesis.preferredStages.includes(c.stage) ? <ShieldCheck className="h-4 w-4 text-primary" /> : <span className="text-xs text-muted-foreground">—</span> },
        { label: "Geo Match", icon: ShieldCheck, render: (c: typeof companies[0]) => thesis.preferredGeographies.includes(c.geography) ? <ShieldCheck className="h-4 w-4 text-primary" /> : <span className="text-xs text-muted-foreground">—</span> },
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight">Compare</h1>
                <p className="text-muted-foreground">Select up to 4 companies for side-by-side comparison.</p>
            </div>

            {/* Company Selector */}
            <div className="flex items-center gap-3 flex-wrap">
                {selectedIds.map(id => {
                    const c = companies.find(co => co.id === id)
                    if (!c) return null
                    return (
                        <Badge key={id} className="pl-1 pr-2 py-1 rounded-full bg-primary/10 text-primary border-primary/20 gap-2 text-sm font-bold">
                            <CompanyLogo name={c.name} website={c.website} size="sm" />
                            {c.name}
                            <button onClick={() => removeCompany(id)} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )
                })}
                {selectedIds.length < 4 && (
                    <Select onValueChange={addCompany}>
                        <SelectTrigger className="w-[220px] rounded-full h-10 border-dashed">
                            <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                <SelectValue placeholder="Add company..." />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            {availableCompanies.map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{c.name}</span>
                                        <span className="text-xs text-muted-foreground">{c.sector}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {selectedCompanies.length === 0 ? (
                <Card className="rounded-3xl border-dashed border-2 bg-muted/10">
                    <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <p className="text-muted-foreground text-center max-w-sm">Select 2-4 companies above to compare them side by side on thesis fit, signals, and more.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="rounded-[2.5rem] shadow-xl border-muted/50 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                {/* Header */}
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="p-5 text-left text-xs font-black uppercase tracking-widest text-muted-foreground w-40">Attribute</th>
                                        {selectedCompanies.map(c => (
                                            <th key={c.id} className="p-5 text-center min-w-[180px]">
                                                <Link href={`/companies/${c.id}`} className="flex flex-col items-center gap-2 group">
                                                    <CompanyLogo name={c.name} website={c.website} size="lg" />
                                                    <span className="font-black text-lg group-hover:text-primary transition-colors">{c.name}</span>
                                                    <a href={c.website} target="_blank" rel="noreferrer" className="text-[10px] text-muted-foreground flex items-center gap-1 hover:text-primary" onClick={e => e.stopPropagation()}>
                                                        <Globe className="h-3 w-3" />
                                                        {new URL(c.website).hostname}
                                                    </a>
                                                </Link>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Description */}
                                    <tr className="border-b">
                                        <td className="p-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</td>
                                        {selectedCompanies.map(c => (
                                            <td key={c.id} className="p-5 text-sm text-muted-foreground text-center leading-relaxed">
                                                {c.enrichedSummary || c.description}
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Rows */}
                                    {rows.map((row, i) => (
                                        <tr key={row.label} className={`border-b ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                    <row.icon className="h-3.5 w-3.5" />
                                                    {row.label}
                                                </div>
                                            </td>
                                            {selectedCompanies.map(c => (
                                                <td key={c.id} className="p-5 text-center text-sm font-medium">
                                                    {row.render(c)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
