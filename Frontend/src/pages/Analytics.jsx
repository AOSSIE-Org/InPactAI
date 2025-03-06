import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  BarChart3,
  Briefcase,
  Calendar,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Rocket,
  Search,
  Users,
} from "lucide-react"
import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ModeToggle } from "../components/mode-toggle"
import { UserNav } from "../components/user-nav"
import { PerformanceOverview } from "../components/analytics/performance-overview"
import { AudienceMetrics } from "../components/analytics/audience-metrics"
import { CampaignComparison } from "../components/analytics/campaign-comparison"
import { RevenueAnalytics } from "../components/analytics/revenue-analytics"
import { DateRangePicker } from "../components/date-range-picker"

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2 mr-6">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden md:inline-block">Inpact</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <Link href="/dashboard/sponsorships">
                <Briefcase className="h-5 w-5" />
                <span className="sr-only">Sponsorships</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <Link href="/dashboard/collaborations">
                <Users className="h-5 w-5" />
                <span className="sr-only">Collaborations</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <Link href="/dashboard/contracts">
                <FileText className="h-5 w-5" />
                <span className="sr-only">Contracts</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="h-5 w-5" />
                <span className="sr-only">Analytics</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <Link href="/dashboard/messages">
                <MessageSquare className="h-5 w-5" />
                <span className="sr-only">Messages</span>
              </Link>
            </Button>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative hidden md:flex">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search analytics..."
                className="w-[200px] pl-8 md:w-[300px] rounded-full bg-muted"
              />
            </div>
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Performance Analytics & ROI Tracking</h1>
          <div className="flex items-center space-x-2">
            <DateRangePicker />
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">128.5K</div>
                  <p className="text-xs text-muted-foreground">+18.2% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.3%</div>
                  <p className="text-xs text-muted-foreground">+0.5% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ROI</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">342%</div>
                  <p className="text-xs text-muted-foreground">+28% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>View your key metrics over time</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <PerformanceOverview />
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Top Performing Content</CardTitle>
                  <CardDescription>Your best performing sponsored content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded bg-muted mr-4"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">EcoStyle Product Review</p>
                          <span className="text-sm text-muted-foreground">24.5K</span>
                        </div>
                        <div className="w-full h-2 bg-muted mt-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[85%]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded bg-muted mr-4"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">TechGadgets Unboxing</p>
                          <span className="text-sm text-muted-foreground">18.3K</span>
                        </div>
                        <div className="w-full h-2 bg-muted mt-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[65%]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded bg-muted mr-4"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">FitLife Workout Series</p>
                          <span className="text-sm text-muted-foreground">15.7K</span>
                        </div>
                        <div className="w-full h-2 bg-muted mt-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[55%]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded bg-muted mr-4"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Travel Vlog with Sarah</p>
                          <span className="text-sm text-muted-foreground">12.9K</span>
                        </div>
                        <div className="w-full h-2 bg-muted mt-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[45%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-4">
            <AudienceMetrics />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <CampaignComparison />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <RevenueAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

