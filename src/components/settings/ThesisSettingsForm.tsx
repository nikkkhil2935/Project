"use client"

import { useState } from "react"
import { toast } from "sonner"
import { X, Target, SlidersHorizontal, Globe, MapPin, Activity, Sparkles, HelpCircle, Tag, Layers } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useThesisStore } from "@/lib/store/useThesisStore"
import { ThesisWeights } from "@/lib/types"

export function ThesisSettingsForm() {
    const thesis = useThesisStore()
    const [newSector, setNewSector] = useState("")
    const [newStage, setNewStage] = useState("")
    const [newGeo, setNewGeo] = useState("")
    const [newKeyword, setNewKeyword] = useState("")

    // Sector handlers
    const handleAddSector = () => {
        if (newSector.trim()) {
            if (!thesis.preferredSectors.includes(newSector.trim())) {
                thesis.setSectors([...thesis.preferredSectors, newSector.trim()])
                setNewSector("")
                toast.success(`Added sector: ${newSector.trim()}`)
            } else {
                toast.error("Sector already exists")
            }
        }
    }
    const removeSector = (sector: string) => {
        thesis.setSectors(thesis.preferredSectors.filter(s => s !== sector))
    }

    // Stage handlers
    const handleAddStage = () => {
        if (newStage.trim()) {
            if (!thesis.preferredStages.includes(newStage.trim())) {
                thesis.setStages([...thesis.preferredStages, newStage.trim()])
                setNewStage("")
                toast.success(`Added stage: ${newStage.trim()}`)
            } else {
                toast.error("Stage already exists")
            }
        }
    }
    const removeStage = (stage: string) => {
        thesis.setStages(thesis.preferredStages.filter(s => s !== stage))
    }

    // Geography handlers
    const handleAddGeo = () => {
        if (newGeo.trim()) {
            if (!thesis.preferredGeographies.includes(newGeo.trim())) {
                thesis.setGeographies([...thesis.preferredGeographies, newGeo.trim()])
                setNewGeo("")
                toast.success(`Added geography: ${newGeo.trim()}`)
            } else {
                toast.error("Geography already exists")
            }
        }
    }
    const removeGeo = (geo: string) => {
        thesis.setGeographies(thesis.preferredGeographies.filter(g => g !== geo))
    }

    // Keyword handlers
    const handleAddKeyword = () => {
        if (newKeyword.trim()) {
            if (!thesis.keywords.includes(newKeyword.trim())) {
                thesis.setKeywords([...thesis.keywords, newKeyword.trim()])
                setNewKeyword("")
                toast.success(`Added keyword: ${newKeyword.trim()}`)
            } else {
                toast.error("Keyword already exists")
            }
        }
    }
    const removeKeyword = (kw: string) => {
        thesis.setKeywords(thesis.keywords.filter(k => k !== kw))
    }

    const handleWeightChange = (key: keyof ThesisWeights, val: number[]) => {
        thesis.setWeights({
            ...thesis.weights,
            [key]: val[0]
        })
    }

    const resetWeights = () => {
        thesis.setWeights({
            sectorMatch: 25,
            stageMatch: 20,
            geographyMatch: 15,
            hiringDetected: 15,
            signalsPresent: 15,
            keywordOverlap: 10
        })
        toast.info("Weights reset to default values.")
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-in fade-in duration-700">
            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight">Investment Thesis</h1>
                <p className="text-muted-foreground text-lg">Define your mandates to surface higher quality deals.</p>
            </div>

            <div className="grid gap-8">
                {/* Sector Preferences */}
                <Card className="rounded-3xl shadow-xl shadow-secondary/10 border-muted/50 overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardHeader className="bg-muted/30 pb-6 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Target Sectors
                        </CardTitle>
                        <CardDescription>Sectors you actively want to invest in.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                            {thesis.preferredSectors.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No sectors defined yet.</p>
                            )}
                            {thesis.preferredSectors.map((sector) => (
                                <Badge key={sector} variant="secondary" className="rounded-full px-4 py-1.5 gap-2 border-primary/10 transition-all hover:bg-secondary">
                                    {sector}
                                    <button onClick={() => removeSector(sector)} className="hover:text-destructive transition-colors">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2 p-1 bg-muted/50 rounded-full border">
                            <Input
                                placeholder="Add sector (e.g. Fintech, AI/ML)"
                                value={newSector}
                                onChange={(e) => setNewSector(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSector()}
                                className="rounded-full border-none bg-transparent focus-visible:ring-0 h-11"
                            />
                            <Button onClick={handleAddSector} className="rounded-full shrink-0 h-11 px-6 shadow-md transition-all hover:scale-105">Add</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stage Preferences */}
                <Card className="rounded-3xl shadow-xl shadow-secondary/10 border-muted/50 overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardHeader className="bg-muted/30 pb-6 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" />
                            Preferred Stages
                        </CardTitle>
                        <CardDescription>Investment stages you target (e.g. Seed, Series A).</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                            {thesis.preferredStages.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No stages defined yet.</p>
                            )}
                            {thesis.preferredStages.map((stage) => (
                                <Badge key={stage} variant="secondary" className="rounded-full px-4 py-1.5 gap-2 border-primary/10 transition-all hover:bg-secondary">
                                    {stage}
                                    <button onClick={() => removeStage(stage)} className="hover:text-destructive transition-colors">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2 p-1 bg-muted/50 rounded-full border">
                            <Input
                                placeholder="Add stage (e.g. Pre-seed, Seed)"
                                value={newStage}
                                onChange={(e) => setNewStage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
                                className="rounded-full border-none bg-transparent focus-visible:ring-0 h-11"
                            />
                            <Button onClick={handleAddStage} className="rounded-full shrink-0 h-11 px-6 shadow-md transition-all hover:scale-105">Add</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Geography Preferences */}
                <Card className="rounded-3xl shadow-xl shadow-secondary/10 border-muted/50 overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardHeader className="bg-muted/30 pb-6 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Preferred Geographies
                        </CardTitle>
                        <CardDescription>Regions and cities you focus on for sourcing deals.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                            {thesis.preferredGeographies.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No geographies defined yet.</p>
                            )}
                            {thesis.preferredGeographies.map((geo) => (
                                <Badge key={geo} variant="secondary" className="rounded-full px-4 py-1.5 gap-2 border-primary/10 transition-all hover:bg-secondary">
                                    {geo}
                                    <button onClick={() => removeGeo(geo)} className="hover:text-destructive transition-colors">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2 p-1 bg-muted/50 rounded-full border">
                            <Input
                                placeholder="Add geography (e.g. London, Bangalore)"
                                value={newGeo}
                                onChange={(e) => setNewGeo(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddGeo()}
                                className="rounded-full border-none bg-transparent focus-visible:ring-0 h-11"
                            />
                            <Button onClick={handleAddGeo} className="rounded-full shrink-0 h-11 px-6 shadow-md transition-all hover:scale-105">Add</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Keywords */}
                <Card className="rounded-3xl shadow-xl shadow-secondary/10 border-muted/50 overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardHeader className="bg-muted/30 pb-6 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-primary" />
                            Target Keywords
                        </CardTitle>
                        <CardDescription>Keywords that indicate strong thesis alignment in company descriptions.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                            {thesis.keywords.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No keywords defined yet.</p>
                            )}
                            {thesis.keywords.map((kw) => (
                                <Badge key={kw} variant="outline" className="rounded-full px-4 py-1.5 gap-2 transition-all hover:bg-muted">
                                    #{kw}
                                    <button onClick={() => removeKeyword(kw)} className="hover:text-destructive transition-colors">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2 p-1 bg-muted/50 rounded-full border">
                            <Input
                                placeholder="Add keyword (e.g. agent, automation)"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                                className="rounded-full border-none bg-transparent focus-visible:ring-0 h-11"
                            />
                            <Button onClick={handleAddKeyword} className="rounded-full shrink-0 h-11 px-6 shadow-md transition-all hover:scale-105">Add</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Weights Selection */}
                <Card className="rounded-3xl shadow-xl shadow-secondary/10 border-muted/50 overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardHeader className="bg-muted/30 pb-6 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <SlidersHorizontal className="h-5 w-5 text-primary" />
                            Scoring Weights
                        </CardTitle>
                        <CardDescription>Adjust the sensitivity of ScoutScore signals.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                        <div className="grid sm:grid-cols-2 gap-6">
                            {[
                                { id: 'sectorMatch', label: 'Sector Match', icon: Globe },
                                { id: 'stageMatch', label: 'Stage Match', icon: Target },
                                { id: 'geographyMatch', label: 'Geography Match', icon: MapPin },
                                { id: 'hiringDetected', label: 'Hiring Signal', icon: Activity },
                                { id: 'signalsPresent', label: 'Overall Proactivity', icon: Sparkles },
                                { id: 'keywordOverlap', label: 'Keyword Overlap', icon: HelpCircle },
                            ].map((item) => (
                                <div key={item.id} className="space-y-4 p-5 rounded-2xl border bg-card hover:border-primary/20 transition-all group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5 text-sm font-bold">
                                            <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                                                <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                            {item.label}
                                        </div>
                                        <div className="px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/10">
                                            <span className="font-mono text-sm font-black text-primary">
                                                {thesis.weights[item.id as keyof ThesisWeights]}%
                                            </span>
                                        </div>
                                    </div>
                                    <Slider
                                        value={[thesis.weights[item.id as keyof ThesisWeights]]}
                                        max={50} step={1}
                                        onValueChange={(val: number[]) => handleWeightChange(item.id as keyof ThesisWeights, val)}
                                        className="py-4"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="p-4 rounded-2xl bg-secondary/30 border border-dashed border-muted-foreground/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <HelpCircle className="h-5 w-5 text-primary/60" />
                                <span>Weights determine the contribution to the final Match %</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5 rounded-full px-4" onClick={resetWeights}>Reset to Defaults</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-center md:justify-end py-4">
                    <Button size="lg" className="rounded-full shadow-2xl shadow-primary/30 px-16 h-14 text-lg font-bold hover:scale-105 transition-transform" onClick={() => toast.success("Thesis configuration saved locally")}>
                        Save Configuration
                    </Button>
                </div>
            </div>
        </div>
    )
}
