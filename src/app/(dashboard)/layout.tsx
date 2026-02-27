"use client"

import { Shell } from "@/components/layout/Shell"
import { DataHydrator } from "@/components/data/DataHydrator"
import { useAuth } from "@/components/auth/AuthProvider"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground font-medium">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <Shell>
            <DataHydrator>
                {children}
            </DataHydrator>
        </Shell>
    )
}
