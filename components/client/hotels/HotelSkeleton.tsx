const HotelSkeleton = () => {
  return (
    <div className="w-full h-full border border-gray-200 rounded-xl overflow-hidden bg-white animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-56 bg-gray-200"></div>
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title & Location */}
        <div>
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>

        {/* Amenities */}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}

export default HotelSkeleton

