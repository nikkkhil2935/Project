"use client"

import { useState } from "react"
import { useListStore } from "@/lib/store/useListStore"
import { useCompanyStore } from "@/lib/store/useCompanyStore"
import { calculateScore } from "@/lib/scoring"
import { useThesisStore } from "@/lib/store/useThesisStore"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownToLine, Trash2, FolderPlus, Building2, Pencil, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function ListsPage() {
    const lists = useListStore((state) => state.lists)
    const deleteList = useListStore((state) => state.deleteList)
    const createList = useListStore((state) => state.createList)
    const renameList = useListStore((state) => state.renameList)
    const removeFromList = useListStore((state) => state.removeFromList)
    const router = useRouter()

    const getCompany = useCompanyStore((state) => state.getCompany)
    const thesis = useThesisStore()

    const [activeListId, setActiveListId] = useState<string | null>(lists.length > 0 ? lists[0].id : null)

    // New list dialog
    const [newListDialogOpen, setNewListDialogOpen] = useState(false)
    const [newListName, setNewListName] = useState("")

    // Rename dialog
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [renameValue, setRenameValue] = useState("")

    const activeList = lists.find(l => l.id === activeListId)

    const companiesInList = activeList
        ? activeList.companyIds.map(id => getCompany(id)).filter(c => c !== undefined)
        : []

    const handleCreateList = () => {
        if (!newListName.trim()) {
            toast.error("Enter a list name")
            return
        }
        createList(newListName.trim())
        toast.success(`Created "${newListName.trim()}"`)
        setNewListName("")
        setNewListDialogOpen(false)
    }

    const handleRename = () => {
        if (!renameValue.trim() || !activeListId) return
        renameList(activeListId, renameValue.trim())
        toast.success("List renamed")
        setRenameDialogOpen(false)
    }

    const handleDeleteList = () => {
        if (!activeListId) return
        const name = activeList?.name
        deleteList(activeListId)
        setActiveListId(lists.length > 1 ? lists.find(l => l.id !== activeListId)?.id || null : null)
        toast.success(`Deleted "${name}"`)
    }

    const handleExportCSV = () => {
        if (!activeList || companiesInList.length === 0) return;

        const headers = ["Name", "Website", "Sector", "Stage", "Tags", "Match Score"]
        const rows = companiesInList.map(c => [
            c!.name,
            c!.website,
            c!.sector,
            c!.stage,
            c!.tags.join("; "),
            calculateScore(c!, thesis)
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers, ...rows].map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `${activeList.name.toLowerCase().replace(/\s+/g, "_")}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("CSV exported!")
    }

    const handleExportJSON = () => {
        if (!activeList || companiesInList.length === 0) return;

        const jsonData = companiesInList.map(c => ({
            name: c!.name,
            website: c!.website,
            sector: c!.sector,
            stage: c!.stage,
            geography: c!.geography,
            tags: c!.tags,
            matchScore: calculateScore(c!, thesis),
            description: c!.description,
        }))

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `${activeList.name.toLowerCase().replace(/\s+/g, "_")}.json`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success("JSON exported!")
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight">Collections</h1>
                    <p className="text-muted-foreground">Manage your sourced company pipelines.</p>
                </div>
                <Button className="rounded-full gap-2 shadow-lg shadow-primary/10" onClick={() => setNewListDialogOpen(true)}>
                    <FolderPlus className="h-4 w-4" />
                    New List
                </Button>
            </div>

            {/* New List Dialog */}
            <Dialog open={newListDialogOpen} onOpenChange={setNewListDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-primary" />
                            Create New List
                        </DialogTitle>
                        <DialogDescription>Create a list to organize companies from your discovery pipeline.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>List Name</Label>
                            <Input
                                placeholder="e.g. Top Picks Q1 2026"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                                className="rounded-xl h-11"
                                autoFocus
                            />
                        </div>
                        <Button className="w-full rounded-full h-11 font-bold shadow-lg shadow-primary/10" onClick={handleCreateList}>
                            Create List
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rename Dialog */}
            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-primary" />
                            Rename List
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>New Name</Label>
                            <Input
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                className="rounded-xl h-11"
                                autoFocus
                            />
                        </div>
                        <Button className="w-full rounded-full h-11 font-bold" onClick={handleRename}>Save</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="grid md:grid-cols-4 gap-8">
                {/* Sidebar Cards */}
                <div className="space-y-3">
                    {lists.length === 0 ? (
                        <Card className="p-6 border-dashed text-center space-y-2 rounded-[2rem]">
                            <CardDescription>No collections found</CardDescription>
                            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setNewListDialogOpen(true)}>Create one</Button>
                        </Card>
                    ) : (
                        lists.map(list => (
                            <button
                                key={list.id}
                                onClick={() => setActiveListId(list.id)}
                                className={`w-full text-left p-4 rounded-3xl transition-all border ${activeListId === list.id
                                    ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105 border-primary'
                                    : 'bg-card hover:bg-muted border-muted/50'
                                    }`}
                            >
                                <div className="font-bold flex items-center justify-between">
                                    <span className="truncate">{list.name}</span>
                                    <Badge variant={activeListId === list.id ? "outline" : "secondary"} className="rounded-full bg-white/10 border-none px-2">
                                        {list.companyIds.length}
                                    </Badge>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="md:col-span-3">
                    {activeList ? (
                        <div className="space-y-6">
                            <Card className="rounded-[2.5rem] shadow-xl border-muted/50 overflow-hidden bg-card/50 backdrop-blur-sm">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8 bg-muted/20">
                                    <div className="space-y-1">
                                        <CardTitle className="text-2xl font-black">{activeList.name}</CardTitle>
                                        <CardDescription>{companiesInList.length} targets identified</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground" onClick={() => { setRenameValue(activeList.name); setRenameDialogOpen(true) }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive" onClick={handleDeleteList}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" className="rounded-full h-10 px-4 gap-2" onClick={handleExportCSV}>
                                            <ArrowDownToLine className="h-4 w-4" />
                                            CSV
                                        </Button>
                                        <Button size="sm" variant="outline" className="rounded-full h-10 px-4 gap-2" onClick={handleExportJSON}>
                                            <ArrowDownToLine className="h-4 w-4" />
                                            JSON
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-muted/10">
                                            <TableRow className="border-muted/50">
                                                <TableHead className="py-4 pl-8">Company</TableHead>
                                                <TableHead>Sector</TableHead>
                                                <TableHead className="text-right pr-8 font-bold">Score</TableHead>
                                                <TableHead className="w-[80px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {companiesInList.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-48 text-center text-muted-foreground italic">
                                                        No companies in this collection yet. Go to Discovery to add some.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                companiesInList.map((c) => (
                                                    <TableRow key={c!.id} className="group border-muted/50 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => router.push(`/companies/${c!.id}`)}>
                                                        <TableCell className="py-5 pl-8">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center border">
                                                                    <Building2 className="h-4 w-4 text-muted-foreground opacity-30" />
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold">{c!.name}</span>
                                                                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="rounded-full bg-secondary px-3 py-0.5 text-[10px] font-bold border-none">
                                                                {c!.sector}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right pr-8">
                                                            <span className="font-mono font-black text-primary bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                                                                {calculateScore(c!, thesis)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="pr-8">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => { e.stopPropagation(); removeFromList(activeList.id, c!.id) }}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-96 rounded-[3rem] border border-dashed flex flex-col items-center justify-center text-muted-foreground space-y-4">
                            <FolderPlus className="h-12 w-12 opacity-10" />
                            <p className="font-medium">Pick a list to explore findings</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
