import Chat from "@/components/chat/chat";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  BarChart3,
  Users,
  MessageSquareMore,
  TrendingUp,
  Search,
  Bell,
  UserCircle,
  FileText,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart,
  ChevronRight,
  FileSignature,
  LineChart,
  Activity,
  Rocket,
} from "lucide-react";
import { CreatorMatches } from "../../components/dashboard/creator-matches";
import { useState } from "react";

const Dashboard = () => {
  // Mock sponsorships for selection (replace with real API call if needed)
  const sponsorships = [
    { id: "1", title: "Summer Collection" },
    { id: "2", title: "Tech Launch" },
    { id: "3", title: "Fitness Drive" },
  ];
  const [selectedSponsorship, setSelectedSponsorship] = useState<string>("");

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="border-neutral-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Rocket className="h-8 w-8 text-purple-700" />
                <span className="ml-2 text-xl font-bold text-black">
                  Inpact
                </span>
                <span className="ml-1 mb-3 text-sm font-medium text-purple-500">
                  Brand
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Bell className="h-6 w-6 text-gray-500 hover:text-purple-700 cursor-pointer" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-purple-700 text-[10px] font-bold text-white flex items-center justify-center">
                    3
                  </span>
                </div>
                <UserCircle className="h-8 w-8 text-gray-500 hover:text-purple-700 cursor-pointer" />
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Brand Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Discover and collaborate with creators that match your brand
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 border-neutral-200" />
            <Input
              className="pl-10 border border-gray-300"
              placeholder="Search creators by niche, audience size, or location..."
            />
          </div>

          {/* Main Content */}
          <Tabs defaultValue="discover" className="space-y-8">
            <TabsList className="bg-white border border-gray-300">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
            </TabsList>

            {/* Discover Tab */}
            <TabsContent value="discover" className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-gray-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
                    <CardTitle className="text-sm font-medium">
                      Active Creators
                    </CardTitle>
                    <Users className="h-4 w-4 text-purple-700" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12,234</div>
                    <p className="text-xs text-muted-foreground">
                      +180 from last month
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg. Engagement
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-700" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.5%</div>
                    <p className="text-xs text-muted-foreground">
                      +0.3% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Campaigns
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-purple-700" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">
                      8 pending approval
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Messages
                    </CardTitle>
                    <MessageSquareMore className="h-4 w-4 text-purple-700" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">
                      3 unread messages
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Creator Recommendations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Matched Creators for Your Campaign
                  </h2>
                </div>
                <div className="mb-4">
                  <label htmlFor="sponsorship-select" className="mr-2 font-medium">Select Campaign:</label>
                  <select
                    id="sponsorship-select"
                    value={selectedSponsorship}
                    onChange={e => setSelectedSponsorship(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">-- Select --</option>
                    {sponsorships.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <CreatorMatches sponsorshipId={selectedSponsorship} />
              </div>
            </TabsContent>

            {/* Contracts Tab */}
            <TabsContent value="contracts" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Active Contracts
                </h2>
                <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                  <FileSignature className="mr-2 h-4 w-4" />
                  New Contract
                </Button>
              </div>

              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <img
                          src={`https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cG90cmFpdHxlbnwwfHwwfHx8MA%3D%3D`}
                          alt="Creator"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Summer Collection Campaign
                          </h3>
                          <p className="text-sm text-gray-500">
                            with Alex Rivera
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              Due in 12 days
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                        <p className="mt-2 text-sm font-medium text-gray-900">
                          $2,400
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex gap-4">
                        <Button variant="default" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          View Contract
                        </Button>
                        <Button variant="default" size="sm">
                          <MessageSquareMore className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent
              value="messages"
              //  className="grid grid-cols-12 gap-6"
            >
              <Chat />
            </TabsContent>

            {/* Tracking Tab */}
            <TabsContent value="tracking" className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-gray-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Reach
                    </CardTitle>
                    <Users className="h-4 w-4 text-purple-700" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2.4M</div>
                    <p className="text-xs text-muted-foreground">
                      Across all campaigns
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Engagement Rate
                    </CardTitle>
                    <Activity className="h-4 w-4 text-purple-700" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">5.2%</div>
                    <p className="text-xs text-muted-foreground">
                      Average across creators
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">ROI</CardTitle>
                    <LineChart className="h-4 w-4 text-purple-700" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3.8x</div>
                    <p className="text-xs text-muted-foreground">
                      Last 30 days
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-gray-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Posts
                    </CardTitle>
                    <BarChart className="h-4 w-4 text-purple-700" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-xs text-muted-foreground">
                      Across platforms
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-300">
                <h3 className="text-lg font-semibold mb-4">
                  Campaign Performance
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="border-neutral-200 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHBvdHJhaXR8ZW58MHx8MHx8fDA%3D`}
                            alt="Creator"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-medium">Summer Collection</h4>
                            <p className="text-sm text-gray-500">
                              with Sarah Parker
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">458K Reach</p>
                          <p className="text-sm text-gray-500">
                            6.2% Engagement
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>12 Posts Live</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>2 Pending</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
