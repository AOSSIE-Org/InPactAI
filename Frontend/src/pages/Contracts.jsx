import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  BarChart3,
  Briefcase,
  Download,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Rocket,
  Search,
  Users,
} from "lucide-react"
import {Link} from 'react-router-dom'
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ModeToggle } from "../components/mode-toggle"
import { UserNav } from "../components/user-nav"
import { Progress } from "../components/ui/progress"
import { ContractTemplates } from "../components/contracts/contract-templates"
import { ContractGenerator } from "../components/contracts/contract-generator"

export default function ContractsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2 mr-6 ml-6">
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
                placeholder="Search contracts..."
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
          <h1 className="text-3xl font-bold tracking-tight">AI-Powered Contract Assistant</h1>
          <div className="flex items-center space-x-2">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Create New Contract
            </Button>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Contracts</TabsTrigger>
            <TabsTrigger value="drafts">Draft Contracts</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="generator">AI Generator</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>EcoStyle Partnership</CardTitle>
                      <CardDescription>Sponsored content agreement</CardDescription>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Contract Value:</span>
                      <span className="font-medium">$4,500</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium">May 15, 2024</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">End Date:</span>
                      <span className="font-medium">July 15, 2024</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Deliverables:</span>
                        <span className="font-medium">2/4 Completed</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button size="sm">View Details</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>TechGadgets Review</CardTitle>
                      <CardDescription>Product review agreement</CardDescription>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Contract Value:</span>
                      <span className="font-medium">$3,200</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium">April 10, 2024</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">End Date:</span>
                      <span className="font-medium">May 25, 2024</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Deliverables:</span>
                        <span className="font-medium">1/3 Completed</span>
                      </div>
                      <Progress value={33} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button size="sm">View Details</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Sarah Johnson Collab</CardTitle>
                      <CardDescription>Creator collaboration agreement</CardDescription>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Contract Value:</span>
                      <span className="font-medium">Revenue Share</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium">June 1, 2024</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">End Date:</span>
                      <span className="font-medium">August 1, 2024</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Deliverables:</span>
                        <span className="font-medium">0/2 Completed</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button size="sm">View Details</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>FitLife Supplements</CardTitle>
                      <CardDescription>Long-term partnership</CardDescription>
                    </div>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Proposed Value:</span>
                      <span className="font-medium">$8,500 (3 months)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="font-medium">2 days ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">Awaiting brand review</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Delete Draft
                  </Button>
                  <Button size="sm">Edit Draft</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Mike Chen Tech Series</CardTitle>
                      <CardDescription>Collaboration agreement</CardDescription>
                    </div>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Proposed Value:</span>
                      <span className="font-medium">50/50 Revenue Split</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="font-medium">Yesterday</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">Negotiating terms</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Delete Draft
                  </Button>
                  <Button size="sm">Edit Draft</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <ContractTemplates />
          </TabsContent>

          <TabsContent value="generator" className="space-y-4">
            <ContractGenerator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

