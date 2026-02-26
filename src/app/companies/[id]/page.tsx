import { CompanyProfile } from "@/components/companies/CompanyProfile"

export default function CompanyPage({ params }: { params: { id: string } }) {
    return <CompanyProfile companyId={params.id} />
}
