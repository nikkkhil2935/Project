import { create } from 'zustand'
import { Company, CompanyNote, PipelineStage } from '../types'
import { mockCompanies } from '../data/mockCompanies'
import { createClient } from '../supabase/client'

export interface CompanyState {
    companies: Company[];
    loaded: boolean;

    fetchCompanies: () => Promise<void>;
    addCompany: (company: Company) => void;
    updateCompany: (id: string, updates: Partial<Company>) => void;
    getCompany: (id: string) => Company | undefined;
    addNote: (companyId: string, text: string) => void;
    deleteNote: (companyId: string, noteId: string) => void;
    setPipelineStage: (companyId: string, stage: PipelineStage) => void;
    toggleWatch: (companyId: string) => void;
    acceptTag: (companyId: string, tag: string) => void;
    dismissTag: (companyId: string, tag: string) => void;
    deleteCompany: (companyId: string) => void;
}

// Transform DB row to Company type
function rowToCompany(row: any): Company {
    return {
        id: row.id,
        name: row.name,
        website: row.website,
        logoUrl: row.logo_url,
        description: row.description,
        stage: row.stage,
        sector: row.sector,
        geography: row.geography,
        tags: row.tags || [],
        derivedSignals: row.derived_signals || [],
        lastEnriched: row.last_enriched,
        enrichedSummary: row.enriched_summary,
        enrichedWhatTheyDo: row.enriched_what_they_do || [],
        enrichedKeywords: row.enriched_keywords || [],
        enrichmentSources: row.enrichment_sources || [],
        enrichmentModel: row.enrichment_model,
        enrichmentHistory: row.enrichment_history || [],
        suggestedTags: row.suggested_tags || [],
        notes: row.notes || [],
        pipelineStage: row.pipeline_stage || 'new',
        watched: row.watched || false,
    }
}

// Transform Company to DB row
function companyToRow(company: Partial<Company>, userId?: string) {
    const row: any = {}
    if (userId) row.user_id = userId
    if (company.name !== undefined) row.name = company.name
    if (company.website !== undefined) row.website = company.website
    if (company.logoUrl !== undefined) row.logo_url = company.logoUrl
    if (company.description !== undefined) row.description = company.description
    if (company.stage !== undefined) row.stage = company.stage
    if (company.sector !== undefined) row.sector = company.sector
    if (company.geography !== undefined) row.geography = company.geography
    if (company.tags !== undefined) row.tags = company.tags
    if (company.derivedSignals !== undefined) row.derived_signals = company.derivedSignals
    if (company.lastEnriched !== undefined) row.last_enriched = company.lastEnriched
    if (company.enrichedSummary !== undefined) row.enriched_summary = company.enrichedSummary
    if (company.enrichedWhatTheyDo !== undefined) row.enriched_what_they_do = company.enrichedWhatTheyDo
    if (company.enrichedKeywords !== undefined) row.enriched_keywords = company.enrichedKeywords
    if (company.enrichmentSources !== undefined) row.enrichment_sources = company.enrichmentSources
    if (company.enrichmentModel !== undefined) row.enrichment_model = company.enrichmentModel
    if (company.enrichmentHistory !== undefined) row.enrichment_history = company.enrichmentHistory
    if (company.suggestedTags !== undefined) row.suggested_tags = company.suggestedTags
    if (company.notes !== undefined) row.notes = company.notes
    if (company.pipelineStage !== undefined) row.pipeline_stage = company.pipelineStage
    if (company.watched !== undefined) row.watched = company.watched
    return row
}

export const useCompanyStore = create<CompanyState>()(
    (set, get) => ({
        companies: [],
        loaded: false,

        fetchCompanies: async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching companies:', error)
                // Fallback to mock data on error
                set({ companies: mockCompanies, loaded: true })
                return
            }

            if (data && data.length > 0) {
                set({ companies: data.map(rowToCompany), loaded: true })
            } else {
                // First time user: seed with mock data
                const seedPromises = mockCompanies.map(async (company) => {
                    const row = companyToRow(company, user.id)
                    return supabase.from('companies').insert(row).select().single()
                })
                const results = await Promise.all(seedPromises)
                const seeded = results
                    .filter(r => r.data)
                    .map(r => rowToCompany(r.data))
                set({ companies: seeded.length > 0 ? seeded : mockCompanies, loaded: true })
            }
        },

        addCompany: (company) => {
            // Optimistic update
            set((state) => ({
                companies: [{ ...company, pipelineStage: company.pipelineStage || 'new' }, ...state.companies]
            }))

            // Persist to Supabase
            const persist = async () => {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const row = companyToRow(company, user.id)
                const { data, error } = await supabase.from('companies').insert(row).select().single()
                if (data) {
                    // Update with server-generated ID
                    set((state) => ({
                        companies: state.companies.map(c =>
                            c.id === company.id ? rowToCompany(data) : c
                        )
                    }))
                }
            }
            persist()
        },

        updateCompany: (id, updates) => {
            set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === id ? { ...c, ...updates } : c
                )
            }))

            const persist = async () => {
                const supabase = createClient()
                const row = companyToRow(updates)
                await supabase.from('companies').update(row).eq('id', id)
            }
            persist()
        },

        getCompany: (id) => {
            return get().companies.find(c => c.id === id);
        },

        addNote: (companyId, text) => {
            const newNote: CompanyNote = {
                id: Date.now().toString(),
                text,
                createdAt: new Date().toISOString(),
                author: 'Analyst'
            }

            set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === companyId ? {
                        ...c,
                        notes: [...(c.notes || []), newNote]
                    } : c
                )
            }))

            const persist = async () => {
                const company = get().companies.find(c => c.id === companyId)
                if (!company) return
                const supabase = createClient()
                await supabase.from('companies').update({ notes: company.notes }).eq('id', companyId)
            }
            persist()
        },

        deleteNote: (companyId, noteId) => {
            set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === companyId ? {
                        ...c,
                        notes: (c.notes || []).filter(n => n.id !== noteId)
                    } : c
                )
            }))

            const persist = async () => {
                const company = get().companies.find(c => c.id === companyId)
                if (!company) return
                const supabase = createClient()
                await supabase.from('companies').update({ notes: company.notes }).eq('id', companyId)
            }
            persist()
        },

        setPipelineStage: (companyId, stage) => {
            set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === companyId ? { ...c, pipelineStage: stage } : c
                )
            }))

            const supabase = createClient()
            supabase.from('companies').update({ pipeline_stage: stage }).eq('id', companyId).then()
        },

        toggleWatch: (companyId) => {
            const company = get().companies.find(c => c.id === companyId)
            const newWatched = !(company?.watched)

            set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === companyId ? { ...c, watched: newWatched } : c
                )
            }))

            const supabase = createClient()
            supabase.from('companies').update({ watched: newWatched }).eq('id', companyId).then()
        },

        acceptTag: (companyId, tag) => {
            set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === companyId ? {
                        ...c,
                        tags: [...c.tags, tag],
                        suggestedTags: (c.suggestedTags || []).filter(t => t !== tag)
                    } : c
                )
            }))

            const persist = async () => {
                const company = get().companies.find(c => c.id === companyId)
                if (!company) return
                const supabase = createClient()
                await supabase.from('companies').update({
                    tags: company.tags,
                    suggested_tags: company.suggestedTags
                }).eq('id', companyId)
            }
            persist()
        },

        dismissTag: (companyId, tag) => {
            set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === companyId ? {
                        ...c,
                        suggestedTags: (c.suggestedTags || []).filter(t => t !== tag)
                    } : c
                )
            }))

            const persist = async () => {
                const company = get().companies.find(c => c.id === companyId)
                if (!company) return
                const supabase = createClient()
                await supabase.from('companies').update({ suggested_tags: company.suggestedTags }).eq('id', companyId)
            }
            persist()
        },

        deleteCompany: (companyId) => {
            set((state) => ({
                companies: state.companies.filter(c => c.id !== companyId)
            }))

            const supabase = createClient()
            supabase.from('companies').delete().eq('id', companyId).then()
        },
    })
)
