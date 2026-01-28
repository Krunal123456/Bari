"use client";

import React, { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, useSpring, motion } from "framer-motion";

interface ImageSequenceCanvasProps {
    scrollContainerRef?: React.RefObject<HTMLElement>;
}

export function ImageSequenceCanvas({ scrollContainerRef }: ImageSequenceCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const frameCount = 200;

    // Preload images
    useEffect(() => {
        const loadImages = async () => {
            const loadedImages: HTMLImageElement[] = [];
            const promises: Promise<void>[] = [];

            for (let i = 1; i <= frameCount; i++) {
                const promise = new Promise<void>((resolve) => {
                    const img = new Image();
                    const frameNumber = i.toString().padStart(3, "0");
                    img.src = `/3d/frames/ezgif-frame-${frameNumber}.jpg`;
                    img.onload = () => {
                        loadedImages[i - 1] = img;
                        resolve();
                    };
                    // Handle loose frames if any fail (though we expect all 200)
                    img.onerror = () => resolve();
                });
                promises.push(promise);
            }

            await Promise.all(promises);
            setImages(loadedImages);
            setIsLoaded(true);
        };

        loadImages();
    }, []);

    const { scrollYProgress } = useScroll({
        target: scrollContainerRef,
        offset: ["start start", "end end"]
    });

    // Smooth out the scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isLoaded || images.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const render = (progress: number) => {
            // Map progress (0 to 1) to frame index (0 to 199)
            const frameIndex = Math.min(
                frameCount - 1,
                Math.max(0, Math.floor(progress * (frameCount - 1)))
            );

            const img = images[frameIndex];
            if (!img) return;

            // Draw image to cover the canvas while maintaining aspect ratio
            // Use window dimensions (logical pixels) because the context is already scaled by DPR
            const canvasWidth = window.innerWidth;
            const canvasHeight = window.innerHeight;

            const imgRatio = img.width / img.height;
            const canvasRatio = canvasWidth / canvasHeight;

            let drawWidth, drawHeight, offsetX, offsetY;

            if (imgRatio > canvasRatio) {
                drawHeight = canvasHeight;
                drawWidth = canvasHeight * imgRatio;
                offsetX = (canvasWidth - drawWidth) / 2;
                offsetY = 0;
            } else {
                drawWidth = canvasWidth;
                drawHeight = canvasWidth / imgRatio;
                offsetX = 0;
                offsetY = (canvasHeight - drawHeight) / 2;
            }

            // clearRect handles the clearing logic. 
            // Note: because of ctx.scale, x/y/w/h are in logical pixels.
            // We can clear a slightly larger area to be safe or just the logical area.
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        };

        // Initial render
        render(smoothProgress.get());

        // Subscribe to progress changes
        const unsubscribe = smoothProgress.on("change", (latest) => {
            requestAnimationFrame(() => render(latest));
        });

        // Handle resize with High-DPI support
        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            // Ensure CSS size matches window size
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            // Scale context to match dpr
            ctx.scale(dpr, dpr);

            render(smoothProgress.get());
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // call once to set initial size

        return () => {
            unsubscribe();
            window.removeEventListener("resize", handleResize);
        };
    }, [isLoaded, images, smoothProgress]);

    return (
        <div className="fixed inset-0 z-0 bg-ivory-100">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 1 }}
                className="size-full"
            >
                <canvas ref={canvasRef} className="size-full block" />
            </motion.div>

            {/* Loading State */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-ivory-50 z-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-maroon-200 border-t-maroon-900 rounded-full animate-spin" />
                        <p className="font-serif text-maroon-900 animate-pulse">Loading Experience...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
