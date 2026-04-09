import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      onValueChange([newValue])
    }

    return (
      <input
        type="range"
        ref={ref}
        className={cn(
          "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer",
          "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary",
          "[&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:ring-offset-background",
          "[&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:focus-visible:outline-none",
          "[&::-webkit-slider-thumb]:focus-visible:ring-2 [&::-webkit-slider-thumb]:focus-visible:ring-ring",
          "[&::-webkit-slider-thumb]:focus-visible:ring-offset-2",
          "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary",
          "[&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Slider.displayName = "Slider"

export { Slider }