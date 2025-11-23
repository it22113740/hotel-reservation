import { CheckCircle } from "lucide-react"

const Steps = () => {
  const steps = [
    {
      number: 1,
      title: "Search Your Destination",
      description: "Browse through thousands of hotels across Sri Lanka. Filter by location, price, amenities, and ratings to find your perfect match."
    },
    {
      number: 2,
      title: "Choose & Book",
      description: "Select your preferred dates, room type, and special requirements. Complete your secure booking in just a few clicks with instant confirmation."
    },
    {
      number: 3,
      title: "Enjoy Your Stay",
      description: "Show up and enjoy! We'll handle the rest. Get 24/7 support, easy cancellation, and best price guarantee on all bookings."
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white sm:py-20 lg:py-24">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Simple & Easy
          </div>
          <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Book Your Hotel in 
            <span className="text-primary"> 3 Easy Steps</span>
          </h2>
          <p className="max-w-lg mx-auto mt-4 text-lg leading-relaxed text-gray-600">
            From searching to confirmation, we've made the booking process simple and hassle-free. 
            Start your journey today!
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16 lg:mt-20">
          {/* Connecting Line */}
          <div className="absolute inset-x-0 hidden xl:px-44 top-8 md:block md:px-20 lg:px-28">
            <svg className="w-full text-gray-300" viewBox="0 0 1000 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M0 20 Q 250 0, 500 20 T 1000 20" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray="8 8"
                fill="none"
              />
            </svg>
          </div>

          {/* Steps Grid */}
          <div className="relative grid grid-cols-1 text-center gap-y-12 md:grid-cols-3 gap-x-8">
            {steps.map((step) => (
              <div key={step.number}>
                {/* Number Circle */}
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-white border-2 border-gray-200 rounded-full shadow">
                  <span className="text-xl font-semibold text-gray-700">{step.number}</span>
                </div>

                {/* Content */}
                <div className="mt-8 px-4">
                  <h3 className="text-xl font-bold leading-tight text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Ready to book your perfect stay?
          </p>
          <div className="flex flex-wrap justify-center gap-4 items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>No booking fees</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Instant confirmation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Steps