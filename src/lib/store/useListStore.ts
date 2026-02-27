import { create } from 'zustand'
import { createClient } from '../supabase/client'

export interface List {
    id: string;
    name: string;
    companyIds: string[];
}

interface ListState {
    lists: List[];
    loaded: boolean;

    fetchLists: () => Promise<void>;
    createList: (name: string) => void;
    deleteList: (id: string) => void;
    renameList: (id: string, name: string) => void;
    addToList: (listId: string, companyId: string) => void;
    removeFromList: (listId: string, companyId: string) => void;
}

export const useListStore = create<ListState>()(
    (set, get) => ({
        lists: [],
        loaded: false,

        fetchLists: async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: listsData, error } = await supabase
                .from('lists')
                .select('*, list_companies(company_id)')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching lists:', error)
                set({ loaded: true })
                return
            }

            if (listsData && listsData.length > 0) {
                const lists: List[] = listsData.map((l: any) => ({
                    id: l.id,
                    name: l.name,
                    companyIds: (l.list_companies || []).map((lc: any) => lc.company_id)
                }))
                set({ lists, loaded: true })
            } else {
                set({ lists: [], loaded: true })
            }
        },

        createList: (name) => {
            const tempId = Date.now().toString()
            set((state) => ({
                lists: [...state.lists, { id: tempId, name, companyIds: [] }]
            }))

            const persist = async () => {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data, error } = await supabase
                    .from('lists')
                    .insert({ user_id: user.id, name })
                    .select()
                    .single()

                if (data) {
                    set((state) => ({
                        lists: state.lists.map(l =>
                            l.id === tempId ? { ...l, id: data.id } : l
                        )
                    }))
                }
            }
            persist()
        },

        deleteList: (id) => {
            set((state) => ({
                lists: state.lists.filter(l => l.id !== id)
            }))

            const supabase = createClient()
            supabase.from('lists').delete().eq('id', id).then()
        },

        renameList: (id, name) => {
            set((state) => ({
                lists: state.lists.map(l => l.id === id ? { ...l, name } : l)
            }))

            const supabase = createClient()
            supabase.from('lists').update({ name }).eq('id', id).then()
        },

        addToList: (listId, companyId) => {
            set((state) => ({
                lists: state.lists.map(l =>
                    l.id === listId && !l.companyIds.includes(companyId)
                        ? { ...l, companyIds: [...l.companyIds, companyId] }
                        : l
                )
            }))

            const supabase = createClient()
            supabase.from('list_companies').insert({ list_id: listId, company_id: companyId }).then()
        },

        removeFromList: (listId, companyId) => {
            set((state) => ({
                lists: state.lists.map(l =>
                    l.id === listId
                        ? { ...l, companyIds: l.companyIds.filter(id => id !== companyId) }
                        : l
                )
            }))

            const supabase = createClient()
            supabase.from('list_companies')
                .delete()
                .eq('list_id', listId)
                .eq('company_id', companyId)
                .then()
        },
    })
)
