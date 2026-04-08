import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isSupabaseEnabled } from '@/lib/supabase/config'
import { getAppUrl } from '@/lib/app-url'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const appUrl = getAppUrl()
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (!isSupabaseEnabled()) {
        return NextResponse.redirect(`${appUrl}/login?error=supabase_disabled`)
    }

    if (code) {
        const supabase = await createServerSupabaseClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // successful authentication
            // remove url params
            const targetUrl = new URL(`${appUrl}${next}`)
            targetUrl.searchParams.delete('code')
            return NextResponse.redirect(targetUrl)
        } else {
            console.error("Auth callback error:", error)
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${appUrl}/login?error=auth_failed`)
}
