"use client"

import { useState, useMemo } from "react"
import { useCompanyStore } from "@/lib/store/useCompanyStore"
import { useThesisStore } from "@/lib/store/useThesisStore"
import { calculateScore } from "@/lib/scoring"
import { PipelineStage } from "@/lib/types"
import { CompanyLogo } from "@/components/companies/CompanyLogo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"
import { Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const COLUMNS: { key: PipelineStage; label: string; color: string; bgColor: string }[] = [
    { key: 'new', label: 'New', color: 'bg-slate-500', bgColor: 'bg-slate-500/5 border-slate-500/20' },
    { key: 'reviewing', label: 'Reviewing', color: 'bg-blue-500', bgColor: 'bg-blue-500/5 border-blue-500/20' },
    { key: 'diligence', label: 'Due Diligence', color: 'bg-amber-500', bgColor: 'bg-amber-500/5 border-amber-500/20' },
    { key: 'passed', label: 'Passed', color: 'bg-red-500', bgColor: 'bg-red-500/5 border-red-500/20' },
    { key: 'invested', label: 'Invested', color: 'bg-emerald-500', bgColor: 'bg-emerald-500/5 border-emerald-500/20' },
]

export default function PipelinePage() {
    const companies = useCompanyStore((state) => state.companies)
    const setPipelineStage = useCompanyStore((state) => state.setPipelineStage)
    const toggleWatch = useCompanyStore((state) => state.toggleWatch)
    const thesis = useThesisStore()

    const [draggedCompanyId, setDraggedCompanyId] = useState<string | null>(null)

    const columnData = useMemo(() => {
        const map: Record<PipelineStage, typeof companies> = {
            new: [], reviewing: [], diligence: [], passed: [], invested: []
        }
        companies.forEach(c => {
            const stage = c.pipelineStage || 'new'
            map[stage].push(c)
        })
        return map
    }, [companies])

    const handleDragStart = (e: React.DragEvent, companyId: string) => {
        setDraggedCompanyId(companyId)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', companyId)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
        e.preventDefault()
        const companyId = e.dataTransfer.getData('text/plain')
        if (companyId) {
            const company = companies.find(c => c.id === companyId)
            if (company && (company.pipelineStage || 'new') !== targetStage) {
                setPipelineStage(companyId, targetStage)
                toast.success(`Moved ${company.name} to ${COLUMNS.find(c => c.key === targetStage)?.label}`)
            }
        }
        setDraggedCompanyId(null)
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-700">
            <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight">Pipeline</h1>
                <p className="text-muted-foreground">Drag companies between stages. Click a company to view its profile.</p>
            </div>

            <div className="grid grid-cols-5 gap-4 min-h-[600px]">
                {COLUMNS.map(col => (
                    <div
                        key={col.key}
                        className={`rounded-3xl border-2 border-dashed p-3 transition-all flex flex-col ${col.bgColor} ${draggedCompanyId ? 'border-primary/30 bg-primary/[0.02]' : ''
                            }`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.key)}
                    >
                        {/* Column Header */}
                        <div className="flex items-center gap-2 px-2 py-3 mb-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                            <span className="text-xs font-black uppercase tracking-widest">{col.label}</span>
                            <Badge variant="secondary" className="rounded-full text-[10px] px-2 ml-auto font-mono">
                                {columnData[col.key].length}
                            </Badge>
                        </div>

                        {/* Cards */}
                        <div className="flex-1 space-y-2 overflow-y-auto">
                            {columnData[col.key].map(company => {
                                const score = calculateScore(company, thesis)
                                return (
                                    <div
                                        key={company.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, company.id)}
                                        className={`bg-card rounded-2xl border shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${draggedCompanyId === company.id ? 'opacity-40 scale-95' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <CompanyLogo name={company.name} website={company.website} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/companies/${company.id}`} className="font-bold text-xs hover:text-primary transition-colors block truncate">
                                                    {company.name}
                                                </Link>
                                                <p className="text-[10px] text-muted-foreground truncate">{company.sector}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => { e.stopPropagation(); toggleWatch(company.id) }}
                                            >
                                                {company.watched ? (
                                                    <Eye className="h-3 w-3 text-primary" />
                                                ) : (
                                                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted/50">
                                            <Badge variant="outline" className="rounded-full text-[8px] px-2 uppercase tracking-widest font-bold">{company.stage}</Badge>
                                            <span className={`text-xs font-mono font-black ${score >= 70 ? 'text-primary' : 'text-muted-foreground'}`}>{score}</span>
                                        </div>
                                        {company.lastEnriched && (
                                            <div className="flex items-center gap-1 mt-1.5 text-[9px] text-amber-500 font-bold">
                                                <Sparkles className="h-2.5 w-2.5" />
                                                AI Enriched
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                            {columnData[col.key].length === 0 && (
                                <div className="flex items-center justify-center h-24 text-[10px] text-muted-foreground/40 uppercase tracking-widest font-bold">
                                    Drop here
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
