export interface CompanySignal {
    type: string;
    label?: string;
    title?: string;
    description?: string;
    sourceUrl?: string;
    detectedAt: string; // ISO string
    date?: string; // Sometimes AI returns 'date'
}

export interface CompanyNote {
    id: string;
    text: string;
    createdAt: string;
    author: string;
}

export interface EnrichmentSource {
    url: string;
    scrapedAt: string;
    contentLength: number;
}

export interface EnrichmentRun {
    id: string;
    enrichedAt: string;
    model: string;
    summary: string;
    whatTheyDo: string[];
    keywords: string[];
    signals: CompanySignal[];
    sources: EnrichmentSource[];
}

export type PipelineStage = 'new' | 'reviewing' | 'diligence' | 'passed' | 'invested';

export interface Company {
    id: string;
    name: string;
    website: string;
    logoUrl?: string;
    description: string;
    stage: 'Pre-seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C+';
    sector: string;
    geography: string;
    tags: string[]; // e.g. ["open source", "LLM", "DevTools"]
    derivedSignals: CompanySignal[];
    lastEnriched?: string;

    // Enrichment data populated via LLM later
    enrichedSummary?: string;
    enrichedWhatTheyDo?: string[];
    enrichedKeywords?: string[];
    enrichmentSources?: EnrichmentSource[];
    enrichmentModel?: string;
    enrichmentHistory?: EnrichmentRun[];

    // Suggested tags from AI (pending user acceptance)
    suggestedTags?: string[];

    // Notes
    notes?: CompanyNote[];

    // Pipeline & tracking
    pipelineStage?: PipelineStage;
    watched?: boolean;
}

export interface ThesisWeights {
    sectorMatch: number;
    stageMatch: number;
    geographyMatch: number;
    hiringDetected: number;
    keywordOverlap: number;
    signalsPresent: number;
}
