import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ModeToggle } from "../components/mode-toggle"
import { UserNav } from "../components/user-nav"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  BarChart3,
  Briefcase,
  DollarSign,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Rocket,
  Search,
  Users,
} from "lucide-react"
import { PerformanceMetrics } from "../components/dashboard/performance-metrics"
import { RecentActivity } from "../components/dashboard/recent-activity"
import { SponsorshipMatches } from "../components/dashboard/sponsorship-matches"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[hsl(0,0%,100%)] text-[hsl(222.2,84%,4.9%)]">
      <header className="sticky top-0 z-50 w-full border-b border-[hsl(214.3,31.8%,91.4%)] bg-[rgba(255,255,255,0.95)] backdrop-blur supports-[backdrop-filter]:bg-[hsla(0,0%,100%,0.6)]">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 mr-6  ml-6">
            <Rocket className="h-6 w-6 text-[hsl(262.1,83.3%,57.8%)]" />
            <span className="font-bold text-xl hidden md:inline-block">Inpact</span>
          </Link>
          <div className="flex items-center space-x-4">
  {[
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dashboard/sponsorships", icon: Briefcase, label: "Sponsorships" },
    { to: "/dashboard/collaborations", icon: Users, label: "Collaborations" },
    { to: "/dashboard/contracts", icon: FileText, label: "Contracts" },
    { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  ].map(({ to, icon: Icon, label }) => (
    <Button
      key={to}
      variant="ghost"
      size="sm"
      className="w-9 px-0 hover:bg-[hsl(210,40%,96.1%)] hover:text-[hsl(222.2,47.4%,11.2%)]"
      asChild
    >
      <Link to={to}>
        <Icon className="h-5 w-5" />
        <span className="sr-only">{label}</span>
      </Link>
    </Button>
  ))}
</div>
<div className="ml-auto flex items-center space-x-4">
  <div className="relative hidden md:flex">
    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[hsl(215.4,16.3%,46.9%)]" />
    <Input
      type="search"
      placeholder="Search..."
      className="w-[200px] pl-8 md:w-[300px] rounded-full bg-[hsl(210,40%,96.1%)] border-[hsl(214.3,31.8%,91.4%)]"
    />
  </div>
  <ModeToggle />
  <UserNav />
</div>
</div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Button className="bg-[hsl(262.1,83.3%,57.8%)] text-[hsl(210,40%,98%)] hover:bg-[hsl(262.1,73.3%,57.8%)]">
              <DollarSign className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-[hsl(210,40%,96.1%)]">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:text-[hsl(222.2,47.4%,11.2%)] data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="sponsorships" 
              className="data-[state=active]:bg-white data-[state=active]:text-[hsl(222.2,47.4%,11.2%)] data-[state=active]:shadow-sm"
            >
              Sponsorships
            </TabsTrigger>
            <TabsTrigger 
              value="collaborations" 
              className="data-[state=active]:bg-white data-[state=active]:text-[hsl(222.2,47.4%,11.2%)] data-[state=active]:shadow-sm"
            >
              Collaborations
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-white data-[state=active]:text-[hsl(222.2,47.4%,11.2%)] data-[state=active]:shadow-sm"
            >
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-[hsl(0,0%,100%)] border-[hsl(214.3,31.8%,91.4%)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[hsl(215.4,16.3%,46.9%)]">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-[hsl(215.4,16.3%,46.9%)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[hsl(222.2,84%,4.9%)]">$45,231.89</div>
                  <p className="text-xs text-[hsl(215.4,16.3%,46.9%)]">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-[hsl(0,0%,100%)] border-[hsl(214.3,31.8%,91.4%)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[hsl(215.4,16.3%,46.9%)]">Active Sponsorships</CardTitle>
                  <Briefcase className="h-4 w-4 text-[hsl(215.4,16.3%,46.9%)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[hsl(222.2,84%,4.9%)]">12</div>
                  <p className="text-xs text-[hsl(215.4,16.3%,46.9%)]">+3 from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-[hsl(0,0%,100%)] border-[hsl(214.3,31.8%,91.4%)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[hsl(215.4,16.3%,46.9%)]">Collaborations</CardTitle>
                  <Users className="h-4 w-4 text-[hsl(215.4,16.3%,46.9%)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[hsl(222.2,84%,4.9%)]">8</div>
                  <p className="text-xs text-[hsl(215.4,16.3%,46.9%)]">+2 from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-[hsl(0,0%,100%)] border-[hsl(214.3,31.8%,91.4%)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[hsl(215.4,16.3%,46.9%)]">Audience Growth</CardTitle>
                  <BarChart3 className="h-4 w-4 text-[hsl(215.4,16.3%,46.9%)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[hsl(222.2,84%,4.9%)]">+12.5%</div>
                  <p className="text-xs text-[hsl(215.4,16.3%,46.9%)]">+2.1% from last month</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 bg-[hsl(0,0%,100%)] border-[hsl(214.3,31.8%,91.4%)]">
                <CardHeader>
                  <CardTitle className="text-[hsl(222.2,84%,4.9%)]">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <PerformanceMetrics />
                </CardContent>
              </Card>
              <Card className="col-span-3 bg-[hsl(0,0%,100%)] border-[hsl(214.3,31.8%,91.4%)]">
                <CardHeader>
                  <CardTitle className="text-[hsl(222.2,84%,4.9%)]">Recent Activity</CardTitle>
                  <CardDescription className="text-[hsl(215.4,16.3%,46.9%)]">Your latest interactions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 bg-[hsl(0,0%,100%)] border-[hsl(214.3,31.8%,91.4%)]">
                <CardHeader>
                  <CardTitle className="text-[hsl(222.2,84%,4.9%)]">AI-Matched Sponsorships</CardTitle>
                  <CardDescription className="text-[hsl(215.4,16.3%,46.9%)]">Brands that match your audience and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <SponsorshipMatches />
                </CardContent>
              </Card>
              <Card className="col-span-3 bg-[hsl(0,0%,100%)] border-[hsl(214.3,31.8%,91.4%)]">
                <CardHeader>
                  <CardTitle className="text-[hsl(222.2,84%,4.9%)]">Creator Collaborations</CardTitle>
                  <CardDescription className="text-[hsl(215.4,16.3%,46.9%)]">Creators with complementary audiences</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* <CreatorCollaborations /> */}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="sponsorships" className="space-y-4">
        <Card className="bg-[hsl(0,0%,100%)] border-[hsl(214.3,31.8%,91.4%)]">
          <CardHeader>
            <CardTitle className="text-[hsl(222.2,84%,4.9%)]">AI-Driven Sponsorship Matchmaking</CardTitle>
            <CardDescription className="text-[hsl(215.4,16.3%,46.9%)]">Discover brands that align with your audience and content style</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-[hsl(214.3,31.8%,91.4%)] bg-[hsl(210,40%,96.1%)] p-4">
              <h3 className="text-lg font-semibold text-[hsl(222.2,84%,4.9%)]">Coming Soon</h3>
              <p className="text-sm text-[hsl(215.4,16.3%,46.9%)]">
                The full sponsorship matchmaking interface will be available here.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="collaborations" className="space-y-4">
        <Card className="bg-[hsl(0,0%,100%)] border-[hsl(214.3,31.8%,91.4%)]">
          <CardHeader>
            <CardTitle className="text-[hsl(222.2,84%,4.9%)]">Creator Collaboration Hub</CardTitle>
            <CardDescription className="text-[hsl(215.4,16.3%,46.9%)]">Find and partner with creators who have complementary audiences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-[hsl(214.3,31.8%,91.4%)] bg-[hsl(210,40%,96.1%)] p-4">
              <h3 className="text-lg font-semibold text-[hsl(222.2,84%,4.9%)]">Coming Soon</h3>
              <p className="text-sm text-[hsl(215.4,16.3%,46.9%)]">
                The full creator collaboration interface will be available here.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="analytics" className="space-y-4">
        <Card className="bg-[hsl(0,0%,100%)] border-[hsl(214.3,31.8%,91.4%)]">
          <CardHeader>
            <CardTitle className="text-[hsl(222.2,84%,4.9%)]">Performance Analytics & ROI Tracking</CardTitle>
            <CardDescription className="text-[hsl(215.4,16.3%,46.9%)]">Track sponsorship performance and campaign success</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-[hsl(214.3,31.8%,91.4%)] bg-[hsl(210,40%,96.1%)] p-4">
              <h3 className="text-lg font-semibold text-[hsl(222.2,84%,4.9%)]">Coming Soon</h3>
              <p className="text-sm text-[hsl(215.4,16.3%,46.9%)]">
                The full analytics dashboard will be available here.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </main>
  </div>
    )
  }