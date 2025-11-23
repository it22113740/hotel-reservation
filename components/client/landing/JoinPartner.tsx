import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building2, TrendingUp, Users, Shield, ArrowRight } from "lucide-react"

const JoinPartner = () => {
  const benefits = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Increase Revenue",
      description: "Boost your bookings by 40% on average"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Reach Millions",
      description: "Connect with travelers worldwide"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Platform",
      description: "Safe payments and verified guests"
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Easy Management",
      description: "Powerful dashboard to manage listings"
    }
  ]

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-50 to-blue-50 -z-10" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Main CTA Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 lg:p-16 border border-gray-100">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <Building2 className="w-4 h-4" />
                Partner Program
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                List Your Hotel & 
                <span className="text-primary"> Grow Your Business</span>
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Join thousands of successful hotel partners on LankaStay. 
                Reach millions of travelers and maximize your revenue with our 
                industry-leading platform.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-gray-600">Hotels</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-3xl font-bold text-primary">5M+</div>
                  <div className="text-sm text-gray-600">Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="group"
                  asChild
                >
                  <Link href="/partner-hotel">
                    Join as Partner
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  asChild
                >
                  <Link href="/partner-info">
                    Learn More
                  </Link>
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                🎉 <strong>Special Offer:</strong> Zero commission for first 3 months!
              </p>
            </div>

            {/* Right Content - Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted by leading hotel chains</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            {/* You can add actual hotel brand logos here */}
            <div className="text-2xl font-bold">Hilton</div>
            <div className="text-2xl font-bold">Marriott</div>
            <div className="text-2xl font-bold">Hyatt</div>
            <div className="text-2xl font-bold">IHG</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default JoinPartner