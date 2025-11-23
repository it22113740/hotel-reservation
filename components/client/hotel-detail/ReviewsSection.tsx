import { Star, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Review {
  id: string
  author: string
  avatar?: string
  rating: number
  date: string
  comment: string
  helpful: number
}

interface ReviewsSectionProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

const ReviewsSection = ({ reviews, averageRating, totalReviews }: ReviewsSectionProps) => {
  const ratingBreakdown = [
    { stars: 5, count: 89, percentage: 75 },
    { stars: 4, count: 15, percentage: 13 },
    { stars: 3, count: 8, percentage: 7 },
    { stars: 2, count: 4, percentage: 3 },
    { stars: 1, count: 2, percentage: 2 },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Guest Reviews</h2>
        <Button variant="outline">Write a Review</Button>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
        {/* Overall Rating */}
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold text-gray-900">{averageRating}</span>
            <span className="text-2xl text-gray-600">/ 5</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-600">{totalReviews} reviews</p>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-3">
          {ratingBreakdown.map((item) => (
            <div key={item.stars} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-8">
                {item.stars}★
              </span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.slice(0, 6).map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-lg">
                  {review.author.charAt(0)}
                </span>
              </div>

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.author}</h4>
                    <p className="text-sm text-gray-600">{review.date}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful})
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {totalReviews > 6 && (
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Show all {totalReviews} reviews
          </Button>
        </div>
      )}
    </div>
  )
}

export default ReviewsSection

