import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ModeToggle } from "../components/mode-toggle";
import { UserNav } from "../components/user-nav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { BarChart3, Briefcase, FileText, LayoutDashboard, MessageSquare, Rocket, Search, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import CreatorMatchGrid from "../components/collaboration-hub/CreatorMatchGrid";
import { mockCreatorMatches } from "../components/dashboard/creator-collaborations";
import ActiveCollabsGrid from "../components/collaboration-hub/ActiveCollabsGrid";
import CollabRequests from "../components/collaboration-hub/CollabRequests";
import { useCollaborationState } from "../hooks/useCollaborationState";
import NewCollaborationModal from "../components/collaboration-hub/NewCollaborationModal";
import CreatorSearchModal from "../components/collaboration-hub/CreatorSearchModal";

interface CollaborationData {
  title: string;
  description: string;
  creatorId: string;
  [key: string]: unknown;
}

interface Creator {
  id: string;
  name: string;
  [key: string]: unknown;
}

export default function CollaborationsPage({ showHeader = true }: { showHeader?: boolean }) {
  const {
    modals,
    filters,
    openNewCollaborationModal,
    closeNewCollaborationModal,
    openAiSearchModal,
    closeAiSearchModal,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    activeFiltersCount,
  } = useCollaborationState();

  const handleNewCollabSubmit = (data: CollaborationData) => {
    console.log("New collaboration request submitted:", data);
    // Handle the submission logic here
  };

  const handleCreatorConnect = (creator: Creator) => {
    console.log("Connecting with creator:", creator);
    // Handle the connection logic here
  };
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {showHeader && (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
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
      )}
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Filter Sidebar */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-gray-900">Filters</CardTitle>
              <CardDescription className="text-gray-600">Find your ideal collaborators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="niche" className="text-gray-900">Content Niche</Label>
                <Select value={filters.niche} onValueChange={(value) => updateFilter('niche', value)}>
                  <SelectTrigger id="niche" className="bg-gray-100">
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Niches</SelectItem>
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
                <Label htmlFor="audience-size" className="text-gray-900">Audience Size</Label>
                <Select value={filters.audienceSize} onValueChange={(value) => updateFilter('audienceSize', value)}>
                  <SelectTrigger id="audience-size" className="bg-gray-100">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="micro">Micro (10K-50K)</SelectItem>
                    <SelectItem value="mid">Mid-tier (50K-500K)</SelectItem>
                    <SelectItem value="macro">Macro (500K-1M)</SelectItem>
                    <SelectItem value="mega">Mega (1M+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collab-type" className="text-gray-900">Collaboration Type</Label>
                <Select value={filters.collaborationType} onValueChange={(value) => updateFilter('collaborationType', value)}>
                  <SelectTrigger id="collab-type" className="bg-gray-100">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="guest">Guest Appearances</SelectItem>
                    <SelectItem value="joint">Joint Content</SelectItem>
                    <SelectItem value="challenge">Challenges</SelectItem>
                    <SelectItem value="series">Content Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-900">Location</Label>
                <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
                  <SelectTrigger id="location" className="bg-gray-100">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Anywhere</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="remote">Remote Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  aria-label="Reset all filters"
                >
                  Reset Filters
                </Button>
                <Button 
                  className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
                  aria-label="Apply selected filters"
                >
                  Apply Filters
                </Button>
              </div>
              {hasActiveFilters && (
                <div className="text-sm text-gray-600 text-center">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                </div>
              )}
            </CardContent>
          </Card>
          {/* Main Content */}
          <div className="md:col-span-3 pl-0 md:pl-4 space-y-4 w-full">
            {/* Tabs for AI Matches, Active Collabs, Requests */}
            <Tabs defaultValue="matches">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 mb-2">
                <TabsTrigger value="matches" className="text-gray-900">AI Matches</TabsTrigger>
                <TabsTrigger value="active" className="text-gray-900">Active Collabs</TabsTrigger>
                <TabsTrigger value="requests" className="text-gray-900">Requests</TabsTrigger>
              </TabsList>
              <TabsContent value="matches" className="space-y-4 pt-2">
                {/* Banner */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-500 text-xl">⚡</span>
                      <span className="font-semibold text-yellow-800">AI-Powered Creator Matching</span>
                    </div>
                    <div className="text-yellow-900 text-sm">Our AI analyzes your content style, audience demographics, and engagement patterns to find your ideal collaborators.</div>
                  </div>
                  <Button 
                    className="bg-yellow-400 text-white hover:bg-yellow-500"
                    aria-label="Refresh AI matches"
                  >
                    Refresh Matches
                  </Button>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end mb-4 gap-2">
                  <Button 
                    className="bg-purple-600 text-white hover:bg-purple-700" 
                    onClick={openNewCollaborationModal}
                    aria-label="Create new collaboration request"
                  >
                    + New Collaboration Request
                  </Button>
                  <Button 
                    className="bg-blue-600 text-white hover:bg-blue-700" 
                    onClick={openAiSearchModal}
                    aria-label="Search for creators using AI"
                  >
                    Find Creators with AI
                  </Button>
                </div>
                {/* Creator Match Grid with Pagination */}
                <div className="w-full">
                  <CreatorMatchGrid creators={mockCreatorMatches} />
                </div>
                {/* View More Recommendations Button */}
                <div className="flex justify-center mt-6">
                  <Button 
                    className="bg-gray-100 text-gray-900 hover:bg-gray-200"
                    aria-label="Load more creator recommendations"
                  >
                    View More Recommendations
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="active" className="space-y-4 pt-4">
                <ActiveCollabsGrid />
              </TabsContent>
              <TabsContent value="requests" className="space-y-4 pt-4">
                <CollabRequests />
              </TabsContent>
            </Tabs>
            
            {/* Global Modals - accessible from any tab */}
            <NewCollaborationModal 
              open={modals.newCollaboration}
              onClose={closeNewCollaborationModal}
              onSubmit={handleNewCollabSubmit}
            />
            
            <CreatorSearchModal 
              open={modals.aiSearch}
              onClose={closeAiSearchModal}
              onConnect={handleCreatorConnect}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

