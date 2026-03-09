"use client"

import React, { useRef, useState, useEffect } from "react"
import { useScroll, useTransform, motion, MotionValue } from "framer-motion"

interface ContainerScrollProps {
    titleComponent: React.ReactNode
    children: React.ReactNode
}

export const ContainerScroll: React.FC<ContainerScrollProps> = ({
    titleComponent,
    children,
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
    })

    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const scaleDimensions = isMobile ? [0.7, 0.9] : [1.05, 1]

    const rotate = useTransform(scrollYProgress, [0, 1], [20, 0])
    const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions)
    const translate = useTransform(scrollYProgress, [0, 1], [0, -100])

    return (
        <section
            ref={containerRef}
            className="relative flex h-[66rem] md:h-[88rem] items-center justify-center px-4 md:px-20"
        >
            <div
                className="relative w-full py-10 md:py-20"
                style={{ perspective: "1000px" }}
            >
                <Header translate={translate} titleComponent={titleComponent} />
                <Card rotate={rotate} scale={scale}>
                    {children}
                </Card>
            </div>
        </section>
    )
}

interface HeaderProps {
    translate: MotionValue<number>
    titleComponent: React.ReactNode
}

const Header: React.FC<HeaderProps> = ({ translate, titleComponent }) => {
    return (
        <motion.div
            style={{ translateY: translate }}
            className="mx-auto max-w-5xl text-center"
        >
            {titleComponent}
        </motion.div>
    )
}

interface CardProps {
    rotate: MotionValue<number>
    scale: MotionValue<number>
    children: React.ReactNode
}

const Card: React.FC<CardProps> = ({ rotate, scale, children }) => {
    return (
        <motion.div
            style={{
                rotateX: rotate,
                scale,
                boxShadow:
                    "0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026",
            }}
            className="mx-auto mt-[-3rem] h-[30rem] w-full max-w-5xl rounded-[30px] border-4 border-neutral-700 bg-neutral-900 p-4 md:h-[40rem]"
        >
            <div className="h-full w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                {children}
            </div>
        </motion.div>
    )
}
