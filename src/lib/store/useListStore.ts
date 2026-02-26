import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface List {
    id: string;
    name: string;
    companyIds: string[];
}

interface ListState {
    lists: List[];

    createList: (name: string) => void;
    deleteList: (id: string) => void;
    renameList: (id: string, name: string) => void;
    addToList: (listId: string, companyId: string) => void;
    removeFromList: (listId: string, companyId: string) => void;
}

export const useListStore = create<ListState>()(
    persist(
        (set) => ({
            lists: [
                { id: '1', name: 'High Priority (Q3)', companyIds: ['1', '3'] },
                { id: '2', name: 'Watchlist', companyIds: ['2', '4'] }
            ],

            createList: (name) => set((state) => ({
                lists: [...state.lists, { id: Date.now().toString(), name, companyIds: [] }]
            })),

            deleteList: (id) => set((state) => ({
                lists: state.lists.filter(l => l.id !== id)
            })),

            renameList: (id, name) => set((state) => ({
                lists: state.lists.map(l => l.id === id ? { ...l, name } : l)
            })),

            addToList: (listId, companyId) => set((state) => ({
                lists: state.lists.map(l =>
                    l.id === listId && !l.companyIds.includes(companyId)
                        ? { ...l, companyIds: [...l.companyIds, companyId] }
                        : l
                )
            })),

            removeFromList: (listId, companyId) => set((state) => ({
                lists: state.lists.map(l =>
                    l.id === listId
                        ? { ...l, companyIds: l.companyIds.filter(id => id !== companyId) }
                        : l
                )
            })),
        }),
        {
            name: 'list-storage'
        }
    )
)
