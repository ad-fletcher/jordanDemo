"use client";

import type React from "react";
import { useState } from "react";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: `rgba(110, 95, 69, ${0.03 + i * 0.01})`, // Loro Piana tan color
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-40">
            <svg
                className="w-full h-full text-[#b1a189] dark:text-[#8a7c64]"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.3 + path.id * 0.01}
                        initial={{ pathLength: 0.3, opacity: 0.5 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 30 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export function BackgroundPaths({
    title = "HEALTH COMPANION",
    subtitle,
    buttonText = "Begin Journey",
    onStartApp,
    extraContent,
}: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    onStartApp?: (name: string) => void;
    extraContent?: React.ReactNode;
}) {
    const words = title.split(" ");
    const [name, setName] = useState("");

    const handleButtonClick = () => {
        if (onStartApp) {
            onStartApp(name.trim());
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#f5f1e8] dark:bg-[#2b2823]">
            <div className="absolute inset-0">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-wide mb-4 letter-spacing-wider">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-4 last:mr-0"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={`${wordIndex}-${letterIndex}`}
                                        initial={{ y: 60, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay:
                                                wordIndex * 0.1 +
                                                letterIndex * 0.03,
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 20,
                                        }}
                                        className="inline-block text-[#8B4B3E] dark:text-[#8B4B3E]"
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </h1>

                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="mb-10 font-light text-xl text-[#9d8e77] dark:text-[#a59986] tracking-wide"
                        >
                            {subtitle}
                        </motion.p>
                    )}

                    {extraContent}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 1 }}
                        className="mt-8 flex flex-col items-center gap-4 max-w-sm mx-auto"
                    >
                        <Input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter' && name.trim()) {
                                    handleButtonClick();
                                }
                            }}
                            className={cn(
                                "w-full text-center rounded-lg",
                                "bg-background/80 dark:bg-neutral-900/80",
                                "border border-[#c5b299]/50 dark:border-[#6e5f45]/50",
                                "text-stone-700 dark:text-stone-300",
                                "placeholder:text-stone-500 dark:placeholder:text-stone-400",
                                "focus:ring-1 focus:ring-[#a1887f] dark:focus:ring-[#b1a189]",
                                "focus:border-[#a1887f] dark:focus:border-[#b1a189]",
                                "transition-colors duration-200"
                            )}
                        />
                        <Button
                            onClick={handleButtonClick}
                            variant="ghost"
                            disabled={!name.trim()}
                            className="w-full rounded-lg px-8 py-5 text-base font-light tracking-wide
                                    bg-[#8B4B3E] hover:bg-[#7a3f34] text-white transition-all duration-300 
                                    shadow-sm border border-[#d8cfbd]/30 hover:shadow-md
                                    disabled:bg-stone-300 disabled:dark:bg-neutral-700 disabled:cursor-not-allowed"
                        >
                            <span className="opacity-90 group-hover:opacity-100 transition-opacity">{buttonText}</span>
                            <span
                                className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                                transition-all duration-300"
                            >
                                →
                            </span>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
} 