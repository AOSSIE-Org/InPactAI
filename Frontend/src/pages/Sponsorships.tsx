import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
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
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Slider } from "../components/ui/slider"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

export default function SponsorshipsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white text-gray-900 dark:text-nightTS dark:bg-nightP">
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-nightP dark:text-nightTS dark:border-nightS">
                <div className="container flex h-16 items-center">
                    <Link to="/" className="flex items-center space-x-2 mr-6 ml-6">
                        <Rocket className="h-6 w-6 text-purple-600" />
                        <span className="font-bold text-xl hidden md:inline-block dark:text-nightTP">Inpact</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="w-9 px-0 hover:bg-[hsl(210,40%,96.1%)] hover:text-[hsl(222.2,47.4%,11.2%)]" asChild>
                            <Link to="/dashboard">
                                <LayoutDashboard className="h-5 w-5" />
                                <span className="sr-only">Dashboard</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-9 px-0 hover:bg-[hsl(210,40%,96.1%)] hover:text-[hsl(222.2,47.4%,11.2%)]" asChild>
                            <Link to="/dashboard/sponsorships">
                                <Briefcase className="h-5 w-5" />
                                <span className="sr-only">Sponsorships</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-9 px-0 hover:bg-[hsl(210,40%,96.1%)] hover:text-[hsl(222.2,47.4%,11.2%)]" asChild>
                            <Link to="/dashboard/collaborations">
                                <Users className="h-5 w-5" />
                                <span className="sr-only">Collaborations</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-9 px-0 hover:bg-[hsl(210,40%,96.1%)] hover:text-[hsl(222.2,47.4%,11.2%)]" asChild>
                            <Link to="/dashboard/contracts">
                                <FileText className="h-5 w-5" />
                                <span className="sr-only">Contracts</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-9 px-0 hover:bg-[hsl(210,40%,96.1%)] hover:text-[hsl(222.2,47.4%,11.2%)]" asChild>
                            <Link to="/dashboard/analytics">
                                <BarChart3 className="h-5 w-5" />
                                <span className="sr-only">Analytics</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-9 px-0 hover:bg-[hsl(210,40%,96.1%)] hover:text-[hsl(222.2,47.4%,11.2%)]" asChild>
                            <Link to="/dashboard/messages">
                                <MessageSquare className="h-5 w-5" />
                                <span className="sr-only">Messages</span>
                            </Link>
                        </Button>
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
                        <UserNav />
                    </div>
                </div>
            </header>
            <main className="flex-1 space-y-4 p-4 md:p-8 pt-6 dark:text-nightTP dark:bg-nightP">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-nightTP">AI-Driven Sponsorship Matchmaking</h1>
                    <div className="flex items-center space-x-2">
                        <Button className="bg-purple-600 text-white hover:bg-purple-700">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Create Proposal
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-nightTP">Filters</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-nightTS">Refine your sponsorship matches</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-gray-900 dark:text-nightTP">Category</Label>
                                <Select defaultValue="all">
                                    <SelectTrigger id="category" className="bg-gray-100 dark:bg-[#364152] dark:border-nightP">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-[#364152] dark:border-nightP">
                                        <SelectItem value="all" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">All Categories</SelectItem>
                                        <SelectItem value="fashion" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Fashion</SelectItem>
                                        <SelectItem value="tech" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Technology</SelectItem>
                                        <SelectItem value="beauty" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Beauty</SelectItem>
                                        <SelectItem value="fitness" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Fitness</SelectItem>
                                        <SelectItem value="food" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Food</SelectItem>
                                        <SelectItem value="travel" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Travel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-900 dark:text-nightTP">Budget Range</Label>
                                <div className="pt-2">
                                    <Slider defaultValue={[1000, 10000]} min={0} max={20000} step={100} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-nightTS">$1,000</span>
                                    <span className="text-sm text-gray-600 dark:text-nightTS">$10,000</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="campaign-type" className="text-gray-900 dark:text-nightTP">Campaign Type</Label>
                                <Select defaultValue="all">
                                    <SelectTrigger id="campaign-type" className="bg-gray-100 dark:bg-[#364152] dark:border-nightP">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-[#364152] dark:border-nightP">
                                        <SelectItem value="all" className="dark:text-nightTS dark:hover:bg-nightP">All Types</SelectItem>
                                        <SelectItem value="post" className="dark:text-nightTS dark:hover:bg-nightP">Single Post</SelectItem>
                                        <SelectItem value="series" className="dark:text-nightTS dark:hover:bg-nightP">Content Series</SelectItem>
                                        <SelectItem value="long-term" className="dark:text-nightTS dark:hover:bg-nightP">Long-term Partnership</SelectItem>
                                        <SelectItem value="affiliate" className="dark:text-nightTS dark:hover:bg-nightP">Affiliate Program</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="match-score" className="text-gray-900 dark:text-nightTP">Minimum Match Score</Label>
                                <Select defaultValue="80">
                                    <SelectTrigger id="match-score" className="bg-gray-100 dark:bg-[#364152] dark:border-nightP">
                                        <SelectValue placeholder="Select minimum score" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-[#364152] dark:border-nightP">
                                        <SelectItem value="90" className="dark:text-nightTS dark:hover:bg-nightP">90% and above</SelectItem>
                                        <SelectItem value="80" className="dark:text-nightTS dark:hover:bg-nightP">80% and above</SelectItem>
                                        <SelectItem value="70" className="dark:text-nightTS dark:hover:bg-nightP">70% and above</SelectItem>
                                        <SelectItem value="60" className="dark:text-nightTS dark:hover:bg-nightP">60% and above</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">Apply Filters</Button>
                        </CardContent>
                    </Card>

                    <div className="md:col-span-3 space-y-4">
                        <Tabs defaultValue="matches">
                            <TabsList className="grid w-full grid-cols-3 bg-gray-100  dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                <TabsTrigger value="matches">AI Matches</TabsTrigger>
                                <TabsTrigger value="active">Active Deals</TabsTrigger>
                                <TabsTrigger value="history">History</TabsTrigger>
                            </TabsList>
                            <TabsContent value="matches" className="space-y-4 pt-4">
                                <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <Avatar className="h-24 w-24 dark:bg-nightP">
                                                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="EcoStyle" />
                                                <AvatarFallback className="bg-gray-200 dark:bg-white/70 dark:border-nightP dark:text-black">ES</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-nightTP">EcoStyle</h3>
                                                        <p className="text-gray-600 dark:text-nightTS">Sustainable fashion brand</p>
                                                    </div>
                                                    <Badge className="w-fit text-lg px-3 py-1 bg-purple-100 text-purple-600">98% Match</Badge>
                                                </div>
                                                <p className="text-gray-600 dark:text-nightTS">
                                                    EcoStyle is looking for lifestyle creators who can showcase their sustainable fashion line to
                                                    environmentally conscious audiences. Their products include eco-friendly clothing,
                                                    accessories, and home goods.
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-nightTS">Budget</p>
                                                        <p className="font-medium text-gray-900 dark:text-nightTP">$3,000 - $5,000</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-nightTS">Duration</p>
                                                        <p className="font-medium text-gray-900 dark:text-nightTP">1-2 months</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-nightTS">Deliverables</p>
                                                        <p className="font-medium text-gray-900 dark:text-nightTP">1 post, 2 stories</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-nightTS">Audience Match</p>
                                                        <p className="font-medium text-gray-900 dark:text-nightTP">Very High</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 pt-4">
                                                    <Button className="bg-purple-600 text-white hover:bg-purple-700">View Full Details</Button>
                                                    <Button variant="outline" className="border-gray-200 text-gray-900 hover:bg-gray-100">
                                                        Contact Brand
                                                    </Button>
                                                    <Button variant="secondary" className="bg-gray-100 text-gray-900 hover:bg-gray-200">
                                                        Generate Proposal
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <Avatar className="h-24 w-24  dark:bg-nightP">
                                                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="TechGadgets" />
                                                <AvatarFallback className="bg-gray-200 dark:bg-white/70 dark:border-nightP dark:text-black">TG</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-nightTP">TechGadgets</h3>
                                                        <p className="text-gray-600 dark:text-nightTS">Consumer electronics company</p>
                                                    </div>
                                                    <Badge className="w-fit text-lg px-3 py-1 bg-purple-100 text-purple-600">95% Match</Badge>
                                                </div>
                                                <p className="text-gray-600 dark:text-nightTS">
                                                    TechGadgets is seeking tech-savvy creators to review and showcase their new line of smart home
                                                    products. They're looking for in-depth reviews that highlight features and user experience.
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-nightTS">Budget</p>
                                                        <p className="font-medium text-gray-900 dark:text-nightTP">$2,500 - $4,000</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-nightTS">Duration</p>
                                                        <p className="font-medium text-gray-900 dark:text-nightTP">2-3 weeks</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-nightTS">Deliverables</p>
                                                        <p className="font-medium text-gray-900 dark:text-nightTP">Review video + posts</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-nightTS">Audience Match</p>
                                                        <p className="font-medium text-gray-900 dark:text-nightTP">High</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 pt-4">
                                                    <Button className="bg-purple-600 text-white hover:bg-purple-700">View Full Details</Button>
                                                    <Button variant="outline" className="border-gray-200 text-gray-900 hover:bg-gray-100">
                                                        Contact Brand
                                                    </Button>
                                                    <Button variant="secondary" className="bg-gray-100 text-gray-900 hover:bg-gray-200">
                                                        Generate Proposal
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <Avatar className="h-24 w-24 dark:bg-nightP">
                                                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="FitLife" />
                                                <AvatarFallback className="bg-gray-200 dark:bg-white/70 dark:border-nightP dark:text-black">FL</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-nightTP">FitLife Supplements</h3>
                                                        <p className="text-gray-600 dark:text-nightTS">Health and wellness brand</p>
                                                    </div>
                                                    <Badge className="w-fit text-lg px-3 py-1 bg-purple-100 text-purple-600">92% Match</Badge>
                                                </div>
                                                <p className="text-gray-600 dark:text-nightTS">
                                                    FitLife is looking for health and fitness creators to promote their new line of plant-based
                                                    supplements. They want authentic content showing how their products integrate into a healthy
                                                    lifestyle.
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-nightTS">Budget</p>
                                                        <p className="font-medium text-gray-900 dark:text-nightTP">$1,800 - $3,500</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-nightTS">Duration</p>
                                                        <p className="font-medium text-gray-900 dark:text-nightTP">3 months</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-nightTS">Deliverables</p>
                                                        <p className="font-medium text-gray-900 dark:text-nightTP">Monthly content</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-nightTS">Audience Match</p>
                                                        <p className="font-medium text-gray-900 dark:text-nightTP">Very High</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 pt-4">
                                                    <Button className="bg-purple-600 text-white hover:bg-purple-700">View Full Details</Button>
                                                    <Button variant="outline" className="border-gray-200 text-gray-900 hover:bg-gray-100">
                                                        Contact Brand
                                                    </Button>
                                                    <Button variant="secondary" className="bg-gray-100 text-gray-900 hover:bg-gray-200">
                                                        Generate Proposal
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="active" className="pt-4">
                                <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 dark:text-nightTP">Active Sponsorships</CardTitle>
                                        <CardDescription className="text-gray-600 dark:text-nightTS">Your current brand partnerships</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 dark:text-nightTS">Your active sponsorships will appear here.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="history" className="pt-4">
                                <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 dark:text-nightTP">Sponsorship History</CardTitle>
                                        <CardDescription className="text-gray-600 dark:text-nightTS">Your past brand partnerships</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 dark:text-nightTS">Your sponsorship history will appear here.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    )
}
