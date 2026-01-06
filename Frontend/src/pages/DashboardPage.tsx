import React, { useState, useEffect } from "react"
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
  LogOut,
  MessageSquare,
  Rocket,
  Search,
  Users,
  PlusCircle,
  TrendingUp,
} from "lucide-react"
import { PerformanceMetrics } from "../components/dashboard/performance-metrics"
import { RecentActivity } from "../components/dashboard/recent-activity"
import { SponsorshipMatches } from "../components/dashboard/sponsorship-matches"
import { useAuth } from "../context/AuthContext"
import CollaborationsPage from "./Collaborations"

// New UX Component Imports
import Skeleton from "../components/ui/Skeleton"
import EmptyState from "../components/ui/EmptyState"

export default function DashboardPage() {
  const { logout, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  // Simulate data fetching on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(0,0%,100%)] text-[hsl(222.2,84%,4.9%)] dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-50 w-full border-b border-[hsl(214.3,31.8%,91.4%)] dark:border-slate-800 bg-[rgba(255,255,255,0.95)] dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-[hsla(0,0%,100%,0.6)]">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 mr-6 ml-6">
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
                className="w-9 px-0 hover:bg-[hsl(210,40%,96.1%)] dark:hover:bg-slate-800"
                asChild
              >
                <Link to={to}>
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Link>
              </Button>
            ))}
          </div>
          <div className="ml-auto flex items-center space-x-3">
            <div className="relative hidden md:flex">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[hsl(215.4,16.3%,46.9%)]" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] pl-8 md:w-[300px] rounded-full bg-[hsl(210,40%,96.1%)] dark:bg-slate-900 border-[hsl(214.3,31.8%,91.4%)] dark:border-slate-800"
              />
            </div>
            <ModeToggle />
            <Button onClick={logout} variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Button className="bg-[hsl(262.1,83.3%,57.8%)] text-white hover:bg-[hsl(262.1,73.3%,57.8%)]">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-[hsl(210,40%,96.1%)] dark:bg-slate-900">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sponsorships">Sponsorships</TabsTrigger>
            <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* --- METRICS SECTION WITH SKELETONS --- */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="bg-white dark:bg-slate-950 border-[hsl(214.3,31.8%,91.4%)] dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4" variant="circle" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-32 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card className="bg-white dark:bg-slate-950 border-[hsl(214.3,31.8%,91.4%)] dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$45,231.89</div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">+20.1% from last month</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white dark:bg-slate-950 border-[hsl(214.3,31.8%,91.4%)] dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Active Sponsorships</CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">+3 from last month</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white dark:bg-slate-950 border-[hsl(214.3,31.8%,91.4%)] dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Collaborations</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white dark:bg-slate-950 border-[hsl(214.3,31.8%,91.4%)] dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Audience Growth</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">+12.5%</div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">+2.1% from last month</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* --- ACTIVITY & METRICS --- */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 bg-white dark:bg-slate-950 border-[hsl(214.3,31.8%,91.4%)] dark:border-slate-800">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  {isLoading ? <Skeleton className="h-[300px] w-full" /> : <PerformanceMetrics />}
                </CardContent>
              </Card>
              <Card className="col-span-3 bg-white dark:bg-slate-950 border-[hsl(214.3,31.8%,91.4%)] dark:border-slate-800">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest interactions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <RecentActivity />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* --- AI MATCHES & COLLABORATIONS --- */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 bg-white dark:bg-slate-950 border-[hsl(214.3,31.8%,91.4%)] dark:border-slate-800">
                <CardHeader>
                  <CardTitle>AI-Matched Sponsorships</CardTitle>
                  <CardDescription>Brands that match your audience and content</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-40 w-full" /> : <SponsorshipMatches creatorId={user?.id || ""} />}
                </CardContent>
              </Card>
              <Card className="col-span-3 bg-white dark:bg-slate-950 border-[hsl(214.3,31.8%,91.4%)] dark:border-slate-800">
                <CardHeader>
                  <CardTitle>Creator Collaborations</CardTitle>
                  <CardDescription>Creators with complementary audiences</CardDescription>
                </CardHeader>
                <CardContent>
                  <CollaborationsPage />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- SPONSORSHIPS TAB WITH EMPTY STATE --- */}
          <TabsContent value="sponsorships" className="space-y-4">
            <EmptyState
              icon={Briefcase}
              title="No active sponsorships found"
              description="Our AI is looking for brands that align with your content. Check back in a few hours or update your profile to speed up the process."
              actionText="Update Profile"
              onAction={() => console.log("Navigate to profile")}
            />
          </TabsContent>

          <TabsContent value="collaborations" className="space-y-4">
            <CollaborationsPage showHeader={false} />
          </TabsContent>

          {/* --- ANALYTICS TAB WITH EMPTY STATE --- */}
          <TabsContent value="analytics" className="space-y-4">
            <EmptyState
              icon={TrendingUp}
              title="Analytics Data Pending"
              description="We need at least 24 hours of data to generate your first growth report. Keep creating content!"
              actionText="Connect YouTube/Instagram"
              onAction={() => console.log("Navigate to connections")}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}