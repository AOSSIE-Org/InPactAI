import { Link } from "react-router-dom"
import { ArrowRight, BarChart3, Handshake, Layers, MessageSquare, Rocket, Users } from "lucide-react"
import { Button } from "../components/ui/button"
import { MainNav } from "../components/main-nav"
import { ModeToggle } from "../components/mode-toggle"
import { UserNav } from "../components/user-nav"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-6">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2">
              <Rocket className="h-6 w-6 text-purple-600" />
              <span className="font-bold text-xl">Inpact</span>
            </Link>
            <MainNav />
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="hidden md:flex">
              <Button variant="ghost" className="mr-2 hover:bg-gray-100 hover:text-gray-900">
                <Link to="/login">Login</Link>
              </Button>
              <Button className="bg-purple-600 text-white hover:bg-purple-700">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gray-900">
                    AI-Powered Creator Collaboration Platform
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl">
                    Connect with brands, collaborate with creators, and optimize your partnerships through data-driven
                    insights.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-purple-600 text-white hover:bg-purple-700">
                    <Link to="/dashboard" className="flex items-center">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="border-gray-200 text-gray-900 hover:bg-gray-100 hover:text-gray-900">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] sm:h-[450px] sm:w-[450px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 to-gray-100/20 rounded-full blur-3xl" />
                  <img
                    src="https://via.placeholder.com/450"
                    alt="Hero Image"
                    className="relative z-10 mx-auto h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">Key Features</h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl">
                  Leverage AI to transform your creator partnerships and brand sponsorships
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="grid gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 mx-auto">
                  <Handshake className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI-Driven Sponsorship Matchmaking</h3>
                <p className="text-gray-600">
                  Connect with brands based on audience demographics, engagement rates, and content style.
                </p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 mx-auto">
                  <Users className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Creator Collaboration Hub</h3>
                <p className="text-gray-600">
                  Find and partner with creators who have complementary audiences and content niches.
                </p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 mx-auto">
                  <Layers className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI-Based Pricing Optimization</h3>
                <p className="text-gray-600">
                  Get fair sponsorship pricing recommendations based on engagement and market trends.
                </p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 mx-auto">
                  <MessageSquare className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Negotiation & Contract Assistant</h3>
                <p className="text-gray-600">
                  Structure deals, generate contracts, and optimize terms using AI insights.
                </p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 mx-auto">
                  <BarChart3 className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Performance Analytics</h3>
                <p className="text-gray-600">
                  Track sponsorship performance, audience engagement, and campaign success.
                </p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 mx-auto">
                  <Rocket className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">ROI Tracking</h3>
                <p className="text-gray-600">
                  Measure and optimize return on investment for both creators and brands.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-gray-200 py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-gray-600 md:text-left">
            © 2024 Inpact. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-sm text-gray-600 underline-offset-4 hover:underline">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-gray-600 underline-offset-4 hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}