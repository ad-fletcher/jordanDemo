import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#a1887f] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#8B4B3E] text-white shadow hover:bg-[#7a3f34] dark:bg-[#8B4B3E]/90 dark:hover:bg-[#7a3f34]/90",
        destructive:
          "bg-red-500/90 text-white shadow-sm hover:bg-red-500/80 dark:bg-red-900/90 dark:hover:bg-red-900/80",
        outline:
          "border border-stone-200 bg-white shadow-sm hover:bg-stone-100 hover:text-stone-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-stone-200",
        secondary:
          "bg-stone-100 text-stone-900 shadow-sm hover:bg-stone-200 dark:bg-neutral-800 dark:text-stone-200 dark:hover:bg-neutral-700",
        ghost: "hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-neutral-800 dark:hover:text-stone-200",
        link: "text-[#8B4B3E] underline-offset-4 hover:underline dark:text-[#8B4B3E]/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const ChatButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
ChatButton.displayName = "ChatButton"

export { ChatButton, buttonVariants }