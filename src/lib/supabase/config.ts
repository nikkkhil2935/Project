const PLACEHOLDER_URLS = new Set([
    'https://placeholder.supabase.co',
    'http://placeholder.supabase.co',
])

export function isSupabaseEnabled() {
    if (process.env.NEXT_PUBLIC_SUPABASE_DISABLED === 'true') {
        return false
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
        return false
    }

    if (PLACEHOLDER_URLS.has(url)) {
        return false
    }

    try {
        const parsed = new URL(url)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
        return false
    }
}

export function getSupabaseConfig() {
    return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    }
}