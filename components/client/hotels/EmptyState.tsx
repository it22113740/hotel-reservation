import { Search, MapPin, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  type?: "no-results" | "error" | "no-hotels"
  onReset?: () => void
}

const EmptyState = ({ type = "no-results", onReset }: EmptyStateProps) => {
  const states = {
    "no-results": {
      icon: <Search className="w-16 h-16 text-gray-300" />,
      title: "No hotels found",
      description: "We couldn't find any hotels matching your filters. Try adjusting your search criteria.",
      action: onReset ? { label: "Clear Filters", onClick: onReset } : null
    },
    "error": {
      icon: <MapPin className="w-16 h-16 text-gray-300" />,
      title: "Oops! Something went wrong",
      description: "We're having trouble loading hotels. Please try again later.",
      action: { label: "Retry", onClick: () => window.location.reload() }
    },
    "no-hotels": {
      icon: <Filter className="w-16 h-16 text-gray-300" />,
      title: "No hotels available yet",
      description: "Check back soon! We're adding new hotels every day.",
      action: null
    }
  }

  const state = states[type]

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4">
        {state.icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {state.title}
      </h3>
      <p className="text-gray-600 max-w-md mb-6">
        {state.description}
      </p>
      {state.action && (
        <Button onClick={state.action.onClick} variant="default">
          {state.action.label}
        </Button>
      )}
    </div>
  )
}

export default EmptyState

