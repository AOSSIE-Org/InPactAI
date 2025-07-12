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
import CreatorMatchGrid from "../components/collaboration-hub/CreatorMatchGrid";
import { mockCreatorMatches } from "../components/dashboard/creator-collaborations";
import ActiveCollabsGrid from "../components/collaboration-hub/ActiveCollabsGrid";
import React from "react";
import CollabRequests from "../components/collaboration-hub/CollabRequests";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../components/ui/dialog";
import CreatorMatchCard from "../components/collaboration-hub/CreatorMatchCard";
import ViewProfileModal from "../components/collaboration-hub/ViewProfileModal";
import { mockProfileDetails, mockCollabIdeas, mockRequestTexts } from "../components/collaboration-hub/mockProfileData";
import { Textarea } from "../components/ui/textarea";

export default function CollaborationsPage({ showHeader = true }: { showHeader?: boolean }) {
  const [showNewCollabModal, setShowNewCollabModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [collabDesc, setCollabDesc] = useState("");
  const [aiDesc, setAiDesc] = useState("");
  const [proposal, setProposal] = useState({
    contentLength: "",
    paymentSchedule: "",
    numberOfPosts: "",
    timeline: "",
    notes: ""
  });
  const [aiProposal, setAiProposal] = useState<any>(null);
  const [reviewed, setReviewed] = useState(false);
  const [showAiSearchModal, setShowAiSearchModal] = useState(false);
  const [aiSearchDesc, setAiSearchDesc] = useState("");
  const [aiSearchResults, setAiSearchResults] = useState<any[]>([]);
  const [aiSearchSubmitted, setAiSearchSubmitted] = useState(false);

  // Mock creator search (returns mockProfileDetails for any search)
  const searchResults = searchTerm ? [mockProfileDetails] : [];

  // Mock AI suggestions
  const handleAiDesc = () => {
    setAiDesc("AI Suggestion: Collaborate on a tech review series with cross-promotion and audience Q&A.");
  };
  const handleAiProposal = () => {
    setAiProposal({
      contentLength: "5-7 min video",
      paymentSchedule: "50% upfront, 50% after delivery",
      numberOfPosts: "2 Instagram posts, 1 YouTube video",
      timeline: "Within 3 weeks of product launch",
      notes: "Open to creative input and additional deliverables."
    });
  };

  // Mock AI search handler
  const handleAiSearch = () => {
    setAiSearchResults([
      mockProfileDetails, // You can add more mock creators if desired
    ]);
    setAiSearchSubmitted(true);
  };
  const handleResetAiSearch = () => {
    setAiSearchDesc("");
    setAiSearchResults([]);
    setAiSearchSubmitted(false);
    setShowAiSearchModal(false);
  };

  const handleResetModal = () => {
    setModalStep(1);
    setSearchTerm("");
    setSelectedCreator(null);
    setShowProfile(false);
    setCollabDesc("");
    setAiDesc("");
    setProposal({ contentLength: "", paymentSchedule: "", numberOfPosts: "", timeline: "", notes: "" });
    setAiProposal(null);
    setReviewed(false);
    setShowNewCollabModal(false);
  };
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {showHeader && (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container flex h-16 items-center">
            <Link to="/" className="flex items-center space-x-2 mr-6  ml-6">
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
                <Select defaultValue="all">
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
                <Select defaultValue="all">
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
                <Select defaultValue="all">
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
                <Select defaultValue="all">
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

              <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">Apply Filters</Button>
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
                  <CreatorMatchGrid creators={mockCreatorMatches} />
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
                  <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => setShowNewCollabModal(true)}>
                    + New Collaboration Request
                  </Button>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setShowAiSearchModal(true)}>
                    Find Creators with AI
                  </Button>
                </div>
                <CollabRequests />
                {/* New Collaboration Modal Placeholder */}
                {showNewCollabModal && (
                  <Dialog open={showNewCollabModal} onOpenChange={v => { if (!v) handleResetModal(); }}>
                    <DialogContent className="max-w-2xl w-full">
                      <DialogHeader>
                        <DialogTitle>New Collaboration Request</DialogTitle>
                      </DialogHeader>
                      {/* Stepper */}
                      <div className="flex justify-between mb-4 text-xs">
                        <div className={`font-bold ${modalStep === 1 ? 'text-purple-700' : 'text-gray-400'}`}>1. Search Creator</div>
                        <div className={`font-bold ${modalStep === 2 ? 'text-purple-700' : 'text-gray-400'}`}>2. Describe Collab</div>
                        <div className={`font-bold ${modalStep === 3 ? 'text-purple-700' : 'text-gray-400'}`}>3. Proposal Details</div>
                        <div className={`font-bold ${modalStep === 4 ? 'text-purple-700' : 'text-gray-400'}`}>4. Review & Send</div>
                      </div>
                      {/* Step 1: Search Creator */}
                      {modalStep === 1 && (
                        <div>
                          <Input placeholder="Search creators by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mb-4" />
                          {searchResults.length > 0 ? (
                            <div className="flex flex-col gap-4">
                              {searchResults.map((creator, idx) => (
                                <Card key={idx} className={`border-2 ${selectedCreator?.id === creator.id ? 'border-purple-500' : 'border-gray-200'}`}>
                                  <CardContent className="flex items-center gap-4">
                                    <div className="flex-1">
                                      <div className="font-bold text-lg">{creator.name}</div>
                                      <div className="text-sm text-gray-500">{creator.contentType} • {creator.location}</div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => { setSelectedCreator(creator); setShowProfile(true); }}>View Profile</Button>
                                    <Button size="sm" className="bg-purple-600 text-white" onClick={() => setSelectedCreator(creator)}>Select</Button>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-center py-8">Type a name to search for creators.</div>
                          )}
                          <div className="flex justify-end mt-6 gap-2">
                            <Button variant="outline" onClick={handleResetModal}>Cancel</Button>
                            <Button disabled={!selectedCreator} className="bg-purple-600 text-white" onClick={() => setModalStep(2)}>Next</Button>
                          </div>
                          <ViewProfileModal open={showProfile} onClose={() => setShowProfile(false)} onConnect={() => { setShowProfile(false); setSelectedCreator(searchResults[0]); }} />
                        </div>
                      )}
                      {/* Step 2: Describe Collab */}
                      {modalStep === 2 && (
                        <div>
                          <div className="mb-2 font-semibold">Describe the collaboration you're looking for</div>
                          <Textarea placeholder="Describe your ideal collaboration..." value={collabDesc} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCollabDesc(e.target.value)} rows={3} />
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={handleAiDesc}>AI Suggest</Button>
                            {aiDesc && <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded text-xs flex-1">{aiDesc}</div>}
                          </div>
                          <div className="flex justify-between mt-6 gap-2">
                            <Button variant="outline" onClick={handleResetModal}>Cancel</Button>
                            <Button variant="outline" onClick={() => setModalStep(1)}>Back</Button>
                            <Button className="bg-purple-600 text-white" onClick={() => setModalStep(3)} disabled={!collabDesc && !aiDesc}>Next</Button>
                          </div>
                        </div>
                      )}
                      {/* Step 3: Proposal Details */}
                      {modalStep === 3 && (
                        <div>
                          <div className="mb-2 font-semibold">Proposal Details</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input placeholder="Content Length (e.g. 5-7 min video)" value={proposal.contentLength} onChange={e => setProposal({ ...proposal, contentLength: e.target.value })} />
                            <Input placeholder="Payment Schedule (e.g. 50% upfront)" value={proposal.paymentSchedule} onChange={e => setProposal({ ...proposal, paymentSchedule: e.target.value })} />
                            <Input placeholder="Number of Posts (e.g. 2 IG posts)" value={proposal.numberOfPosts} onChange={e => setProposal({ ...proposal, numberOfPosts: e.target.value })} />
                            <Input placeholder="Timeline (e.g. 3 weeks)" value={proposal.timeline} onChange={e => setProposal({ ...proposal, timeline: e.target.value })} />
                          </div>
                          <Textarea placeholder="Additional Notes" value={proposal.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProposal({ ...proposal, notes: e.target.value })} className="mt-2" />
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={handleAiProposal}>AI Draft Proposal</Button>
                            {aiProposal && (
                              <div className="bg-green-50 text-green-800 px-3 py-2 rounded text-xs flex-1">
                                <div><b>AI Proposal:</b></div>
                                <div>Content Length: {aiProposal.contentLength}</div>
                                <div>Payment: {aiProposal.paymentSchedule}</div>
                                <div>Posts: {aiProposal.numberOfPosts}</div>
                                <div>Timeline: {aiProposal.timeline}</div>
                                <div>Notes: {aiProposal.notes}</div>
                                <Button size="sm" className="mt-1 bg-green-200 text-green-900" onClick={() => setProposal(aiProposal)}>Use This</Button>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between mt-6 gap-2">
                            <Button variant="outline" onClick={handleResetModal}>Cancel</Button>
                            <Button variant="outline" onClick={() => setModalStep(2)}>Back</Button>
                            <Button className="bg-purple-600 text-white" onClick={() => setModalStep(4)} disabled={!proposal.contentLength || !proposal.paymentSchedule || !proposal.numberOfPosts || !proposal.timeline}>Next</Button>
                          </div>
                        </div>
                      )}
                      {/* Step 4: Review & Send */}
                      {modalStep === 4 && (
                        <div>
                          <div className="mb-2 font-semibold">Review & Send</div>
                          <Card className="mb-4">
                            <CardHeader>
                              <CardTitle>To: {selectedCreator?.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="mb-2"><b>Description:</b> {collabDesc || aiDesc}</div>
                              <div className="mb-2"><b>Content Length:</b> {proposal.contentLength}</div>
                              <div className="mb-2"><b>Payment Schedule:</b> {proposal.paymentSchedule}</div>
                              <div className="mb-2"><b>Number of Posts:</b> {proposal.numberOfPosts}</div>
                              <div className="mb-2"><b>Timeline:</b> {proposal.timeline}</div>
                              <div className="mb-2"><b>Notes:</b> {proposal.notes}</div>
                            </CardContent>
                          </Card>
                          <div className="flex justify-between mt-6 gap-2">
                            <Button variant="outline" onClick={handleResetModal}>Cancel</Button>
                            <Button variant="outline" onClick={() => setModalStep(3)}>Back</Button>
                            <Button className="bg-green-600 text-white" onClick={() => { setReviewed(true); setTimeout(handleResetModal, 1500); }}>Send Request</Button>
                          </div>
                          {reviewed && <div className="text-green-700 text-center mt-4 font-semibold">Request Sent!</div>}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                )}
                {/* AI Search Modal */}
                {showAiSearchModal && (
                  <Dialog open={showAiSearchModal} onOpenChange={v => { if (!v) handleResetAiSearch(); }}>
                    <DialogContent className="max-w-xl w-full">
                      <DialogHeader>
                        <DialogTitle>Find Creators with AI</DialogTitle>
                      </DialogHeader>
                      <div className="mb-2 font-semibold">Describe your project or collaboration needs</div>
                      <Textarea placeholder="Describe your ideal project, campaign, or collaboration..." value={aiSearchDesc} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAiSearchDesc(e.target.value)} rows={3} />
                      <div className="flex justify-end mt-4 gap-2">
                        <Button variant="outline" onClick={handleResetAiSearch}>Cancel</Button>
                        <Button className="bg-blue-600 text-white" onClick={handleAiSearch} disabled={!aiSearchDesc}>Find Creators</Button>
                      </div>
                      {aiSearchSubmitted && (
                        <div className="mt-6">
                          <div className="font-semibold mb-2">Top AI-Suggested Creators</div>
                          <div className="flex flex-col gap-4">
                            {aiSearchResults.map((creator, idx) => (
                              <Card key={idx} className="border-2 border-blue-200">
                                <CardContent className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <div className="font-bold text-lg">{creator.name}</div>
                                    <div className="text-sm text-gray-500">{creator.contentType} • {creator.location}</div>
                                  </div>
                                  <Button size="sm" variant="outline" onClick={() => setShowProfile(true)}>View Profile</Button>
                                  <Button size="sm" className="bg-purple-600 text-white">Connect</Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

