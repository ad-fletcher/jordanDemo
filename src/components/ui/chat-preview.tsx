"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import React from "react"

// Message interface might not be needed directly by ChatPreview anymore
// if children structure handles message display entirely.
// Keeping it for potential future use or if parent still uses it.
interface Message {
  avatar?: string
  avatarBackground?: string
  username: string
  content: string
  color?: string
  timestamp?: number
}

interface Channel {
  name: string
  description: string
}

type Variations = "default" | "compact" | "expanded"

interface ChatPreviewProps {
  // Removed messages prop
  children?: React.ReactNode; // Add children prop
  channel?: Channel
  headerControls?: React.ReactNode; // Add prop for header controls
  className?: string
  gradientBackground?: boolean
  variation?: Variations
  removeShadow?: boolean
  theme?: {
    background?: string
    border?: string
    textColor?: string
    avatarSize?: string
  }
  // maxMessages might not be relevant anymore if children are passed directly
  // maxMessages?: number
}

const defaultTheme = {
  background: "bg-background/50",
  border: "border border-foreground/10",
  textColor: "text-foreground/90",
  avatarSize: "w-7 h-7 sm:w-8 sm:h-8",
}

const defaultChannelData: Channel = {
  name: "Jordan Shlain",
  description: "Onboarding Conversation",
}

export function ChatPreview({
  // Removed messages prop from destructuring
  children, // Destructure children
  channel = defaultChannelData,
  headerControls, // Destructure new prop
  className,
  gradientBackground = true,
  variation = "default",
  removeShadow = false,
  theme = defaultTheme,
  // Removed maxMessages from destructuring
}: ChatPreviewProps) {
  const mergedTheme = { ...defaultTheme, ...theme }
  // Removed displayMessages = messages.slice(-maxMessages)

  return (
    <div
      className={cn(
        "relative flex-1 w-full",
        variation === "compact" && "max-w-[350px]",
        variation === "expanded" && "max-w-[700px]",
        className,
      )}
    >
      {gradientBackground && (
        <div className="absolute -inset-1 bg-gradient-to-r from-[#a1887f]/20 via-stone-400/20 to-[#8d6e63]/20 rounded-2xl blur-2xl opacity-75" />
      )}

      <div
        className={cn(
          "relative rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col",
          !removeShadow && "shadow-2xl",
          mergedTheme.border,
          mergedTheme.background,
        )}
      >
        {channel && (
          <div className="border-b px-3 py-2.5 sm:px-4 sm:py-3 flex-shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={cn(
                "rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden", 
                mergedTheme.avatarSize,
                "bg-gray-200"
                )}>
                 <Image 
                    src="/jordan-avatar.png"
                    alt={channel.name || "Channel Avatar"}
                    width={32}
                    height={32}
                    className="object-cover mt-4"
                  />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 overflow-hidden">
                <span className="font-medium text-[13px] sm:text-sm truncate">{channel.name}</span>
                <span className="text-muted-foreground hidden sm:inline">|</span>
                <span className="text-muted-foreground truncate flex-1 text-[12px] sm:text-sm">{channel.description}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {headerControls}
            </div>
          </div>
        )}

        {/* Render children directly in the scrollable body */}
        <div className={cn(
          "p-2.5 sm:p-4 overflow-y-auto relative h-[300px]",
          "scrollbar-thin scrollbar-thumb-rounded-md",
          "scrollbar-track-transparent",
          "scrollbar-thumb-foreground/20 hover:scrollbar-thumb-foreground/25",
          "dark:scrollbar-thumb-foreground/10 dark:hover:scrollbar-thumb-foreground/15"
        )}>
           {children}
        </div>
      </div>
    </div>
  )
}
