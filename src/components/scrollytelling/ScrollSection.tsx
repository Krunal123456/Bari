"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import clsx from "clsx";

interface ScrollSectionProps {
    children: React.ReactNode;
    className?: string;
    align?: "left" | "center" | "right";
}

export function ScrollSection({ children, className, align = "center" }: ScrollSectionProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-30% 0px -30% 0px", once: false });

    return (
        <section className="min-h-screen w-full flex items-center justify-center snap-center relative z-10 pointer-events-none">
            <div
                ref={ref}
                className={clsx(
                    "container mx-auto px-6 pointer-events-auto",
                    align === "left" && "text-center md:text-left",
                    align === "center" && "text-center",
                    align === "right" && "text-center md:text-right",
                    className
                )}
            >
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </div>
        </section>
    );
}
