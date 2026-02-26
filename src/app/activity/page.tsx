"use client"

import React, { useMemo } from "react"
import { useCompanyStore } from "@/lib/store/useCompanyStore"
import { useListStore } from "@/lib/store/useListStore"
import { useSavedSearchStore } from "@/lib/store/useSavedSearchStore"
import { useThesisStore } from "@/lib/store/useThesisStore"
import { calculateScore } from "@/lib/scoring"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CompanyLogo } from "@/components/companies/CompanyLogo"
import { Sparkles, FolderPlus, Bookmark, Building2, Clock, Zap, Search, ArrowRight, TrendingUp, Eye, BarChart3, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Simple SVG Donut Chart
function DonutChart({ data, size = 160, onSegmentClick }: { data: { label: string; value: number; color: string }[]; size?: number; onSegmentClick?: (label: string) => void }) {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    if (total === 0) return null
    const r = (size / 2) - 12
    const circumference = 2 * Math.PI * r
    let offset = 0

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90 shadow-2xl rounded-full">
                {data.map((d, i) => {
                    const pct = d.value / total
                    const dash = circumference * pct
                    const gap = circumference - dash
                    const currentOffset = offset
                    offset += dash
                    return (
                        <circle
                            key={i}
                            cx={size / 2}
                            cy={size / 2}
                            r={r}
                            fill="none"
                            stroke={d.color}
                            strokeWidth={20}
                            strokeDasharray={`${dash} ${gap}`}
                            strokeDashoffset={-currentOffset}
                            className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-white/30"
                            style={{ strokeWidth: onSegmentClick ? 24 : 20 }}
                            onClick={() => onSegmentClick?.(d.label)}
                        />
                    )
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black font-mono">{total}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Total</span>
            </div>
        </div>
    )
}

// Simple Bar Chart
function BarChart({ data, maxHeight = 100, onBarClick }: { data: { label: string; value: number; color: string }[]; maxHeight?: number; onBarClick?: (label: string) => void }) {
    const max = Math.max(...data.map(d => d.value), 1)
    return (
        <div className="flex items-end gap-3 h-[120px]">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer" onClick={() => onBarClick?.(d.label)}>
                    <span className="text-xs font-black font-mono group-hover:text-primary group-hover:scale-125 transition-all">{d.value}</span>
                    <div
                        className="w-full rounded-t-xl transition-all duration-1000 ease-out min-h-[4px] group-hover:brightness-125 group-hover:shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                        style={{
                            height: `${(d.value / max) * maxHeight}px`,
                            backgroundColor: d.color
                        }}
                    />
                    <span className="text-[9px] font-bold text-muted-foreground text-center leading-tight uppercase tracking-wider truncate w-full group-hover:text-primary">{d.label}</span>
                </div>
            ))}
        </div>
    )
}

export default function ActivityPage() {
    const [activeFilter, setActiveFilter] = React.useState<{ type: 'sector' | 'stage' | 'pipeline' | 'score'; value: string } | null>(null)
    const companies = useCompanyStore((state) => state.companies)
    const lists = useListStore((state) => state.lists)
    const searches = useSavedSearchStore((state) => state.searches)
    const thesis = useThesisStore()

    // Analytics data
    const analytics = useMemo(() => {
        const sectorMap: Record<string, number> = {}
        const stageMap: Record<string, number> = {}
        const geoMap: Record<string, number> = {}
        const pipelineMap: Record<string, number> = { new: 0, reviewing: 0, diligence: 0, passed: 0, invested: 0 }
        const scores: number[] = []
        let enrichedCount = 0
        let watchedCount = 0

        companies.forEach(c => {
            sectorMap[c.sector] = (sectorMap[c.sector] || 0) + 1
            stageMap[c.stage] = (stageMap[c.stage] || 0) + 1
            geoMap[c.geography] = (geoMap[c.geography] || 0) + 1
            pipelineMap[c.pipelineStage || 'new'] = (pipelineMap[c.pipelineStage || 'new'] || 0) + 1
            scores.push(calculateScore(c, thesis))
            if (c.lastEnriched) enrichedCount++
            if (c.watched) watchedCount++
        })

        const sectorColors = ['#2563eb', '#0d9488', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']
        const sectorData = Object.entries(sectorMap).map(([label, value], i) => ({
            label, value, color: sectorColors[i % sectorColors.length]
        }))

        const stageOrder = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+']
        const stageColors = ['#94a3b8', '#2563eb', '#0d9488', '#f59e0b', '#8b5cf6']
        const stageData = stageOrder.map((label, i) => ({
            label, value: stageMap[label] || 0, color: stageColors[i]
        }))

        const pipelineLabels: Record<string, string> = { new: 'New', reviewing: 'Review', diligence: 'DD', passed: 'Pass', invested: 'Invest' }
        const pipelineColors = ['#94a3b8', '#2563eb', '#f59e0b', '#ef4444', '#10b981']
        const pipelineData = Object.entries(pipelineMap).map(([key, value], i) => ({
            label: pipelineLabels[key] || key, value, color: pipelineColors[i]
        }))

        // Score distribution buckets
        const scoreBuckets = [
            { label: '0-20', value: 0, color: '#ef4444' },
            { label: '21-40', value: 0, color: '#f59e0b' },
            { label: '41-60', value: 0, color: '#94a3b8' },
            { label: '61-80', value: 0, color: '#0d9488' },
            { label: '81-100', value: 0, color: '#2563eb' },
        ]
        scores.forEach(s => {
            if (s <= 20) scoreBuckets[0].value++
            else if (s <= 40) scoreBuckets[1].value++
            else if (s <= 60) scoreBuckets[2].value++
            else if (s <= 80) scoreBuckets[3].value++
            else scoreBuckets[4].value++
        })

        const topCompanies = companies
            .map(c => ({ ...c, score: calculateScore(c, thesis) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)

        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

        return { sectorData, stageData, pipelineData, scoreBuckets, topCompanies, enrichedCount, watchedCount, avgScore }
    }, [companies, thesis])

    // Activity feed
    const activities = useMemo(() => {
        const items: { id: string; title: string; description: string; timestamp: string; icon: typeof Sparkles; color: string; companyId?: string }[] = []

        companies.forEach(company => {
            // Apply active filter to company-related activities if necessary
            let shouldInclude = true
            if (activeFilter) {
                const score = calculateScore(company, thesis)
                if (activeFilter.type === 'sector') shouldInclude = company.sector === activeFilter.value
                else if (activeFilter.type === 'stage') shouldInclude = company.stage === activeFilter.value
                else if (activeFilter.type === 'pipeline') {
                    const labelMap: Record<string, string> = { new: 'New', reviewing: 'Review', diligence: 'DD', passed: 'Pass', invested: 'Invest' }
                    shouldInclude = (labelMap[company.pipelineStage || 'new'] === activeFilter.value)
                }
                else if (activeFilter.type === 'score') {
                    if (activeFilter.value === '0-20') shouldInclude = score <= 20
                    else if (activeFilter.value === '21-40') shouldInclude = score > 20 && score <= 40
                    else if (activeFilter.value === '41-60') shouldInclude = score > 40 && score <= 60
                    else if (activeFilter.value === '61-80') shouldInclude = score > 60 && score <= 80
                    else shouldInclude = score > 80
                }
            }

            if (!shouldInclude) return

            if (company.lastEnriched) {
                items.push({
                    id: `enrich-${company.id}`,
                    title: `AI Enriched: ${company.name}`,
                    description: company.enrichedSummary || `Enriched with AI intelligence.`,
                    timestamp: company.lastEnriched,
                    icon: Sparkles,
                    color: 'text-amber-500 bg-amber-500/10',
                    companyId: company.id
                })
            }
            items.push({
                id: `add-${company.id}`,
                title: `Added: ${company.name}`,
                description: `${company.sector} · ${company.stage} · ${company.geography}`,
                timestamp: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
                icon: Building2,
                color: 'text-primary bg-primary/10',
                companyId: company.id
            })
        })

        if (!activeFilter) {
            lists.forEach(list => {
                items.push({
                    id: `list-${list.id}`,
                    title: `Collection: ${list.name}`,
                    description: `${list.companyIds.length} companies organized.`,
                    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
                    icon: FolderPlus,
                    color: 'text-emerald-500 bg-emerald-500/10'
                })
            })
        }

        return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }, [companies, lists, activeFilter, thesis])

    const stats = [
        { label: "Pipeline", value: companies.length, icon: Building2, color: "text-primary" },
        { label: "Enriched", value: analytics.enrichedCount, icon: Sparkles, color: "text-amber-500" },
        { label: "Watched", value: analytics.watchedCount, icon: Eye, color: "text-emerald-500" },
        { label: "Avg Score", value: analytics.avgScore, icon: TrendingUp, color: "text-violet-500" },
        { label: "Collections", value: lists.length, icon: FolderPlus, color: "text-cyan-500" },
        { label: "Saved Views", value: searches.length, icon: Bookmark, color: "text-rose-500" },
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">Pipeline metrics, thesis coverage, and scouting activity.</p>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.map(stat => (
                    <Card key={stat.label} className="rounded-3xl bg-card/50 backdrop-blur-sm border-muted/50">
                        <CardContent className="p-5 flex flex-col items-center text-center gap-1.5">
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            <span className="text-2xl font-black font-mono">{stat.value}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sector Distribution */}
                <Card className={`rounded-3xl shadow-xl border-muted/50 bg-card/50 backdrop-blur-sm transition-all ${activeFilter?.type === 'sector' ? 'ring-2 ring-primary ring-offset-4 ring-offset-background' : ''}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            Sector Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <DonutChart
                            data={analytics.sectorData}
                            onSegmentClick={(val) => setActiveFilter({ type: 'sector', value: val })}
                        />
                        <div className="flex flex-wrap gap-2 justify-center">
                            {analytics.sectorData.map(d => (
                                <button
                                    key={d.label}
                                    className={`flex items-center gap-1.5 text-[10px] font-bold p-1 rounded-md hover:bg-muted transition-colors ${activeFilter?.value === d.label ? 'bg-primary/10 text-primary' : ''}`}
                                    onClick={() => setActiveFilter({ type: 'sector', value: d.label })}
                                >
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                    {d.label} ({d.value})
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Pipeline Funnel */}
                <Card className={`rounded-3xl shadow-xl border-muted/50 bg-card/50 backdrop-blur-sm transition-all ${activeFilter?.type === 'pipeline' ? 'ring-2 ring-primary ring-offset-4 ring-offset-background' : ''}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            Pipeline Funnel
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <BarChart
                            data={analytics.pipelineData}
                            onBarClick={(val) => setActiveFilter({ type: 'pipeline', value: val })}
                        />
                    </CardContent>
                </Card>

                {/* Score Distribution */}
                <Card className={`rounded-3xl shadow-xl border-muted/50 bg-card/50 backdrop-blur-sm transition-all ${activeFilter?.type === 'score' ? 'ring-2 ring-primary ring-offset-4 ring-offset-background' : ''}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Thesis Fit Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <BarChart
                            data={analytics.scoreBuckets}
                            onBarClick={(val) => setActiveFilter({ type: 'score', value: val })}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Stage Breakdown + Top Companies */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Stage Breakdown */}
                <Card className={`rounded-3xl shadow-xl border-muted/50 bg-card/50 backdrop-blur-sm transition-all ${activeFilter?.type === 'stage' ? 'ring-2 ring-primary ring-offset-4 ring-offset-background' : ''}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold">Stage Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <BarChart
                            data={analytics.stageData}
                            onBarClick={(val) => setActiveFilter({ type: 'stage', value: val })}
                        />
                    </CardContent>
                </Card>

                {/* Top Scoring Companies */}
                <Card className="rounded-3xl shadow-xl border-muted/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            Top Thesis Matches
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                        {analytics.topCompanies.map((c, i) => (
                            <Link key={c.id} href={`/companies/${c.id}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/40 transition-colors group">
                                <span className="text-sm font-mono font-black text-muted-foreground/30 w-5">{i + 1}</span>
                                <CompanyLogo name={c.name} website={c.website} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <span className="font-bold text-sm group-hover:text-primary transition-colors">{c.name}</span>
                                    <p className="text-[10px] text-muted-foreground">{c.sector}</p>
                                </div>
                                <span className="font-mono font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10 text-sm">{c.score}</span>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Feed */}
            <Card className="rounded-[2.5rem] shadow-xl border-muted/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-muted/20 border-b flex flex-row items-center justify-between py-5">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Recent Activity
                    </CardTitle>
                    {activeFilter && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveFilter(null)}
                            className="h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 gap-2 border border-primary/20 px-4 font-black text-[10px] uppercase tracking-widest"
                        >
                            <span>Filter: {activeFilter.value}</span>
                            <span className="opacity-50">✕</span>
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    {activities.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-muted-foreground">
                            <p className="text-sm">No activity yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-muted/50">
                            {activities.slice(0, 15).map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4 p-5 hover:bg-muted/20 transition-colors">
                                    <div className={`p-2 rounded-xl shrink-0 ${activity.color}`}>
                                        <activity.icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm">{activity.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
                                    </div>
                                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-full whitespace-nowrap">
                                        {new Date(activity.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
                {[
                    { href: "/companies", label: "Discovery", desc: "Browse companies", icon: Search, color: "text-primary bg-primary/5" },
                    { href: "/pipeline", label: "Pipeline", desc: "Kanban board", icon: Target, color: "text-emerald-500 bg-emerald-500/5" },
                    { href: "/settings/thesis", label: "Thesis", desc: "Configure strategy", icon: Zap, color: "text-violet-500 bg-violet-500/5" },
                ].map(item => (
                    <Link key={item.href} href={item.href} className="group">
                        <Card className="rounded-3xl border-muted/50 hover:border-primary/30 transition-all cursor-pointer bg-card/50 h-full">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${item.color}`}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm">{item.label}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.desc}</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
