import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FilterState {
    sectors: string[];
    geographies: string[];
    stages: string[];
    hiringOnly: boolean;
}

export interface SavedSearch {
    id: string;
    name: string;
    query: string;
    filters: FilterState;
}

interface SavedSearchState {
    searches: SavedSearch[];

    saveSearch: (name: string, query: string, filters: FilterState) => void;
    deleteSearch: (id: string) => void;
}

export const useSavedSearchStore = create<SavedSearchState>()(
    persist(
        (set) => ({
            searches: [],

            saveSearch: (name, query, filters) => set((state) => ({
                searches: [...state.searches, {
                    id: Date.now().toString(),
                    name,
                    query,
                    filters
                }]
            })),

            deleteSearch: (id) => set((state) => ({
                searches: state.searches.filter(s => s.id !== id)
            }))
        }),
        {
            name: 'saved-search-storage'
        }
    )
)
