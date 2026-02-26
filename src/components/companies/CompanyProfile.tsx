"use client"

import { useState } from "react"
import { Sparkles, Globe, Target, MapPin, ChevronLeft, ArrowRight, ShieldCheck, Zap, FolderPlus, Check, MessageSquare, X, ExternalLink, Clock, Link2, Eye, EyeOff, Tag, History } from "lucide-react"
import { useRouter } from "next/navigation"

import { useCompanyStore } from "@/lib/store/useCompanyStore"
import { useThesisStore } from "@/lib/store/useThesisStore"
import { useListStore } from "@/lib/store/useListStore"
import { calculateScore } from "@/lib/scoring"
import { CompanyLogo } from "./CompanyLogo"
import { PipelineStage } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const PIPELINE_LABELS: Record<PipelineStage, string> = {
    new: 'New', reviewing: 'Reviewing', diligence: 'Due Diligence', passed: 'Passed', invested: 'Invested'
}
const PIPELINE_COLORS: Record<PipelineStage, string> = {
    new: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    reviewing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    diligence: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    passed: 'bg-red-500/10 text-red-600 border-red-500/20',
    invested: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
}

export function CompanyProfile({ companyId }: { companyId: string }) {
    const router = useRouter()
    const company = useCompanyStore((state) => state.getCompany(companyId))
    const updateCompany = useCompanyStore((state) => state.updateCompany)
    const addNote = useCompanyStore((state) => state.addNote)
    const deleteNote = useCompanyStore((state) => state.deleteNote)
    const toggleWatch = useCompanyStore((state) => state.toggleWatch)
    const setPipelineStage = useCompanyStore((state) => state.setPipelineStage)
    const acceptTag = useCompanyStore((state) => state.acceptTag)
    const dismissTag = useCompanyStore((state) => state.dismissTag)
    const thesis = useThesisStore()

    const lists = useListStore((state) => state.lists)
    const addToList = useListStore((state) => state.addToList)
    const createList = useListStore((state) => state.createList)

    const [isEnriching, setIsEnriching] = useState(false)
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)
    const [newListName, setNewListName] = useState("")
    const [noteText, setNoteText] = useState("")

    if (!company) {
        return <div className="p-8 text-center text-muted-foreground">Company not found.</div>
    }

    const score = calculateScore(company, thesis)
    const pipelineStage = company.pipelineStage || 'new'

    const handleEnrich = async () => {
        setIsEnriching(true)
        try {
            const response = await fetch("/api/enrich", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: company.website })
            })

            if (!response.ok) throw new Error("Enrichment failed")
            const data = await response.json()
            const whatTheyDo = Array.isArray(data.whatTheyDo) ? data.whatTheyDo : [data.whatTheyDo]

            // Build enrichment history entry
            const historyEntry = {
                id: Date.now().toString(),
                enrichedAt: data.enrichedAt,
                model: data.enrichmentModel || 'Unknown',
                summary: data.summary,
                whatTheyDo,
                keywords: data.keywords || [],
                signals: data.derivedSignals || [],
                sources: data.sources || [],
            }

            // Generate suggested tags from keywords (new ones not already in tags)
            const currentTags = new Set(company.tags.map(t => t.toLowerCase()))
            const suggestedTags = (data.keywords || [])
                .filter((k: string) => !currentTags.has(k.toLowerCase()))
                .slice(0, 5)

            updateCompany(company.id, {
                lastEnriched: data.enrichedAt,
                enrichedSummary: data.summary,
                enrichedWhatTheyDo: whatTheyDo,
                enrichedKeywords: data.keywords,
                enrichmentSources: data.sources,
                enrichmentModel: data.enrichmentModel,
                suggestedTags,
                enrichmentHistory: [...(company.enrichmentHistory || []), historyEntry],
                sector: data.sector || company.sector,
                derivedSignals: [
                    ...company.derivedSignals,
                    ...(data.derivedSignals || []).map((s: any) => ({
                        ...s,
                        detectedAt: s.date || s.detectedAt || new Date().toISOString()
                    }))
                ]
            })

            toast.success("AI Enrichment complete!")
        } catch (error) {
            toast.error("Failed to enrich. Check Gemini API key.")
        } finally {
            setIsEnriching(false)
        }
    }

    const handleAddToList = (listId: string) => {
        const list = lists.find(l => l.id === listId)
        if (list?.companyIds.includes(company.id)) {
            toast.info(`${company.name} is already in "${list.name}"`)
            return
        }
        addToList(listId, company.id)
        toast.success(`Added ${company.name} to "${lists.find(l => l.id === listId)?.name}"`)
    }

    const handleCreateAndAdd = () => {
        if (!newListName.trim()) { toast.error("Enter a list name"); return }
        createList(newListName.trim())
        toast.success(`Created "${newListName.trim()}"`)
        setNewListName("")
        setSaveDialogOpen(false)
    }

    const handleAddNote = () => {
        if (!noteText.trim()) return
        addNote(company.id, noteText.trim())
        setNoteText("")
        toast.success("Note added")
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <Button
                variant="ghost"
                size="sm"
                className="rounded-full gap-2 transition-all hover:-translate-x-1"
                onClick={() => router.back()}
            >
                <ChevronLeft className="h-4 w-4" />
                Back
            </Button>

            {/* Profile Header */}
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-5">
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                        <CompanyLogo name={company.name} website={company.website} size="xl" />
                        <div className="space-y-3 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-3xl font-extrabold tracking-tight">{company.name}</h1>
                                <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-primary/20">{company.stage}</Badge>
                                <Badge className={`rounded-full text-[10px] px-3 border ${PIPELINE_COLORS[pipelineStage]}`}>
                                    {PIPELINE_LABELS[pipelineStage]}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                                <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                    <Globe className="h-4 w-4" />
                                    {new URL(company.website).hostname}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{company.geography}</div>
                                <div className="flex items-center gap-1.5"><Target className="h-4 w-4" />{company.sector}</div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {company.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="rounded-full text-[10px] px-3 font-semibold uppercase tracking-wider">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-base text-muted-foreground leading-relaxed">{company.enrichedSummary || company.description}</p>

                    {/* Suggested Tags from AI */}
                    {company.suggestedTags && company.suggestedTags.length > 0 && (
                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-600">
                                <Tag className="h-3.5 w-3.5" />
                                AI Suggested Tags
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {company.suggestedTags.map(tag => (
                                    <div key={tag} className="flex items-center gap-1 bg-background rounded-full border pl-3 pr-1 py-1">
                                        <span className="text-xs font-bold">#{tag}</span>
                                        <button className="p-1 hover:bg-emerald-500/10 rounded-full transition-colors" onClick={() => acceptTag(company.id, tag)} title="Accept">
                                            <Check className="h-3 w-3 text-emerald-500" />
                                        </button>
                                        <button className="p-1 hover:bg-red-500/10 rounded-full transition-colors" onClick={() => dismissTag(company.id, tag)} title="Dismiss">
                                            <X className="h-3 w-3 text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 flex-wrap">
                        <Button className="rounded-full h-11 px-6 gap-2 shadow-xl shadow-primary/20" onClick={handleEnrich} disabled={isEnriching}>
                            {isEnriching ? <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {isEnriching ? "Analyzing..." : "Enrich with AI"}
                        </Button>
                        <Button variant="outline" className="rounded-full h-11 px-6 gap-2" onClick={() => setSaveDialogOpen(true)}>
                            <FolderPlus className="h-4 w-4" />
                            Save to List
                        </Button>
                        <Button
                            variant={company.watched ? "default" : "outline"}
                            className={`rounded-full h-11 px-6 gap-2 ${company.watched ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' : ''}`}
                            onClick={() => { toggleWatch(company.id); toast.success(company.watched ? 'Unwatched' : 'Now watching') }}
                        >
                            {company.watched ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            {company.watched ? "Watching" : "Watch"}
                        </Button>
                        <Select value={pipelineStage} onValueChange={(v) => { setPipelineStage(company.id, v as PipelineStage); toast.success(`Moved to ${PIPELINE_LABELS[v as PipelineStage]}`) }}>
                            <SelectTrigger className="rounded-full h-11 w-[160px] border-muted-foreground/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                {(Object.entries(PIPELINE_LABELS) as [PipelineStage, string][]).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Score Card */}
                <Card className="rounded-[2.5rem] bg-card/50 backdrop-blur-sm shadow-2xl border-muted/50 overflow-hidden h-fit sticky top-24">
                    <CardHeader className="text-center pb-2 pt-8">
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative">
                                <svg className="h-28 w-28 -rotate-90">
                                    <circle cx="56" cy="56" r="50" className="stroke-muted fill-none" strokeWidth="8" />
                                    <circle
                                        cx="56" cy="56" r="50"
                                        className="stroke-primary fill-none transition-all duration-1000 ease-out"
                                        strokeWidth="8"
                                        strokeDasharray={2 * Math.PI * 50}
                                        strokeDashoffset={(2 * Math.PI * 50) * (1 - score / 100)}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black font-mono">{score}</span>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Score</span>
                                </div>
                            </div>
                            <CardTitle className="mt-2 text-base">Thesis Fit</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 px-6 pb-6">
                        {[
                            { label: 'Sector', matched: thesis.preferredSectors.includes(company.sector), icon: Target },
                            { label: 'Stage', matched: thesis.preferredStages.includes(company.stage), icon: Zap },
                            { label: 'Geo', matched: thesis.preferredGeographies.includes(company.geography), icon: MapPin },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 text-xs">
                                <div className="flex items-center gap-2 font-medium">
                                    <item.icon className={`h-3.5 w-3.5 ${item.matched ? 'text-primary' : 'text-muted-foreground/50'}`} />
                                    {item.label}
                                </div>
                                {item.matched ? <ShieldCheck className="h-3.5 w-3.5 text-primary" /> : <span className="text-[9px] text-muted-foreground/40 font-bold">—</span>}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Save to List Dialog */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-primary" />
                            Save to List
                        </DialogTitle>
                        <DialogDescription>Add {company.name} to a list or create a new one.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 pt-2">
                        {lists.length > 0 && (
                            <div className="space-y-2">
                                {lists.map(list => {
                                    const isInList = list.companyIds.includes(company.id)
                                    return (
                                        <button key={list.id} onClick={() => handleAddToList(list.id)} className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center justify-between ${isInList ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-card hover:bg-muted border-muted/50'}`}>
                                            <div className="flex items-center gap-3">
                                                <FolderPlus className="h-4 w-4" />
                                                <span className="font-bold">{list.name}</span>
                                                <Badge variant="secondary" className="rounded-full text-[10px] px-2">{list.companyIds.length}</Badge>
                                            </div>
                                            {isInList && <Check className="h-4 w-4" />}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                        <div className="pt-3 border-t space-y-3">
                            <div className="flex gap-2">
                                <Input placeholder="New list name" value={newListName} onChange={(e) => setNewListName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()} className="rounded-xl h-11" />
                                <Button className="rounded-xl h-11 px-6 shrink-0" onClick={handleCreateAndAdd}>Create</Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Tabs defaultValue="intel" className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-full w-fit mx-auto sm:mx-0">
                    <TabsTrigger value="intel" className="rounded-full px-5 py-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Intelligence</TabsTrigger>
                    <TabsTrigger value="signals" className="rounded-full px-5 py-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Signals</TabsTrigger>
                    <TabsTrigger value="notes" className="rounded-full px-5 py-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        Notes {(company.notes?.length || 0) > 0 && <Badge variant="secondary" className="ml-1 rounded-full text-[9px] px-1.5">{company.notes?.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-full px-5 py-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        History {(company.enrichmentHistory?.length || 0) > 0 && <Badge variant="secondary" className="ml-1 rounded-full text-[9px] px-1.5">{company.enrichmentHistory?.length}</Badge>}
                    </TabsTrigger>
                </TabsList>

                {/* Intelligence Tab */}
                <TabsContent value="intel" className="pt-6 animate-in slide-in-from-left-4 duration-500">
                    <Card className="rounded-[2rem] bg-card shadow-lg border-muted/50 overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                AI Intelligence
                            </CardTitle>
                            {company.lastEnriched && (
                                <CardDescription className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                                    <Clock className="h-3 w-3" />
                                    {new Date(company.lastEnriched).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    {company.enrichmentModel && <> · {company.enrichmentModel}</>}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {isEnriching ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm font-medium text-primary">Scraping website pages & analyzing with AI...</span>
                                    </div>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-[85%]" />
                                    <Skeleton className="h-20 w-full rounded-2xl" />
                                </div>
                            ) : company.lastEnriched ? (
                                <>
                                    <div className="bg-secondary/20 p-5 rounded-2xl border border-primary/5">
                                        <p className="italic text-muted-foreground">&quot;{company.enrichedSummary}&quot;</p>
                                    </div>

                                    {company.enrichedWhatTheyDo && company.enrichedWhatTheyDo.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="font-bold flex items-center gap-2 text-sm"><ArrowRight className="h-4 w-4 text-primary" />What They Do</h4>
                                            <ul className="space-y-2 pl-6">
                                                {company.enrichedWhatTheyDo.map((item, i) => (
                                                    <li key={i} className="text-muted-foreground leading-relaxed flex items-start gap-2 text-sm">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {company.enrichedKeywords && company.enrichedKeywords.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="font-bold text-sm">Keywords</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {company.enrichedKeywords.map(kw => (
                                                    <Badge key={kw} variant="secondary" className="rounded-full px-3 py-1 bg-background border text-xs">#{kw.toLowerCase()}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {company.enrichmentSources && company.enrichmentSources.length > 0 && (
                                        <div className="space-y-3 pt-4 border-t">
                                            <h4 className="font-bold text-sm flex items-center gap-2"><Link2 className="h-4 w-4 text-muted-foreground" />Sources Scraped</h4>
                                            <div className="space-y-2">
                                                {company.enrichmentSources.map((src, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 text-sm group">
                                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                                        <a href={src.url} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate flex-1 font-mono text-xs">{src.url}</a>
                                                        <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                                                            {new Date(src.scrapedAt).toLocaleTimeString()} · {Math.round(src.contentLength / 1000)}k
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 space-y-4">
                                    <div className="h-16 w-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                                        <Zap className="h-8 w-8 text-muted-foreground opacity-30" />
                                    </div>
                                    <p className="text-muted-foreground max-w-sm mx-auto text-sm">No AI intelligence yet. Click &quot;Enrich with AI&quot; to scrape and analyze.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Signals Tab */}
                <TabsContent value="signals" className="pt-6 animate-in slide-in-from-right-4 duration-500">
                    <Card className="rounded-[2rem] overflow-hidden shadow-lg border-muted/50">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-lg">Signal Timeline</CardTitle>
                            <CardDescription>{company.derivedSignals.length} signals detected</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="space-y-6 relative ml-4 border-l border-muted pb-4">
                                {company.derivedSignals.length > 0 ? (
                                    company.derivedSignals.map((signal, idx) => (
                                        <div key={idx} className="relative pl-8">
                                            <div className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full shadow-[0_0_8px] ${signal.type === 'hiring' || signal.type === 'careers' ? 'bg-emerald-500 shadow-emerald-500/50' :
                                                    signal.type === 'funding' ? 'bg-amber-500 shadow-amber-500/50' :
                                                        signal.type === 'press' ? 'bg-blue-500 shadow-blue-500/50' :
                                                            'bg-primary shadow-primary/50'
                                                }`} />
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="rounded-full text-[9px] px-2 uppercase font-bold tracking-wider">{signal.type}</Badge>
                                                        <h4 className="font-bold text-sm">{signal.label || signal.title}</h4>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        {new Date(signal.detectedAt || signal.date || '').toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {signal.description && <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">{signal.description}</p>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="pl-8 text-muted-foreground italic text-sm">No signals detected yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="pt-6 animate-in fade-in duration-500">
                    <Card className="rounded-[2rem] overflow-hidden shadow-lg border-muted/50">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-3">
                                <Textarea placeholder="Add a note (founder background, positioning, red flags, next steps)..." value={noteText} onChange={(e) => setNoteText(e.target.value)} className="rounded-2xl min-h-[80px] resize-none" />
                                <div className="flex justify-end">
                                    <Button className="rounded-full h-10 px-6 gap-2 shadow-lg shadow-primary/10" onClick={handleAddNote} disabled={!noteText.trim()}>
                                        <MessageSquare className="h-4 w-4" />Add Note
                                    </Button>
                                </div>
                            </div>
                            {(company.notes?.length || 0) > 0 ? (
                                <div className="space-y-3 border-t pt-6">
                                    {company.notes?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(note => (
                                        <div key={note.id} className="p-4 rounded-2xl bg-muted/30 border group relative">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1.5 flex-1">
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.text}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                        {note.author} · {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => { deleteNote(company.id, note.id); toast.success("Deleted") }}>
                                                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">No notes yet.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Enrichment History Tab */}
                <TabsContent value="history" className="pt-6 animate-in fade-in duration-500">
                    <Card className="rounded-[2rem] overflow-hidden shadow-lg border-muted/50">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5 text-primary" />Enrichment History</CardTitle>
                            <CardDescription>Track how this company&apos;s profile has been enriched over time.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {(company.enrichmentHistory?.length || 0) > 0 ? (
                                <div className="space-y-4">
                                    {company.enrichmentHistory?.sort((a, b) => new Date(b.enrichedAt).getTime() - new Date(a.enrichedAt).getTime()).map((run) => (
                                        <div key={run.id} className="p-5 rounded-2xl bg-muted/30 border space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                                    {run.model}
                                                </div>
                                                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                                    {new Date(run.enrichedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground italic">&quot;{run.summary}&quot;</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {run.keywords.slice(0, 6).map(kw => (
                                                    <Badge key={kw} variant="secondary" className="rounded-full text-[9px] px-2 bg-background border">#{kw}</Badge>
                                                ))}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {run.sources.length} sources · {run.signals.length} signals · {run.whatTheyDo.length} capabilities
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground text-sm">
                                    <p>No enrichment runs yet. Click &quot;Enrich with AI&quot; to start building history.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
