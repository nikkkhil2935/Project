"use client"

import { useRouter } from "next/navigation"
import { useSavedSearchStore } from "@/lib/store/useSavedSearchStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Trash2, Search, Calendar, Filter, Command } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function SavedSearchesPage() {
    const router = useRouter()
    const searches = useSavedSearchStore((state) => state.searches)
    const deleteSearch = useSavedSearchStore((state) => state.deleteSearch)

    const handleExecute = (search: typeof searches[0]) => {
        // Build query params from saved search
        const params = new URLSearchParams()
        if (search.query) params.set("q", search.query)
        if (search.filters.sectors.length > 0) params.set("sectors", search.filters.sectors.join(","))
        if (search.filters.stages.length > 0) params.set("stages", search.filters.stages.join(","))
        if (search.filters.geographies.length > 0) params.set("geographies", search.filters.geographies.join(","))
        if (search.filters.hiringOnly) params.set("hiring", "true")

        toast.success(`Executing "${search.name}"`)
        router.push(`/companies?${params.toString()}`)
    }

    const handleDelete = (id: string, name: string) => {
        deleteSearch(id)
        toast.success(`Deleted "${name}"`)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight">Saved Views</h1>
                <p className="text-muted-foreground">Persisted search criteria and filtering patterns.</p>
            </div>

            {searches.length === 0 ? (
                <div className="h-96 rounded-[3rem] border border-dashed flex flex-col items-center justify-center text-muted-foreground space-y-4">
                    <Search className="h-12 w-12 opacity-10" />
                    <div className="text-center">
                        <p className="font-bold text-foreground">No saved views</p>
                        <p className="text-sm">Apply filters in Discovery and click &quot;Save View&quot; to save your search.</p>
                    </div>
                    <Button variant="outline" className="rounded-full" onClick={() => router.push("/companies")}>
                        Go to Discovery
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {searches.map(search => (
                        <Card key={search.id} className="rounded-[2rem] shadow-xl border-muted/50 overflow-hidden bg-card/50 backdrop-blur-sm group hover:border-primary/20 transition-all">
                            <CardHeader className="pb-4 bg-muted/20">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-black">{search.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(parseInt(search.id)).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive group-hover:bg-background" onClick={() => handleDelete(search.id, search.name)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 rounded-lg bg-secondary">
                                            <Command className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Query Content</span>
                                            <p className="text-sm font-medium">{search.query || <span className="text-muted-foreground/30 italic">No text query applied</span>}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 rounded-lg bg-secondary">
                                            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Applied Logic</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {search.filters.sectors.length > 0 && search.filters.sectors.map(s => <Badge key={s} variant="outline" className="text-[10px] rounded-full">{s}</Badge>)}
                                                {search.filters.stages.length > 0 && search.filters.stages.map(s => <Badge key={s} variant="outline" className="text-[10px] rounded-full">{s}</Badge>)}
                                                {search.filters.hiringOnly && <Badge variant="default" className="text-[10px] rounded-full bg-primary/10 text-primary border-primary/20">Hiring: Active</Badge>}
                                                {search.filters.sectors.length === 0 && search.filters.stages.length === 0 && !search.filters.hiringOnly && (
                                                    <span className="text-sm text-muted-foreground/30 italic">No specific filters</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full rounded-full h-11 font-bold shadow-lg shadow-primary/10" onClick={() => handleExecute(search)}>
                                    <Play className="w-3.5 h-3.5 mr-2" /> Execute Search
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
