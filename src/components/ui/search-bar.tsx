import { Search } from "lucide-react"
import { Input } from "./input"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"
import { useEffect, useState } from "react"

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  onSearch?: (value: string) => void
  className?: string
  containerClassName?: string
  debounceMs?: number
  isLoading?: boolean
  value?: string
}

export function SearchBar({
  onSearch,
  className,
  containerClassName,
  debounceMs = 300,
  placeholder = "Search...",
  value: controlledValue,
  onChange: controlledOnChange,
  isLoading,
  ...props
}: SearchBarProps) {
  // Handle both controlled and uncontrolled modes
  const [uncontrolledValue, setUncontrolledValue] = useState("")
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
  const debouncedValue = useDebounce(value, debounceMs)

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedValue)
    }
  }, [debouncedValue, onSearch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (controlledOnChange) {
      controlledOnChange(e)
    } else {
      setUncontrolledValue(e.target.value)
    }
  }

  return (
    <div className={cn("relative w-full", containerClassName)}>
      <Search 
        className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4",
          isLoading && "animate-spin"
        )} 
      />
      <Input
        type="text"
        className={cn("pl-10", className)}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        {...props}
      />
    </div>
  )
} 