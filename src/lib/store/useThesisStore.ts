import { create } from 'zustand'
import { createClient } from '../supabase/client'

export interface ThesisWeights {
    sectorMatch: number;
    stageMatch: number;
    geographyMatch: number;
    hiringDetected: number;
    keywordOverlap: number;
    signalsPresent: number;
}

export interface ThesisState {
    preferredSectors: string[];
    preferredStages: string[];
    preferredGeographies: string[];
    keywords: string[];
    excludedSectors: string[];
    weights: ThesisWeights;
    loaded: boolean;

    // Actions
    fetchThesis: () => Promise<void>;
    setSectors: (sectors: string[]) => void;
    setStages: (stages: string[]) => void;
    setGeographies: (geographies: string[]) => void;
    setKeywords: (keywords: string[]) => void;
    setWeights: (weights: ThesisWeights) => void;
}

const defaultWeights: ThesisWeights = {
    sectorMatch: 20,
    stageMatch: 15,
    geographyMatch: 10,
    hiringDetected: 10,
    keywordOverlap: 15,
    signalsPresent: 10,
};

const defaults = {
    preferredSectors: ['Enterprise SaaS', 'Developer Tools', 'AI/ML', 'Healthcare'],
    preferredStages: ['Seed', 'Series A'],
    preferredGeographies: ['San Francisco', 'New York', 'Remote'],
    keywords: ['LLM', 'agent', 'automation', 'open source', 'infrastructure'],
    excludedSectors: ['Crypto', 'Web3', 'Consumer Social'],
    weights: defaultWeights,
}

async function upsertThesis(field: string, value: any) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
        .from('thesis_config')
        .upsert({ user_id: user.id, [field]: value }, { onConflict: 'user_id' })
}

export const useThesisStore = create<ThesisState>()(
    (set) => ({
        ...defaults,
        loaded: false,

        fetchThesis: async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                set({ loaded: true })
                return
            }

            const { data, error } = await supabase
                .from('thesis_config')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (error || !data) {
                // First time: insert defaults
                await supabase.from('thesis_config').insert({
                    user_id: user.id,
                    preferred_sectors: defaults.preferredSectors,
                    preferred_stages: defaults.preferredStages,
                    preferred_geographies: defaults.preferredGeographies,
                    keywords: defaults.keywords,
                    excluded_sectors: defaults.excludedSectors,
                    weights: defaults.weights,
                })
                set({ ...defaults, loaded: true })
                return
            }

            set({
                preferredSectors: data.preferred_sectors || defaults.preferredSectors,
                preferredStages: data.preferred_stages || defaults.preferredStages,
                preferredGeographies: data.preferred_geographies || defaults.preferredGeographies,
                keywords: data.keywords || defaults.keywords,
                excludedSectors: data.excluded_sectors || defaults.excludedSectors,
                weights: data.weights || defaults.weights,
                loaded: true,
            })
        },

        setSectors: (sectors) => {
            set({ preferredSectors: sectors })
            upsertThesis('preferred_sectors', sectors)
        },

        setStages: (stages) => {
            set({ preferredStages: stages })
            upsertThesis('preferred_stages', stages)
        },

        setGeographies: (geographies) => {
            set({ preferredGeographies: geographies })
            upsertThesis('preferred_geographies', geographies)
        },

        setKeywords: (keywords) => {
            set({ keywords: keywords })
            upsertThesis('keywords', keywords)
        },

        setWeights: (weights) => {
            set({ weights: weights })
            upsertThesis('weights', weights)
        },
    })
)
