import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface TopBarProps {
  left?: ReactNode
  right?: ReactNode
  className?: string
  variant?: "default" | "canvas"
}

export function TopBar({ left, right, className, variant = "default" }: TopBarProps) {
  return (
    <div className={cn(
      "flex items-center justify-between",
      variant === "default" && "border-b border-border px-6 py-4",
      variant === "canvas" && "p-2 gap-2 border-b-1",
      className
    )}>
      <div className="flex items-center gap-4">
        {left}
      </div>
      <div className="flex items-center gap-5">
        {right}
      </div>
    </div>
  )
} 