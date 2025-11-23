'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import HotelFilters from "./HotelFilters"
import { FilterState } from "./HotelFilters"

interface MobileFilterDrawerProps {
  onFilterChange: (filters: FilterState) => void
  onReset: () => void
  totalResults: number
  activeFiltersCount: number
}

const MobileFilterDrawer = ({ 
  onFilterChange, 
  onReset, 
  totalResults,
  activeFiltersCount 
}: MobileFilterDrawerProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 relative">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Filter Hotels</SheetTitle>
        </SheetHeader>
        <HotelFilters 
          onFilterChange={onFilterChange} 
          onReset={onReset}
          totalResults={totalResults}
        />
      </SheetContent>
    </Sheet>
  )
}

export default MobileFilterDrawer

