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
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 mr-6 ml-6">
            <Rocket className="h-6 w-6 text-purple-600" />
            <span className="font-bold text-xl hidden md:inline-block">Inpact</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <Link to="/dashboard">
                <LayoutDashboard className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <Link to="/dashboard/sponsorships">
                <Briefcase className="h-5 w-5" />
                <span className="sr-only">Sponsorships</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <Link to="/dashboard/collaborations">
                <Users className="h-5 w-5" />
                <span className="sr-only">Collaborations</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <Link to="/dashboard/contracts">
                <FileText className="h-5 w-5" />
                <span className="sr-only">Contracts</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <Link to="/dashboard/analytics">
                <BarChart3 className="h-5 w-5" />
                <span className="sr-only">Analytics</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <Link to="/dashboard/messages">
                <MessageSquare className="h-5 w-5" />
                <span className="sr-only">Messages</span>
              </Link>
            </Button>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative hidden md:flex">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] pl-8 md:w-[300px] rounded-full bg-gray-100"
              />
            </div>
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI-Driven Sponsorship Matchmaking</h1>
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
              <CardTitle className="text-gray-900">Filters</CardTitle>
              <CardDescription className="text-gray-600">Refine your sponsorship matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-900">Category</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="category" className="bg-gray-100">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900">Budget Range</Label>
                <div className="pt-2">
                  <Slider defaultValue={[1000, 10000]} min={0} max={20000} step={100} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">$1,000</span>
                  <span className="text-sm text-gray-600">$10,000</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-type" className="text-gray-900">Campaign Type</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="campaign-type" className="bg-gray-100">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="post">Single Post</SelectItem>
                    <SelectItem value="series">Content Series</SelectItem>
                    <SelectItem value="long-term">Long-term Partnership</SelectItem>
                    <SelectItem value="affiliate">Affiliate Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="match-score" className="text-gray-900">Minimum Match Score</Label>
                <Select defaultValue="80">
                  <SelectTrigger id="match-score" className="bg-gray-100">
                    <SelectValue placeholder="Select minimum score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90% and above</SelectItem>
                    <SelectItem value="80">80% and above</SelectItem>
                    <SelectItem value="70">70% and above</SelectItem>
                    <SelectItem value="60">60% and above</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">Apply Filters</Button>
            </CardContent>
          </Card>

          <div className="md:col-span-3 space-y-4">
            <Tabs defaultValue="matches">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="matches" className="text-gray-900">AI Matches</TabsTrigger>
                <TabsTrigger value="active" className="text-gray-900">Active Deals</TabsTrigger>
                <TabsTrigger value="history" className="text-gray-900">History</TabsTrigger>
              </TabsList>
              <TabsContent value="matches" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="EcoStyle" />
                        <AvatarFallback className="bg-gray-200">ES</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">EcoStyle</h3>
                            <p className="text-gray-600">Sustainable fashion brand</p>
                          </div>
                          <Badge className="w-fit text-lg px-3 py-1 bg-purple-100 text-purple-600">98% Match</Badge>
                        </div>
                        <p className="text-gray-600">
                          EcoStyle is looking for lifestyle creators who can showcase their sustainable fashion line to
                          environmentally conscious audiences. Their products include eco-friendly clothing,
                          accessories, and home goods.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                          <div>
                            <p className="text-sm text-gray-500">Budget</p>
                            <p className="font-medium text-gray-900">$3,000 - $5,000</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-medium text-gray-900">1-2 months</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Deliverables</p>
                            <p className="font-medium text-gray-900">1 post, 2 stories</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Audience Match</p>
                            <p className="font-medium text-gray-900">Very High</p>
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

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="TechGadgets" />
                        <AvatarFallback className="bg-gray-200">TG</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">TechGadgets</h3>
                            <p className="text-gray-600">Consumer electronics company</p>
                          </div>
                          <Badge className="w-fit text-lg px-3 py-1 bg-purple-100 text-purple-600">95% Match</Badge>
                        </div>
                        <p className="text-gray-600">
                          TechGadgets is seeking tech-savvy creators to review and showcase their new line of smart home
                          products. They're looking for in-depth reviews that highlight features and user experience.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                          <div>
                            <p className="text-sm text-gray-500">Budget</p>
                            <p className="font-medium text-gray-900">$2,500 - $4,000</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-medium text-gray-900">2-3 weeks</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Deliverables</p>
                            <p className="font-medium text-gray-900">Review video + posts</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Audience Match</p>
                            <p className="font-medium text-gray-900">High</p>
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

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="FitLife" />
                        <AvatarFallback className="bg-gray-200">FL</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">FitLife Supplements</h3>
                            <p className="text-gray-600">Health and wellness brand</p>
                          </div>
                          <Badge className="w-fit text-lg px-3 py-1 bg-purple-100 text-purple-600">92% Match</Badge>
                        </div>
                        <p className="text-gray-600">
                          FitLife is looking for health and fitness creators to promote their new line of plant-based
                          supplements. They want authentic content showing how their products integrate into a healthy
                          lifestyle.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                          <div>
                            <p className="text-sm text-gray-500">Budget</p>
                            <p className="font-medium text-gray-900">$1,800 - $3,500</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-medium text-gray-900">3 months</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Deliverables</p>
                            <p className="font-medium text-gray-900">Monthly content</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Audience Match</p>
                            <p className="font-medium text-gray-900">Very High</p>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gray-900">Active Sponsorships</CardTitle>
                    <CardDescription className="text-gray-600">Your current brand partnerships</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Your active sponsorships will appear here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gray-900">Sponsorship History</CardTitle>
                    <CardDescription className="text-gray-600">Your past brand partnerships</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Your sponsorship history will appear here.</p>
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