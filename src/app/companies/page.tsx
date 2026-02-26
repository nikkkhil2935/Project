import { Suspense } from "react"
import { CompanyTable } from "@/components/companies/CompanyTable"

function CompanyTableFallback() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-pulse">
            <div className="h-16 bg-muted rounded-3xl w-1/2" />
            <div className="h-14 bg-muted rounded-full w-full max-w-xl" />
            <div className="h-96 bg-muted rounded-[2.5rem]" />
        </div>
    )
}

export default function CompaniesPage() {
    return (
        <Suspense fallback={<CompanyTableFallback />}>
            <CompanyTable />
        </Suspense>
    )
}
