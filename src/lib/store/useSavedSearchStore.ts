import { create } from 'zustand'
import { createClient } from '../supabase/client'

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
    loaded: boolean;

    fetchSearches: () => Promise<void>;
    saveSearch: (name: string, query: string, filters: FilterState) => void;
    deleteSearch: (id: string) => void;
}

export const useSavedSearchStore = create<SavedSearchState>()(
    (set) => ({
        searches: [],
        loaded: false,

        fetchSearches: async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('saved_searches')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching saved searches:', error)
                set({ loaded: true })
                return
            }

            const searches: SavedSearch[] = (data || []).map((s: any) => ({
                id: s.id,
                name: s.name,
                query: s.query || '',
                filters: s.filters || { sectors: [], geographies: [], stages: [], hiringOnly: false }
            }))

            set({ searches, loaded: true })
        },

        saveSearch: (name, query, filters) => {
            const tempId = Date.now().toString()
            set((state) => ({
                searches: [...state.searches, { id: tempId, name, query, filters }]
            }))

            const persist = async () => {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data } = await supabase
                    .from('saved_searches')
                    .insert({ user_id: user.id, name, query, filters })
                    .select()
                    .single()

                if (data) {
                    set((state) => ({
                        searches: state.searches.map(s =>
                            s.id === tempId ? { ...s, id: data.id } : s
                        )
                    }))
                }
            }
            persist()
        },

        deleteSearch: (id) => {
            set((state) => ({
                searches: state.searches.filter(s => s.id !== id)
            }))

            const supabase = createClient()
            supabase.from('saved_searches').delete().eq('id', id).then()
        }
    })
)
