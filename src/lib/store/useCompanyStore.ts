import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Company, CompanyNote, PipelineStage } from '../types'
import { mockCompanies } from '../data/mockCompanies'

export interface CompanyState {
    companies: Company[];

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

export const useCompanyStore = create<CompanyState>()(
    persist(
        (set, get) => ({
            companies: mockCompanies,

            addCompany: (company) => set((state) => ({
                companies: [...state.companies, { ...company, pipelineStage: company.pipelineStage || 'new' }]
            })),

            updateCompany: (id, updates) => set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === id ? { ...c, ...updates } : c
                )
            })),

            getCompany: (id) => {
                return get().companies.find(c => c.id === id);
            },

            addNote: (companyId, text) => set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === companyId ? {
                        ...c,
                        notes: [...(c.notes || []), {
                            id: Date.now().toString(),
                            text,
                            createdAt: new Date().toISOString(),
                            author: 'Analyst'
                        }]
                    } : c
                )
            })),

            deleteNote: (companyId, noteId) => set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === companyId ? {
                        ...c,
                        notes: (c.notes || []).filter(n => n.id !== noteId)
                    } : c
                )
            })),

            setPipelineStage: (companyId, stage) => set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === companyId ? { ...c, pipelineStage: stage } : c
                )
            })),

            toggleWatch: (companyId) => set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === companyId ? { ...c, watched: !c.watched } : c
                )
            })),

            acceptTag: (companyId, tag) => set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === companyId ? {
                        ...c,
                        tags: [...c.tags, tag],
                        suggestedTags: (c.suggestedTags || []).filter(t => t !== tag)
                    } : c
                )
            })),

            dismissTag: (companyId, tag) => set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === companyId ? {
                        ...c,
                        suggestedTags: (c.suggestedTags || []).filter(t => t !== tag)
                    } : c
                )
            })),

            deleteCompany: (companyId) => set((state) => ({
                companies: state.companies.filter(c => c.id !== companyId)
            })),
        }),
        {
            name: 'company-storage',
        }
    )
)
