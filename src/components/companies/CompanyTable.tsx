"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, ArrowUpDown, Globe, Zap, ExternalLink, Sparkles, Bookmark, ChevronLeft, ChevronRight, CheckSquare, Square, FolderPlus, Trash2, Eye } from "lucide-react"

import { useCompanyStore } from "@/lib/store/useCompanyStore"
import { useThesisStore } from "@/lib/store/useThesisStore"
import { useSavedSearchStore } from "@/lib/store/useSavedSearchStore"
import { useListStore } from "@/lib/store/useListStore"
import { calculateScore } from "@/lib/scoring"
import { Company } from "@/lib/types"
import { CompanyLogo } from "./CompanyLogo"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CompanyFilters } from "./CompanyFilters"
import { FilterState } from "@/lib/store/useSavedSearchStore"
import { toast } from "sonner"

const PAGE_SIZE = 8

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value) }, delay)
        return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
}

export function CompanyTable() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const companies = useCompanyStore((state) => state.companies)
    const toggleWatch = useCompanyStore((state) => state.toggleWatch)
    const thesis = useThesisStore()
    const saveSearch = useSavedSearchStore((state) => state.saveSearch)
    const lists = useListStore((state) => state.lists)
    const addToList = useListStore((state) => state.addToList)
    const createList = useListStore((state) => state.createList)

    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
    const debouncedSearch = useDebounce(searchTerm, 300)

    const [filters, setFilters] = useState<FilterState>({
        sectors: searchParams.get("sectors")?.split(",").filter(Boolean) || [],
        geographies: searchParams.get("geographies")?.split(",").filter(Boolean) || [],
        stages: searchParams.get("stages")?.split(",").filter(Boolean) || [],
        hiringOnly: searchParams.get("hiring") === "true"
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)
    const [viewName, setViewName] = useState("")
    const [sortField, setSortField] = useState<keyof Company | 'score'>('score')
    const [sortParam, setSortParam] = useState<'asc' | 'desc'>('desc')

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [bulkListDialogOpen, setBulkListDialogOpen] = useState(false)
    const [bulkNewListName, setBulkNewListName] = useState("")

    const handleSort = (field: keyof Company | 'score') => {
        if (sortField === field) {
            setSortParam(sortParam === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortParam('desc')
        }
    }

    const handleSaveView = () => {
        const name = viewName.trim()
        if (!name) {
            toast.error("Please enter a name for this view")
            return
        }

        // Check for duplicates
        const exists = useSavedSearchStore.getState().searches.some(s => s.name.toLowerCase() === name.toLowerCase())
        if (exists) {
            toast.error(`A view named "${name}" already exists. Please choose a different name.`)
            return
        }

        saveSearch(name, searchTerm, filters)
        toast.success(`View "${name}" saved successfully`)
        setViewName("")
        setSaveDialogOpen(false)
    }

    useEffect(() => { setCurrentPage(1) }, [debouncedSearch, filters])

    const availableSectors = useMemo(() => Array.from(new Set(companies.map(c => c.sector))), [companies])
    const availableStages = useMemo(() => Array.from(new Set(companies.map(c => c.stage))), [companies])
    const availableGeographies = useMemo(() => Array.from(new Set(companies.map(c => c.geography))), [companies])

    const data = useMemo(() => {
        let result = companies.map(c => ({
            ...c,
            score: calculateScore(c, thesis)
        }))

        if (debouncedSearch) {
            const lower = debouncedSearch.toLowerCase()
            result = result.filter(c =>
                c.name.toLowerCase().includes(lower) ||
                c.sector.toLowerCase().includes(lower) ||
                c.description.toLowerCase().includes(lower) ||
                c.tags.some(t => t.toLowerCase().includes(lower))
            )
        }

        if (filters.sectors.length > 0) {
            result = result.filter(c => filters.sectors.includes(c.sector))
        }
        if (filters.stages.length > 0) {
            result = result.filter(c => filters.stages.includes(c.stage))
        }
        if (filters.geographies.length > 0) {
            result = result.filter(c => filters.geographies.includes(c.geography))
        }
        if (filters.hiringOnly) {
            result = result.filter(c => c.derivedSignals.some(s => s.type === "hiring" || s.type === "careers"))
        }

        result.sort((a, b) => {
            const aVal = a[sortField]
            const bVal = b[sortField]
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortParam === 'asc' ? aVal - bVal : bVal - aVal
            }
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortParam === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
            }
            return 0
        })

        return result
    }, [companies, thesis, debouncedSearch, filters, sortField, sortParam])

    const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
    const paginatedData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    // Bulk actions
    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds)
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelectedIds(next)
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedData.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(paginatedData.map(c => c.id)))
        }
    }

    const handleBulkAddToList = (listId: string) => {
        let added = 0
        selectedIds.forEach(id => {
            const list = lists.find(l => l.id === listId)
            if (list && !list.companyIds.includes(id)) {
                addToList(listId, id)
                added++
            }
        })
        toast.success(`Added ${added} companies to list`)
        setSelectedIds(new Set())
        setBulkListDialogOpen(false)
    }

    const handleBulkCreateAndAdd = () => {
        const name = bulkNewListName.trim()
        if (!name) return

        // Check for duplicates
        const exists = lists.some(l => l.name.toLowerCase() === name.toLowerCase())
        if (exists) {
            toast.error(`A list named "${name}" already exists.`)
            return
        }

        createList(name)
        // Find the newly created list
        setTimeout(() => {
            const newList = useListStore.getState().lists.find(l => l.name === name)
            if (newList) {
                selectedIds.forEach(id => addToList(newList.id, id))
            }
            toast.success(`Created "${name}" with ${selectedIds.size} companies`)
            setSelectedIds(new Set())
            setBulkListDialogOpen(false)
            setBulkNewListName("")
        }, 50)
    }

    const handleBulkExport = () => {
        const selected = companies.filter(c => selectedIds.has(c.id))
        const csvHeaders = ["Name", "Website", "Sector", "Stage", "Geography", "Score"]
        const csvRows = selected.map(c => [c.name, c.website, c.sector, c.stage, c.geography, calculateScore(c, thesis)])
        const csv = [csvHeaders, ...csvRows].map(r => r.join(",")).join("\n")
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "selected_companies.csv"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success(`Exported ${selected.length} companies`)
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight">Discovery</h1>
                    <p className="text-muted-foreground font-medium">Surface high-signal companies matching your thesis.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="rounded-full h-11 px-6 gap-2 border-muted-foreground/20 hover:border-primary/50 transition-all">
                                <SlidersHorizontal className="h-4 w-4" />
                                <span>Filters</span>
                                {(filters.sectors.length > 0 || filters.stages.length > 0 || filters.geographies.length > 0 || filters.hiringOnly) && (
                                    <div className="ml-1 h-5 w-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground font-black">
                                        {filters.sectors.length + filters.stages.length + filters.geographies.length + (filters.hiringOnly ? 1 : 0)}
                                    </div>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="overflow-y-auto sm:max-w-md">
                            <SheetHeader className="mb-8">
                                <SheetTitle className="text-2xl font-black tracking-tight">Faceted Filters</SheetTitle>
                                <SheetDescription className="text-base text-muted-foreground">Narrow results by sector, stage, geography, and signals.</SheetDescription>
                            </SheetHeader>
                            <CompanyFilters
                                filters={filters}
                                onChange={setFilters}
                                availableSectors={availableSectors}
                                availableStages={availableStages}
                                availableGeographies={availableGeographies}
                            />
                        </SheetContent>
                    </Sheet>
                    <Button variant="secondary" className="rounded-full h-11 px-6 font-bold gap-2" onClick={() => setSaveDialogOpen(true)}>
                        <Bookmark className="h-4 w-4" />
                        Save View
                    </Button>
                </div>
            </div>

            {/* Save View Dialog */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                            <Bookmark className="h-5 w-5 text-primary" />
                            Save Current View
                        </DialogTitle>
                        <DialogDescription>Save your current search and filters as a reusable view.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>View Name</Label>
                            <Input
                                placeholder="e.g. AI Startups - Series A"
                                value={viewName}
                                onChange={(e) => setViewName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveView()}
                                className="rounded-xl h-11"
                            />
                        </div>
                        {(searchTerm || filters.sectors.length > 0 || filters.stages.length > 0 || filters.geographies.length > 0 || filters.hiringOnly) && (
                            <div className="p-4 rounded-2xl bg-muted/50 space-y-2 text-sm">
                                <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Will be saved:</p>
                                {searchTerm && <p>Search: &quot;{searchTerm}&quot;</p>}
                                {filters.sectors.length > 0 && <p>Sectors: {filters.sectors.join(", ")}</p>}
                                {filters.stages.length > 0 && <p>Stages: {filters.stages.join(", ")}</p>}
                                {filters.geographies.length > 0 && <p>Geographies: {filters.geographies.join(", ")}</p>}
                                {filters.hiringOnly && <p>Hiring only: Yes</p>}
                            </div>
                        )}
                        <Button className="w-full rounded-full h-11 font-bold shadow-lg shadow-primary/10" onClick={handleSaveView}>Save View</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bulk Add to List Dialog */}
            <Dialog open={bulkListDialogOpen} onOpenChange={setBulkListDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-primary" />
                            Add {selectedIds.size} Companies to List
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 pt-2">
                        {lists.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Existing Lists</p>
                                {lists.map(list => (
                                    <button
                                        key={list.id}
                                        onClick={() => handleBulkAddToList(list.id)}
                                        className="w-full text-left p-4 rounded-2xl transition-all border bg-card hover:bg-muted border-muted/50 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FolderPlus className="h-4 w-4" />
                                            <span className="font-bold">{list.name}</span>
                                            <Badge variant="secondary" className="rounded-full text-[10px] px-2">{list.companyIds.length}</Badge>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="pt-3 border-t space-y-3">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Create New List</p>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="New list name"
                                    value={bulkNewListName}
                                    onChange={(e) => setBulkNewListName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleBulkCreateAndAdd()}
                                    className="rounded-xl h-11"
                                />
                                <Button className="rounded-xl h-11 px-6 shrink-0" onClick={handleBulkCreateAndAdd}>Create</Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-all group-focus-within:text-primary group-focus-within:scale-110" />
                    <Input
                        placeholder="Search by company, sector, tag, or description..."
                        className="pl-12 h-14 bg-card/50 backdrop-blur-sm rounded-[2rem] border-muted-foreground/10 focus-visible:ring-primary shadow-2xl text-lg font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="hidden lg:flex items-center gap-3 text-sm text-muted-foreground border-l pl-6 h-10 ml-2">
                    <span className="font-bold">{data.length}</span> results
                    {data.length !== companies.length && (
                        <span className="text-muted-foreground/50">of {companies.length}</span>
                    )}
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 animate-in slide-in-from-top-2 duration-300">
                    <Badge className="rounded-full bg-primary text-primary-foreground px-3 font-black">{selectedIds.size} selected</Badge>
                    <Button size="sm" variant="outline" className="rounded-full h-9 gap-2" onClick={() => setBulkListDialogOpen(true)}>
                        <FolderPlus className="h-3.5 w-3.5" />
                        Add to List
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full h-9 gap-2" onClick={handleBulkExport} id="export-button">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Export
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full h-9 ml-auto" onClick={() => setSelectedIds(new Set())}>
                        Clear Selection
                    </Button>
                </div>
            )}

            <div className="rounded-[2.5rem] border border-muted/50 bg-card/30 backdrop-blur-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow className="hover:bg-transparent border-muted/50">
                            <TableHead className="py-6 pl-6 pr-0 w-[40px]">
                                <button
                                    className="p-1 hover:bg-muted rounded-lg transition-colors"
                                    onClick={toggleSelectAll}
                                >
                                    {selectedIds.size === paginatedData.length && paginatedData.length > 0 ? (
                                        <CheckSquare className="h-4 w-4 text-primary" />
                                    ) : (
                                        <Square className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </button>
                            </TableHead>
                            <TableHead className="py-6 px-4">
                                <button className="flex items-center gap-2 font-black text-[11px] uppercase tracking-[0.15em] hover:text-primary transition-colors" onClick={() => handleSort('name')}>
                                    Company
                                    <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </TableHead>
                            <TableHead className="font-black text-[11px] uppercase tracking-[0.15em]">Sector</TableHead>
                            <TableHead className="font-black text-[11px] uppercase tracking-[0.15em] text-center">Stage</TableHead>
                            <TableHead className="font-black text-[11px] uppercase tracking-[0.15em]">Signals</TableHead>
                            <TableHead className="text-right px-10">
                                <button className="ml-auto flex items-center gap-2 font-black text-[11px] uppercase tracking-[0.15em] hover:text-primary transition-colors text-right justify-end w-full" onClick={() => handleSort('score')}>
                                    Score
                                    <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-72 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
                                            <Search className="h-10 w-10 opacity-10" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xl font-bold text-foreground">No matches found</p>
                                            <p className="text-sm">Try broadening your search or adjusting filters.</p>
                                        </div>
                                        <Button variant="outline" className="rounded-full" onClick={() => {
                                            setSearchTerm("");
                                            setFilters({ sectors: [], geographies: [], stages: [], hiringOnly: false });
                                            // Force immediate navigation reset if needed
                                            router.push('/companies');
                                        }}>Clear all filters</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((company) => (
                                <TableRow
                                    key={company.id}
                                    className={`group hover:bg-muted/40 transition-all border-muted/50 relative ${selectedIds.has(company.id) ? 'bg-primary/[0.03]' : ''}`}
                                >
                                    <TableCell className="pl-6 pr-0 w-[40px]">
                                        <button
                                            className="p-1 hover:bg-muted rounded-lg transition-colors"
                                            onClick={() => toggleSelect(company.id)}
                                        >
                                            {selectedIds.has(company.id) ? (
                                                <CheckSquare className="h-4 w-4 text-primary" />
                                            ) : (
                                                <Square className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground" />
                                            )}
                                        </button>
                                    </TableCell>
                                    <TableCell className="py-5 px-4 cursor-pointer" onClick={() => router.push(`/companies/${company.id}`)}>
                                        <div className="flex items-center gap-4">
                                            <CompanyLogo name={company.name} website={company.website} size="lg" />
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-base tracking-tight group-hover:text-primary transition-colors">{company.name}</span>
                                                    {company.watched && <Eye className="h-3 w-3 text-primary" />}
                                                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground/60 flex items-center gap-1.5 mt-0.5">
                                                    <Globe className="h-3 w-3" />
                                                    {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="rounded-full font-bold bg-primary/5 text-primary border-primary/10 text-[10px] px-3 py-1 tracking-wider uppercase">
                                            {company.sector}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="rounded-full text-[10px] font-bold px-4 py-1 uppercase tracking-widest border-muted-foreground/20 bg-background/50 backdrop-blur-md">{company.stage}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {company.derivedSignals.slice(0, 3).map((s, i) => (
                                                    <div key={i} className={`h-7 w-7 rounded-full border-2 border-background flex items-center justify-center transition-transform hover:z-10 hover:scale-125 ${s.type === 'hiring' || s.type === 'careers' ? 'bg-emerald-500' : s.type === 'funding' ? 'bg-amber-500' : s.type === 'press' ? 'bg-blue-500' : 'bg-slate-500'
                                                        }`} title={s.description || s.label}>
                                                        <Sparkles className="h-3 w-3 text-white" />
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest pl-1">
                                                {company.derivedSignals.length}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-10 cursor-pointer" onClick={() => router.push(`/companies/${company.id}`)}>
                                        <div className="flex items-center justify-end gap-4">
                                            <span className={`text-2xl font-black font-mono leading-none tracking-tighter ${company.score >= 80 ? 'text-primary' : 'text-foreground'}`}>
                                                {company.score}
                                            </span>
                                            <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                                                <div
                                                    className={`h-full transition-all duration-1000 ease-out ${company.score >= 80 ? 'bg-primary' : company.score >= 50 ? 'bg-primary/50' : 'bg-muted-foreground/30'}`}
                                                    style={{ width: `${company.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {data.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between px-10 py-5 border-t bg-muted/20">
                        <p className="text-sm text-muted-foreground">
                            Showing <span className="font-bold text-foreground">{(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, data.length)}</span> of <span className="font-bold text-foreground">{data.length}</span>
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Button variant="outline" size="sm" className="rounded-full h-8 w-8 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button key={page} variant={page === currentPage ? "default" : "ghost"} size="sm" className="rounded-full h-8 w-8 p-0 font-bold" onClick={() => setCurrentPage(page)}>
                                    {page}
                                </Button>
                            ))}
                            <Button variant="outline" size="sm" className="rounded-full h-8 w-8 p-0" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
