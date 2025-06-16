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
    Icon,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Rocket,
    Search,
    Users,
} from "lucide-react"
import { PerformanceMetrics } from "../components/dashboard/performance-metrics"
import { RecentActivity } from "../components/dashboard/recent-activity"
import { SponsorshipMatches } from "../components/dashboard/sponsorship-matches"
import { useAuth } from "../context/AuthContext"

export default function DashboardPage() {
    const { logout } = useAuth();

    return (
        <div className="flex min-h-screen flex-col bg-[hsl(0,0%,100%)] text-[hsl(222.2,84%,4.9%)] dark:text-nightTS">
            <header className="sticky top-0 z-50 w-full border-b border-[hsl(214.3,31.8%,91.4%)] bg-[rgba(255,255,255,0.95)] backdrop-blur supports-[backdrop-filter]:bg-[hsla(0,0%,100%,0.6)] dark:bg-nightP dark:text-nightTS dark:border-white">
                <div className="container flex h-16 items-center">
                    <Link to="/" className="flex items-center space-x-2 mr-6  ml-6">
                        <Rocket className="h-6 w-6 text-[hsl(262.1,83.3%,57.8%)]" />
                        <span className="font-bold text-xl hidden md:inline-block dark:text-nightTP">Inpact</span>
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
                    <div className="ml-auto flex items-center space-x-3">
                        <div className="relative hidden md:flex">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS" />
                            <Input
                                type="search"
                                placeholder="Search..."
                                className="w-[200px] pl-8 md:w-[300px] rounded-full bg-[hsl(210,40%,96.1%)] border-[hsl(214.3,31.8%,91.4%)] dark:bg-[#364152] dark:border-nightP" />
                        </div>
                        <ModeToggle />
                        <Button onClick={logout} variant="ghost" className="w-9 px-0 hover:bg-[hsl(210,40%,96.1%)] hover:text-[hsl(222.2,47.4%,11.2%)]">
                            <LogOut />
                        </Button>
                        <UserNav />
                    </div>
                </div>
            </header>
            <main className="flex-1 space-y-4 p-4 md:p-8 pt-6  dark:text-nightTP dark:bg-nightP">
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
                    <TabsList className="bg-white border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                        <TabsTrigger
                            value="overview"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="sponsorships"
                        >
                            Sponsorships
                        </TabsTrigger>
                        <TabsTrigger
                            value="collaborations"
                        >
                            Collaborations
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                        >
                            Analytics
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[hsl(222.2,84%,4.9%)] dark:text-nightTS">$45,231.89</div>
                                    <p className="text-xs text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">+20.1% from last month</p>
                                </CardContent>
                            </Card>
                            <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">Active Sponsorships</CardTitle>
                                    <Briefcase className="h-4 w-4 text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[hsl(222.2,84%,4.9%)] dark:text-nightTS">12</div>
                                    <p className="text-xs text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">+3 from last month</p>
                                </CardContent>
                            </Card>
                            <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">Collaborations</CardTitle>
                                    <Users className="h-4 w-4 text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[hsl(222.2,84%,4.9%)] dark:text-nightTS">8</div>
                                    <p className="text-xs text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">+2 from last month</p>
                                </CardContent>
                            </Card>
                            <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">Audience Growth</CardTitle>
                                    <BarChart3 className="h-4 w-4 text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[hsl(222.2,84%,4.9%)] dark:text-nightTS">+12.5%</div>
                                    <p className="text-xs text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">+2.1% from last month</p>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4 border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                <CardHeader>
                                    <CardTitle className="text-[hsl(222.2,84%,4.9%)] dark:text-nightTP">Performance Metrics</CardTitle>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <PerformanceMetrics />
                                </CardContent>
                            </Card>
                            <Card className="col-span-3 border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                <CardHeader>
                                    <CardTitle className="text-[hsl(222.2,84%,4.9%)] dark:text-nightTP">Recent Activity</CardTitle>
                                    <CardDescription className="text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">Your latest interactions and updates</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RecentActivity />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4 border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                <CardHeader>
                                    <CardTitle className="text-[hsl(222.2,84%,4.9%)] dark:text-nightTP">AI-Matched Sponsorships</CardTitle>
                                    <CardDescription className="text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">Brands that match your audience and content</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SponsorshipMatches />
                                </CardContent>
                            </Card>
                            <Card className="col-span-3 border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                <CardHeader>
                                    <CardTitle className="text-[hsl(222.2,84%,4.9%)] dark:text-nightTP">Creator Collaborations</CardTitle>
                                    <CardDescription className="text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">Creators with complementary audiences</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* <CreatorCollaborations /> */}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="sponsorships" className="space-y-4">
                        <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                            <CardHeader>
                                <CardTitle className="text-[hsl(222.2,84%,4.9%)] dark:text-nightTS">AI-Driven Sponsorship Matchmaking</CardTitle>
                                <CardDescription className="text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">Discover brands that align with your audience and content style</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border border-[hsl(214.3,31.8%,91.4%)] bg-[hsl(210,40%,96.1%)] p-4 dark:bg-nightS dark:border-nightP">
                                    <h3 className="text-lg font-semibold text-[hsl(222.2,84%,4.9%)] dark:text-nightTS">Coming Soon</h3>
                                    <p className="text-sm text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">
                                        The full sponsorship matchmaking interface will be available here.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="collaborations" className="space-y-4">
                        <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                            <CardHeader>
                                <CardTitle className="text-[hsl(222.2,84%,4.9%)] dark:text-nightTS">Creator Collaboration Hub</CardTitle>
                                <CardDescription className="text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">Find and partner with creators who have complementary audiences</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border border-[hsl(214.3,31.8%,91.4%)] bg-[hsl(210,40%,96.1%)] p-4  dark:bg-nightS dark:border-nightP">
                                    <h3 className="text-lg font-semibold text-[hsl(222.2,84%,4.9%)] dark:text-nightTS">Coming Soon</h3>
                                    <p className="text-sm text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">
                                        The full creator collaboration interface will be available here.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="analytics" className="space-y-4">
                        <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                            <CardHeader>
                                <CardTitle className="text-[hsl(222.2,84%,4.9%)] dark:text-nightTS">Performance Analytics & ROI Tracking</CardTitle>
                                <CardDescription className="text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">Track sponsorship performance and campaign success</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border border-[hsl(214.3,31.8%,91.4%)] bg-[hsl(210,40%,96.1%)] p-4 dark:bg-nightS dark:border-nightP">
                                    <h3 className="text-lg font-semibold text-[hsl(222.2,84%,4.9%)] dark:text-nightTS">Coming Soon</h3>
                                    <p className="text-sm text-[hsl(215.4,16.3%,46.9%)] dark:text-nightTS">
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
