import React from "react"
import { Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Button } from "../components/ui/button"
import {
  BarChart3,
  Briefcase,
  DollarSign,
  LayoutDashboard,
  MessageSquare,
  Rocket,
  Users,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Heart,
} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { PerformanceMetrics } from "../components/dashboard/performance-metrics"
import { RecentActivity } from "../components/dashboard/recent-activity"
import { SponsorshipMatches } from "../components/dashboard/sponsorship-matches"
import { useAuth } from "../context/AuthContext"
import CreateCampaignDialog from "@/components/Campaign/CreateCampaign"
import CollaborationsPage from "./Collaborations"

export default function DashboardPage() {
  const { user } = useAuth()

  

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="h-6 w-6 text-purple-600" />
            <span className="font-bold text-xl">Inpact</span>
            <nav className="hidden md:flex items-center space-x-6 ml-6 text-sm text-gray-600">
              <Link to="/dashboard" className="hover:text-purple-600 flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link to="/dashboard/sponsorships" className="hover:text-purple-600 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Sponsorships
              </Link>
              <Link to="/dashboard/collaborations" className="hover:text-purple-600 flex items-center gap-2">
                <Users className="h-4 w-4" /> Collaborations
              </Link>
              <Link to="/dashboard/messages" className="hover:text-purple-600 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Messages
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
           
            <CreateCampaignDialog>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm">
                <DollarSign className="mr-2 h-4 w-4" /> New Campaign
              </Button>
            </CreateCampaignDialog>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* HERO SECTION */}
        <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name || "Creator"} 👋
          </h1>
          <p className="mt-2 text-white/80">
            Your performance, sponsorships, and collaborations — all in one place.
          </p>
        </section>

        {/* PERFORMANCE OVERVIEW */}
        <section>
          <Card className="rounded-2xl border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Monthly snapshot of your brand’s performance.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Revenue", icon: DollarSign, value: "$45,200", growth: "+18%" },
                { title: "Active Campaigns", icon: Briefcase, value: "12", growth: "+2" },
                { title: "Collaborations", icon: Users, value: "8", growth: "+3" },
                { title: "Engagement", icon: BarChart3, value: "5.3%", growth: "+1.1%" },
              ].map((i) => (
                <div
                  key={i.title}
                  className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm text-gray-600">{i.title}</h3>
                    <i.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold mt-3">{i.value}</p>
                  <p className="text-xs text-green-600 mt-1">{i.growth} this month</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* PERFORMANCE CHARTS */}
        <section>
          <Card className="rounded-2xl border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Analytics & Trends</CardTitle>
              <CardDescription>
                Engagement rate, audience growth, and sponsorship conversions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceMetrics />
            </CardContent>
          </Card>
        </section>

        {/* RECENT ACTIVITY */}
        <section>
          <Card className="rounded-2xl border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest sponsorships and collaboration updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </section>

        {/* CREATOR COLLABORATIONS */}
        <section className="w-full">
          <Card className="rounded-2xl border-gray-200 shadow-sm w-full">
            <CardHeader>
              <CardTitle>Creator Collaborations</CardTitle>
              <CardDescription>
                Explore creators with aligned audiences and engagement.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <CollaborationsPage />
            </CardContent>
          </Card>
        </section>

        {/* AI-MATCHED SPONSORSHIPS */}
        <section>
          <Card className="rounded-2xl border-gray-200 shadow-sm">
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>AI-Matched Sponsorships</CardTitle>
                <CardDescription>Smart recommendations for you.</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <RefreshCw className="mr-1 h-4 w-4" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <SponsorshipMatches creatorId={user?.id || ""} />
            </CardContent>
          </Card>
        </section>

        {/* INSIGHTS & TRENDS */}
        <section>
          <Card className="rounded-2xl border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Insights & Highlights</CardTitle>
              <CardDescription>Key trends from your recent activity.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: TrendingUp,
                  title: "Audience Growth Spike",
                  desc: "+12% increase due to consistent posting.",
                },
                {
                  icon: Sparkles,
                  title: "Top Performing Post",
                  desc: "‘AI in Tech’ gained 7k engagements last week.",
                },
                {
                  icon: Heart,
                  title: "Most Engaged Audience",
                  desc: "18–24 age group contributes 42% engagement.",
                },
              ].map((x) => (
                <div
                  key={x.title}
                  className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
                >
                  <x.icon className="h-5 w-5 text-purple-600 mb-2" />
                  <h3 className="font-semibold">{x.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{x.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* FINAL TABS SECTION */}
        <section>
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="bg-gray-100 rounded-lg w-fit mb-5 mx-auto">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="sponsorships">Sponsorships</TabsTrigger>
              <TabsTrigger value="collabs">Collaborations</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <Card className="rounded-2xl shadow-sm text-center py-10 w-full">
                <h3 className="text-xl font-semibold">Analytics Overview</h3>
                <p className="text-gray-500 mt-2">Comprehensive data coming soon.</p>
              </Card>
            </TabsContent>

            <TabsContent value="sponsorships">
              <Card className="rounded-2xl shadow-sm text-center py-10 w-full">
                <h3 className="text-xl font-semibold">Sponsorship Insights</h3>
                <p className="text-gray-500 mt-2">ROI and conversion tracking coming soon.</p>
              </Card>
            </TabsContent>

            <TabsContent value="collabs">
              <Card className="rounded-2xl shadow-sm text-center py-10 w-full">
                <h3 className="text-xl font-semibold">Collaboration Analytics</h3>
                <p className="text-gray-500 mt-2">Synergy graphs and overlap data soon.</p>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  )
}
