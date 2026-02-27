"use client"

import { useEffect } from 'react'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import { useListStore } from '@/lib/store/useListStore'
import { useSavedSearchStore } from '@/lib/store/useSavedSearchStore'
import { useThesisStore } from '@/lib/store/useThesisStore'
import { useAuth } from '@/components/auth/AuthProvider'

export function DataHydrator({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const companyLoaded = useCompanyStore(s => s.loaded)
    const listLoaded = useListStore(s => s.loaded)
    const searchLoaded = useSavedSearchStore(s => s.loaded)
    const thesisLoaded = useThesisStore(s => s.loaded)
    const fetchCompanies = useCompanyStore(s => s.fetchCompanies)
    const fetchLists = useListStore(s => s.fetchLists)
    const fetchSearches = useSavedSearchStore(s => s.fetchSearches)
    const fetchThesis = useThesisStore(s => s.fetchThesis)

    useEffect(() => {
        if (user) {
            if (!companyLoaded) fetchCompanies()
            if (!listLoaded) fetchLists()
            if (!searchLoaded) fetchSearches()
            if (!thesisLoaded) fetchThesis()
        }
    }, [user])

    const allLoaded = companyLoaded && listLoaded && searchLoaded && thesisLoaded

    if (!allLoaded) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground font-medium">Loading your data...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
