"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  min?: number
  max?: number
  step?: number
  value?: number[]
  onValueChange?: (value: number[]) => void
  className?: string
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ min = 0, max = 100, step = 1, value = [min, max], onValueChange, className }, ref) => {
    const [localValue, setLocalValue] = React.useState(value)

    React.useEffect(() => {
      setLocalValue(value)
    }, [value])

    const handleChange = (index: number, newValue: number) => {
      const updated = [...localValue]
      updated[index] = newValue
      
      // Ensure min is always less than max
      if (index === 0 && updated[0] > updated[1]) {
        updated[0] = updated[1]
      }
      if (index === 1 && updated[1] < updated[0]) {
        updated[1] = updated[0]
      }
      
      setLocalValue(updated)
      onValueChange?.(updated)
    }

    const getPercentage = (val: number) => ((val - min) / (max - min)) * 100

    return (
      <div ref={ref} className={cn("relative flex w-full items-center", className)}>
        <div className="relative h-2 w-full rounded-full bg-gray-200">
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{
              left: `${getPercentage(localValue[0])}%`,
              right: `${100 - getPercentage(localValue[1])}%`,
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={(e) => handleChange(0, Number(e.target.value))}
          className="slider-thumb absolute w-full opacity-0 cursor-pointer"
          style={{ zIndex: localValue[0] > max - (max - min) / 4 ? 5 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={(e) => handleChange(1, Number(e.target.value))}
          className="slider-thumb absolute w-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
        />
        <div
          className="absolute h-5 w-5 rounded-full border-2 border-primary bg-white shadow-md pointer-events-none"
          style={{ left: `calc(${getPercentage(localValue[0])}% - 10px)` }}
        />
        <div
          className="absolute h-5 w-5 rounded-full border-2 border-primary bg-white shadow-md pointer-events-none"
          style={{ left: `calc(${getPercentage(localValue[1])}% - 10px)` }}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }

