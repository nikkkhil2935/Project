"use client"

import { ContainerScroll } from "@/components/ui/container-scroll-animation"

export function HeroScrollDemo() {
    return (
        <div className="flex flex-col overflow-hidden bg-background">
            <ContainerScroll
                titleComponent={
                    <>
                        <h1 className="text-4xl font-semibold text-foreground md:text-6xl">
                            Experience Smooth <br />
                            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                                Deal Flow Exploration
                            </span>
                        </h1>
                    </>
                }
            >
                <img
                    src="/hero-dashboard.png"
                    alt="VC Scout AI Dashboard"
                    className="h-full w-full object-cover rounded-2xl border-2 border-zinc-800"
                    draggable={false}
                />
            </ContainerScroll>
        </div>
    )
}
