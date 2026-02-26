"use client"

import { useState } from "react"

interface CompanyLogoProps {
    name: string;
    website: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizes = {
    sm: "h-8 w-8 rounded-lg text-xs",
    md: "h-10 w-10 rounded-xl text-sm",
    lg: "h-12 w-12 rounded-2xl text-lg",
    xl: "h-24 w-24 rounded-3xl text-3xl",
}

const colors = [
    "bg-blue-500/10 text-blue-600",
    "bg-emerald-500/10 text-emerald-600",
    "bg-amber-500/10 text-amber-600",
    "bg-violet-500/10 text-violet-600",
    "bg-rose-500/10 text-rose-600",
    "bg-cyan-500/10 text-cyan-600",
    "bg-orange-500/10 text-orange-600",
    "bg-indigo-500/10 text-indigo-600",
]

function getColorForName(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function getHostname(website: string): string {
    try {
        return new URL(website).hostname;
    } catch {
        return website.replace(/^https?:\/\//, '').split('/')[0];
    }
}

export function CompanyLogo({ name, website, size = "lg", className = "" }: CompanyLogoProps) {
    const [imgError, setImgError] = useState(false)
    const [clearbitError, setClearbitError] = useState(false)
    const hostname = getHostname(website)

    const sizeClass = sizes[size]
    const letterColor = getColorForName(name)
    const imgPadding = size === "xl" ? "p-3" : size === "lg" ? "p-1.5" : "p-1"

    // Try Clearbit first, then Google Favicon, then letter
    if (!imgError) {
        return (
            <div className={`${sizeClass} bg-secondary flex items-center justify-center border shadow-inner overflow-hidden relative ${className}`}>
                <img
                    src={`https://logo.clearbit.com/${hostname}`}
                    alt={name}
                    onError={() => setImgError(true)}
                    className={`h-full w-full object-contain ${imgPadding}`}
                    loading="lazy"
                />
            </div>
        )
    }

    if (!clearbitError) {
        return (
            <div className={`${sizeClass} bg-secondary flex items-center justify-center border shadow-inner overflow-hidden relative ${className}`}>
                <img
                    src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=128`}
                    alt={name}
                    onError={() => setClearbitError(true)}
                    className={`h-full w-full object-contain ${imgPadding}`}
                    loading="lazy"
                />
            </div>
        )
    }

    // Letter fallback with deterministic color
    return (
        <div className={`${sizeClass} ${letterColor} flex items-center justify-center border font-black ${className}`}>
            {name[0]}
        </div>
    )
}
