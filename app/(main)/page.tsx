import Hero from "@/components/client/landing/Hero"
import Testimonial from "@/components/client/landing/Testimonial"
import Steps from "@/components/client/landing/Steps"
import Hotels from "@/components/client/landing/Hotels"
import JoinPartner from "@/components/client/landing/JoinPartner"

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white pt-16">
        {/* Hero Section - First thing users see */}
        <Hero />
        
        {/* Featured Hotels - Show inventory early */}
        <Hotels />
        
        {/* How It Works - Build trust with process */}
        <Steps />
        
        {/* Social Proof - Testimonials build credibility */}
        <Testimonial />
        
        {/* Partner CTA - Convert potential partners */}
        <JoinPartner />
    </div>
  )
}

export default HomePage