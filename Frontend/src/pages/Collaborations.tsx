import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { ModeToggle } from "../components/mode-toggle"
import { UserNav } from "../components/user-nav"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { BarChart3, Briefcase, FileText, LayoutDashboard, MessageSquare, Rocket, Search, Users } from "lucide-react"
import {Link} from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

export default function CollaborationsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-nightTP">Creator Collaboration Hub</h1>
          <div className="flex items-center space-x-2">
            <Button className="bg-purple-600 text-white hover:bg-purple-700">
              <Users className="mr-2 h-4 w-4" />
              Find Collaborators
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-nightTP">Filters</CardTitle>
              <CardDescription className="text-gray-600 dark:text-nightTS">Find your ideal collaborators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="niche" className="text-gray-900 dark:text-nightTP">Content Niche</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="niche" className="bg-gray-100 dark:bg-[#364152] dark:border-nightP">
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#364152] dark:border-nightP">
                    <SelectItem value="all" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">All Niches</SelectItem>
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
                <Label htmlFor="audience-size" className="text-gray-900 dark:text-nightTP">Audience Size</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="audience-size" className="bg-gray-100 dark:bg-[#364152] dark:border-nightP">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#364152] dark:border-nightP">
                    <SelectItem value="all" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">All Sizes</SelectItem>
                    <SelectItem value="micro" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Micro (10K-50K)</SelectItem>
                    <SelectItem value="mid" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Mid-tier (50K-500K)</SelectItem>
                    <SelectItem value="macro" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Macro (500K-1M)</SelectItem>
                    <SelectItem value="mega" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Mega (1M+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collab-type" className="text-gray-900 dark:text-nightTP">Collaboration Type</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="collab-type" className="bg-gray-100 dark:bg-[#364152] dark:border-nightP">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#364152] dark:border-nightP">
                    <SelectItem value="all" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">All Types</SelectItem>
                    <SelectItem value="guest" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Guest Appearances</SelectItem>
                    <SelectItem value="joint" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Joint Content</SelectItem>
                    <SelectItem value="challenge" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Challenges</SelectItem>
                    <SelectItem value="series" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Content Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-900 dark:text-nightTP">Location</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="location" className="bg-gray-100 dark:bg-[#364152] dark:border-nightP">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#364152] dark:border-nightP">
                    <SelectItem value="all" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Anywhere</SelectItem>
                    <SelectItem value="us" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">United States</SelectItem>
                    <SelectItem value="europe" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Europe</SelectItem>
                    <SelectItem value="asia" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Asia</SelectItem>
                    <SelectItem value="remote" className="dark:text-nightTS dark:hover:bg-nightP dark:bg-[#364152]">Remote Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">Apply Filters</Button>
            </CardContent>
          </Card>

          <div className="md:col-span-3 space-y-4">
            <Tabs defaultValue="matches">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100  dark:bg-nightS border-b border-gray-200 dark:border-nightS dark:text-nightTS">
                <TabsTrigger value="matches">AI Matches</TabsTrigger>
                <TabsTrigger value="active">Active Collabs</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
              </TabsList>
              <TabsContent value="matches" className="space-y-4 pt-4">
                <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <Avatar className="h-24 w-24 dark:bg-nightP">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Sarah Johnson" />
                        <AvatarFallback className="bg-gray-200 dark:bg-white/70 dark:border-nightP dark:text-black">SJ</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-nightTP">Sarah Johnson</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-gray-200 dark:bg-white/70 dark:border-nightP dark:text-black mt-1">Travel</Badge>
                              <Badge variant="outline" className="bg-gray-200 dark:bg-white/70 dark:border-nightP dark:text-black mt-1">Lifestyle</Badge>
                            </div>
                          </div>
                          <Badge className="w-fit text-lg px-3 py-1 bg-purple-100 text-purple-600">95% Match</Badge>
                        </div>
                        <p className="text-gray-600 dark:text-nightTS">
                          Travel content creator specializing in sustainable tourism and local experiences. Looking to
                          collaborate with creators who share similar values and can bring complementary perspectives.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-nightTS">Audience</p>
                            <p className="font-medium text-gray-900 dark:text-nightTP">350K followers</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-nightTS">Engagement</p>
                            <p className="font-medium text-gray-900 dark:text-nightTP">4.8%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-nightTS">Location</p>
                            <p className="font-medium text-gray-900 dark:text-nightTP">Los Angeles, CA</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-nightTS">Audience Overlap</p>
                            <p className="font-medium text-gray-900 dark:text-nightTP">32%</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-4">
                          <Button className="bg-purple-600 text-white hover:bg-purple-700">View Profile</Button>
                          <Button variant="outline" className="border-gray-200 text-gray-900 hover:bg-gray-100">Message</Button>
                          <Button variant="secondary" className="bg-gray-100 text-gray-900 hover:bg-gray-200">Propose Collaboration</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Sarah Johnson" />
                        <AvatarFallback className="bg-gray-200 dark:bg-white/70 dark:border-nightP dark:text-black">SJ</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-nightTP">Sarah Johnson</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-[#262626]">Travel</Badge>
                              <Badge variant="outline" className="bg-[#262626]">Lifestyle</Badge>
                            </div>
                          </div>
                          <Badge className="w-fit text-lg px-3 py-1 bg-purple-100 text-purple-600">95% Match</Badge>
                        </div>
                        <p className="text-gray-600 dark:text-nightTS">
                          Travel content creator specializing in sustainable tourism and local experiences. Looking to
                          collaborate with creators who share similar values and can bring complementary perspectives.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-nightTS">Audience</p>
                            <p className="font-medium text-gray-900 dark:text-nightTP">350K followers</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-nightTS">Engagement</p>
                            <p className="font-medium text-gray-900 dark:text-nightTP">4.8%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-nightTS">Location</p>
                            <p className="font-medium text-gray-900 dark:text-nightTP">Los Angeles, CA</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-nightTS">Audience Overlap</p>
                            <p className="font-medium text-gray-900 dark:text-nightTP">32%</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-4">
                          <Button className="bg-purple-600 text-white hover:bg-purple-700">View Profile</Button>
                          <Button variant="outline" className="border-gray-200 text-gray-900 hover:bg-gray-100">Message</Button>
                          <Button variant="secondary" className="bg-gray-100 text-gray-900 hover:bg-gray-200">Propose Collaboration</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-300 dark:border-nightS dark:bg-nightS dark:text-nightTS">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Sarah Johnson" />
                        <AvatarFallback className="bg-gray-200 dark:bg-white/70 dark:border-nightP dark:text-black">SJ</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-nightTP">Sarah Johnson</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-[#262626]">Travel</Badge>
                              <Badge variant="outline" className="bg-[#262626]">Lifestyle</Badge>
                            </div>
                          </div>
                          <Badge className="w-fit text-lg px-3 py-1 bg-purple-100 text-purple-600">95% Match</Badge>
                        </div>
                        <p className="text-gray-600 dark:text-nightTS">
                          Travel content creator specializing in sustainable tourism and local experiences. Looking to
                          collaborate with creators who share similar values and can bring complementary perspectives.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-nightTS">Audience</p>
                            <p className="font-medium text-gray-900 dark:text-nightTP">350K followers</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-nightTS">Engagement</p>
                            <p className="font-medium text-gray-900 dark:text-nightTP">4.8%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-nightTS">Location</p>
                            <p className="font-medium text-gray-900 dark:text-nightTP">Los Angeles, CA</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-nightTS">Audience Overlap</p>
                            <p className="font-medium text-gray-900 dark:text-nightTP">32%</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-4">
                          <Button className="bg-purple-600 text-white hover:bg-purple-700">View Profile</Button>
                          <Button variant="outline" className="border-gray-200 text-gray-900 hover:bg-gray-100">Message</Button>
                          <Button variant="secondary" className="bg-gray-100 text-gray-900 hover:bg-gray-200">Propose Collaboration</Button>
                        </div>
                      </div>
                    </div>
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

