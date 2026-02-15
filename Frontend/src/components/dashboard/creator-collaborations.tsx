import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ModeToggle } from "../mode-toggle"
import { UserNav } from "../user-nav"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { BarChart3, Briefcase, FileText, LayoutDashboard, MessageSquare, Rocket, Search, Users } from "lucide-react"
import {Link} from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import CreatorMatchGrid from "../collaboration-hub/CreatorMatchGrid";
import ActiveCollabsGrid from "../collaboration-hub/ActiveCollabsGrid";
import CollabRequests from "../collaboration-hub/CollabRequests";
import { useCollaborationState } from "../../hooks/useCollaborationState";
import NewCollaborationModal from "../collaboration-hub/NewCollaborationModal";
import CreatorSearchModal from "../collaboration-hub/CreatorSearchModal";

// MOCK DATA: This will be replaced by functioning backend logic later on
export const mockCreatorMatches = [
  {
    id: 1,
    name: "TechReviewer",
    avatar: "https://via.placeholder.com/96",
    contentType: "Tech Reviews & Tutorials",
    matchPercentage: 98,
    audienceMatch: "Very High",
    followers: "1.2M",
    engagement: "4.8%",
    content: "Tech Reviews",
    collabs: 12,
    whyMatch: [
      "Complementary content styles",
      "85% audience demographic overlap",
      "Similar engagement patterns"
    ]
  },
  {
    id: 2,
    name: "GadgetGuru",
    avatar: "https://via.placeholder.com/96",
    contentType: "Unboxing & First Impressions",
    matchPercentage: 92,
    audienceMatch: "High",
    followers: "850K",
    engagement: "5.2%",
    content: "Unboxing",
    collabs: 8,
    whyMatch: [
      "Your reviews + their unboxings = perfect combo",
      "78% audience demographic overlap",
      "Different posting schedules (opportunity)"
    ]
  },
  {
    id: 3,
    name: "TechTalker",
    avatar: "https://via.placeholder.com/96",
    contentType: "Tech News & Commentary",
    matchPercentage: 87,
    audienceMatch: "Good",
    followers: "1.5M",
    engagement: "3.9%",
    content: "Tech News",
    collabs: 15,
    whyMatch: [
      "Their news + your reviews = full coverage",
      "65% audience demographic overlap",
      "Complementary content calendars"
    ]
  }
];

function CreatorCollaborations() {
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

  const handleNewCollabSubmit = (data: any) => {
    console.log("New collaboration request submitted:", data);
    // Handle the submission logic here
  };

  const handleCreatorConnect = (creator: any) => {
    console.log("Connecting with creator:", creator);
    // Handle the connection logic here
  };
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <main className="flex-1 space-y-4 pt-6">
        <div className="">
          {/* Filter TopBar */}
          <Card className="md:col-span-1 mb-4">
            <CardHeader>
              <CardTitle className="text-gray-900">Filters</CardTitle>
              {/* <CardDescription className="text-gray-600">Find your ideal collaborators</CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-4 ">
              <div className="flex p-3 gap-2">
                <div className="space-y-2 flex flex-col grow">
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

                <div className=" space-y-2 flex flex-col grow">
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

                <div className="space-y-2 flex flex-col grow">
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

                <div className="space-y-2 flex flex-col grow">
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
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                >
                  Reset Filters
                </Button>
                <Button className="flex-1 bg-purple-600 text-white hover:bg-purple-700">
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
                  <Button className="bg-yellow-400 text-white hover:bg-yellow-500">Refresh Matches</Button>
                </div>
                {/* Creator Match Grid with Pagination */}
                <div className="w-full">
                  <CreatorMatchGrid maxgridsize={3} creators={mockCreatorMatches} />
                </div>
                {/* View More Recommendations Button */}
                <div className="flex justify-center mt-6">
                  <Button className="bg-gray-100 text-gray-900 hover:bg-gray-200">View More Recommendations</Button>
                </div>
              </TabsContent>
              <TabsContent value="active" className="space-y-4 pt-4">
                <ActiveCollabsGrid />
              </TabsContent>
              <TabsContent value="requests" className="space-y-4 pt-4">
                <div className="flex justify-end mb-4 gap-2">
                  <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={openNewCollaborationModal}>
                    + New Collaboration Request
                  </Button>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={openAiSearchModal}>
                    Find Creators with AI
                  </Button>
                </div>
                <CollabRequests />
                
                {/* New Collaboration Modal */}
                <NewCollaborationModal 
                  open={modals.newCollaboration}
                  onClose={closeNewCollaborationModal}
                  onSubmit={handleNewCollabSubmit}
                />
                
                {/* AI Creator Search Modal */}
                <CreatorSearchModal 
                  open={modals.aiSearch}
                  onClose={closeAiSearchModal}
                  onConnect={handleCreatorConnect}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}


export default CreatorCollaborations