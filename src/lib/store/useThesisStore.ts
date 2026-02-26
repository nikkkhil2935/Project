import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

    // Actions
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
    signalsPresent: 10, // Max 80 so far, remaining 20 is "strong language match" done dynamically
};

export const useThesisStore = create<ThesisState>()(
    persist(
        (set) => ({
            preferredSectors: ['Enterprise SaaS', 'Developer Tools', 'AI/ML', 'Healthcare'],
            preferredStages: ['Seed', 'Series A'],
            preferredGeographies: ['San Francisco', 'New York', 'Remote'],
            keywords: ['LLM', 'agent', 'automation', 'open source', 'infrastructure'],
            excludedSectors: ['Crypto', 'Web3', 'Consumer Social'],
            weights: defaultWeights,

            setSectors: (sectors) => set({ preferredSectors: sectors }),
            setStages: (stages) => set({ preferredStages: stages }),
            setGeographies: (geographies) => set({ preferredGeographies: geographies }),
            setKeywords: (keywords) => set({ keywords: keywords }),
            setWeights: (weights) => set({ weights: weights }),
        }),
        {
            name: 'thesis-storage',
        }
    )
)
