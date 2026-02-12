import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import { ModeToggle } from "../components/mode-toggle";
import { UserNav } from "../components/user-nav";
import { 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  Users, 
  BarChart3,
  Send,
  Edit,
  Download,
  Eye,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Star,
  TrendingUp,
  Activity,
  LayoutDashboard,
  Briefcase,
  Search,
  Rocket,
  X
} from "lucide-react";
import { activeCollabsMock } from "../components/collaboration-hub/activeCollabsMockData";
import CollaborationOverviewTab from "../components/collaboration-hub/CollaborationOverviewTab";
import CollaborationMessagesTab from "../components/collaboration-hub/CollaborationMessagesTab";
import CollaborationTimelineTab from "../components/collaboration-hub/CollaborationTimelineTab";
import CollaboratorSidebar from "../components/collaboration-hub/CollaboratorSidebar";
import CollaborationQuickActions from "../components/collaboration-hub/CollaborationQuickActions";
import CollaborationProjectStats from "../components/collaboration-hub/CollaborationProjectStats";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface Deliverable {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "review";
  dueDate: string;
  assignedTo: string;
  files?: string[];
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: "upcoming" | "in-progress" | "completed";
  progress: number;
}

const mockMessages: Message[] = [
  {
    id: 1,
    sender: "GadgetGuru",
    content: "Hey! I've started working on the unboxing video. Should have the first draft ready by tomorrow.",
    timestamp: "2024-06-10 14:30",
    isOwn: false
  },
  {
    id: 2,
    sender: "You",
    content: "Perfect! Looking forward to seeing it. Any specific angles you want to focus on?",
    timestamp: "2024-06-10 15:45",
    isOwn: true
  },
  {
    id: 3,
    sender: "GadgetGuru",
    content: "I'm thinking close-ups of the packaging and then a reveal shot. Also planning to include some B-roll of the setup process.",
    timestamp: "2024-06-10 16:20",
    isOwn: false
  }
];

const mockDeliverables: Deliverable[] = [
  {
    id: 1,
    title: "Unboxing Video",
    description: "Main unboxing video showcasing the product features",
    status: "in-progress",
    dueDate: "2024-06-12",
    assignedTo: "GadgetGuru",
    files: ["unboxing_draft_v1.mp4"]
  },
  {
    id: 2,
    title: "Thumbnail Design",
    description: "Eye-catching thumbnail for the video",
    status: "completed",
    dueDate: "2024-06-10",
    assignedTo: "GadgetGuru",
    files: ["thumbnail_final.png"]
  },
  {
    id: 3,
    title: "Social Media Posts",
    description: "Instagram and TikTok posts promoting the collaboration",
    status: "pending",
    dueDate: "2024-06-15",
    assignedTo: "GadgetGuru"
  }
];

const mockMilestones: Milestone[] = [
  {
    id: 1,
    title: "Project Kickoff",
    description: "Initial meeting and project setup",
    dueDate: "2024-06-01",
    status: "completed",
    progress: 100
  },
  {
    id: 2,
    title: "Content Creation",
    description: "Video production and editing",
    dueDate: "2024-06-12",
    status: "in-progress",
    progress: 65
  },
  {
    id: 3,
    title: "Review & Approval",
    description: "Content review and final approval",
    dueDate: "2024-06-14",
    status: "upcoming",
    progress: 0
  },
  {
    id: 4,
    title: "Publication",
    description: "Video goes live on all platforms",
    dueDate: "2024-06-15",
    status: "upcoming",
    progress: 0
  }
];

export default function CollaborationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showContractModal, setShowContractModal] = useState(false);
  const [messageStyle, setMessageStyle] = useState("professional");
  const [showStyleOptions, setShowStyleOptions] = useState(false);
  const [customStyle, setCustomStyle] = useState("");
  const [isEditingUpdate, setIsEditingUpdate] = useState(false);
  const [editedUpdate, setEditedUpdate] = useState("");
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);

  // Find the collaboration data
  const collaboration = activeCollabsMock.find(collab => collab.id === parseInt(id || "1"));

  if (!collaboration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Collaboration Not Found</h2>
          <p className="text-gray-600 mb-4">The collaboration you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/dashboard/collaborations")}>
            Back to Collaborations
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-100 text-blue-700";
      case "Awaiting Response": return "bg-yellow-100 text-yellow-700";
      case "Completed": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getDeliverableStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in-progress": return "bg-blue-100 text-blue-700";
      case "review": return "bg-yellow-100 text-yellow-700";
      case "pending": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in-progress": return "bg-blue-100 text-blue-700";
      case "upcoming": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the backend
      setNewMessage("");
    }
  };

  const handleViewContract = () => {
    setShowContractModal(true);
  };

  // Mock contract URL - in a real app, this would come from the collaboration data
  const contractUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  // Message style options for AI enhancement
  const messageStyles = [
    { value: "professional", label: "Professional", description: "Formal and business-like" },
    { value: "casual", label: "Casual", description: "Friendly and relaxed" },
    { value: "polite", label: "Polite", description: "Courteous and respectful" },
    { value: "concise", label: "Concise", description: "Brief and to the point" },
    { value: "enthusiastic", label: "Enthusiastic", description: "Energetic and positive" },
    { value: "constructive", label: "Constructive", description: "Helpful and solution-focused" }
  ];

  /**
   * AI Message Style Enhancement Feature(Not implemented yet)
   * i am putting this here for future reference for contributors...
   * This feature allows users to enhance their message content using AI to match different communication styles.
   * 
   * Requirements for future development:
   * 1. Integration with LLM API (OpenAI, Anthropic, etc.) to generate styled messages
   * 2. Real-time message transformation as user types or selects style
   * 3. Support for custom style descriptions (user-defined tone/approach)
   * 4. Context awareness - consider collaboration history and relationship
   * 5. Style suggestions based on message content and collaboration stage
   * 6. Option to preview changes before applying
   * 7. Learning from user preferences and successful communication patterns
   * 8. Integration with collaboration analytics to suggest optimal communication timing
   * 
   * Technical considerations:
   * - API rate limiting and error handling
   * - Caching of common style transformations
   * - Privacy and data security for message content
   * - Real-time collaboration features (typing indicators, etc.)
   */
  const handleStyleChange = (style: string) => {
    setMessageStyle(style);
    setShowStyleOptions(false);
    
    // TODO: Implement AI message transformation
    // This would call an LLM API to transform the current message
    // Example API call structure:
    // const transformedMessage = await transformMessageStyle(newMessage, style);
    // setNewMessage(transformedMessage);
  };

  const handleCustomStyle = () => {
    if (customStyle.trim()) {
      // TODO: Implement custom style transformation
      // This would use the custom style description to guide the AI transformation
      setCustomStyle("");
      setShowStyleOptions(false);
    }
  };

  const handleEditUpdate = () => {
    setEditedUpdate(collaboration.latestUpdate);
    setIsEditingUpdate(true);
  };

  const handleSaveUpdate = () => {
    // TODO: Implement API call to save the updated latest update
    // This would update the collaboration's latest update in the backend
    // For now, we'll just close the edit mode
    // In a real app, you would update the collaboration object here
    setIsEditingUpdate(false);
  };

  const handleCancelEdit = () => {
    setIsEditingUpdate(false);
    setEditedUpdate("");
  };

  const handleViewDeliverable = (deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable);
    setShowDeliverableModal(true);
  };

  const handleCloseDeliverableModal = () => {
    setShowDeliverableModal(false);
    setSelectedDeliverable(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Main Header */}
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
                <Link to={to} title={label} aria-label={label}>
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

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/collaborations")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Collaborations
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{collaboration.collabTitle}</h1>
                <p className="text-gray-600">Collaboration with {collaboration.collaborator.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(collaboration.status)}>
                {collaboration.status}
              </Badge>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <CollaborationOverviewTab
                  collaboration={collaboration}
                  isEditingUpdate={isEditingUpdate}
                  editedUpdate={editedUpdate}
                  handleEditUpdate={handleEditUpdate}
                  handleSaveUpdate={handleSaveUpdate}
                  handleCancelEdit={handleCancelEdit}
                  setEditedUpdate={setEditedUpdate}
                />
                {/* AI Project Overview & Recommendations remains inline for now */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      AI Project Overview & Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Project Health Analysis</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          This collaboration is progressing well with 65% timeline completion. 
                          The content creation phase is active and on track. 
                          Communication frequency is optimal for this stage of the project.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Current Timeline Recommendations</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">
                            <strong>Content Creation Phase:</strong> Consider scheduling a review meeting 
                            within the next 2 days to ensure alignment on video direction and style.
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">
                            <strong>Quality Check:</strong> Request a preview of the thumbnail design 
                            to provide early feedback and avoid last-minute revisions.
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">
                            <strong>Risk Mitigation:</strong> Prepare backup content ideas in case 
                            the current direction needs adjustment.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Communication Tips</h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          <strong>Pro Tip:</strong> Use specific feedback when reviewing content. 
                          Instead of "make it better," try "increase the energy in the first 30 seconds" 
                          or "add more close-up shots of the product features."
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Messages Tab */}
              <TabsContent value="messages" className="space-y-4">
                <CollaborationMessagesTab
                  mockMessages={mockMessages}
                  messageStyles={messageStyles}
                  messageStyle={messageStyle}
                  showStyleOptions={showStyleOptions}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  setShowStyleOptions={setShowStyleOptions}
                  handleStyleChange={handleStyleChange}
                  customStyle={customStyle}
                  setCustomStyle={setCustomStyle}
                  handleCustomStyle={handleCustomStyle}
                />
              </TabsContent>
              {/* Deliverables Tab */}
              <TabsContent value="deliverables" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Deliverables
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockDeliverables.map((deliverable) => (
                        <div key={deliverable.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{deliverable.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                            </div>
                            <Badge className={getDeliverableStatusColor(deliverable.status)}>
                              {deliverable.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Due Date:</span>
                              <span className="ml-2 font-medium">{deliverable.dueDate}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Assigned To:</span>
                              <span className="ml-2 font-medium">{deliverable.assignedTo}</span>
                            </div>
                          </div>
                          
                          {deliverable.files && deliverable.files.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm text-gray-600">Files:</span>
                              <div className="flex gap-2 mt-1">
                                {deliverable.files.map((file, index) => (
                                  <Button key={index} variant="outline" size="sm" className="text-xs">
                                    <Download className="h-3 w-3 mr-1" />
                                    {file}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDeliverable(deliverable)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4">
                <CollaborationTimelineTab
                  mockMilestones={mockMilestones}
                  handleViewContract={handleViewContract}
                  contractUrl={contractUrl}
                  collaboration={collaboration}
                  getMilestoneStatusColor={getMilestoneStatusColor}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <CollaboratorSidebar collaboration={collaboration} />
            <CollaborationQuickActions handleViewContract={handleViewContract} />
            <CollaborationProjectStats collaboration={collaboration} />
          </div>
        </div>
      </main>

      {/* Deliverable View Modal */}
      {showDeliverableModal && selectedDeliverable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Deliverable Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDeliverableModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Deliverable Details */}
                  <Card>
                    <CardHeader>
                      <div className="mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Deliverable Details</span>
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                        {selectedDeliverable.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{selectedDeliverable.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Status & Progress</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getDeliverableStatusColor(selectedDeliverable.status)}>
                                {selectedDeliverable.status.replace('-', ' ')}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {selectedDeliverable.status === 'completed' ? '100%' : 
                                 selectedDeliverable.status === 'in-progress' ? '65%' : '0%'} complete
                              </span>
                            </div>
                            {selectedDeliverable.status === 'in-progress' && (
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-2 bg-blue-500 rounded-full" style={{ width: "65%" }} />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Due Date:</span>
                              <span className="font-medium">{selectedDeliverable.dueDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Assigned To:</span>
                              <span className="font-medium">{selectedDeliverable.assignedTo}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Created:</span>
                              <span className="font-medium">{collaboration.startDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Files & Attachments */}
                  {selectedDeliverable.files && selectedDeliverable.files.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Download className="h-5 w-5" />
                          Files & Attachments
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedDeliverable.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{file}</p>
                                  <p className="text-sm text-gray-600">Uploaded 2 days ago</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Comments & Feedback */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Comments & Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={collaboration.collaborator.avatar} alt={collaboration.collaborator.name} />
                              <AvatarFallback className="text-xs">{collaboration.collaborator.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{collaboration.collaborator.name}</span>
                            <span className="text-xs text-gray-500">2 days ago</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            "The first draft is ready for review. I've included the main product features 
                            and added some B-roll footage. Let me know if you'd like any adjustments to the pacing."
                          </p>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-blue-100">You</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">You</span>
                            <span className="text-xs text-gray-500">1 day ago</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            "Great work! The pacing looks good. Could you add a few more close-up shots 
                            of the product features around the 1:30 mark?"
                          </p>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Textarea
                            placeholder="Add a comment or feedback..."
                            className="flex-1"
                            rows={2}
                          />
                          <Button size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Deliverable
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download All Files
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                      {selectedDeliverable.status !== 'completed' && (
                        <Button className="w-full justify-start" size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Deliverable Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Deliverable Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedDeliverable.status === 'completed' ? '100%' : 
                             selectedDeliverable.status === 'in-progress' ? '65%' : '0%'}
                          </div>
                          <div className="text-xs text-gray-600">Progress</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {selectedDeliverable.files?.length || 0}
                          </div>
                          <div className="text-xs text-gray-600">Files</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Days Remaining:</span>
                          <span className="font-medium">3 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Comments:</span>
                          <span className="font-medium">2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium">1 day ago</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Version History */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Version History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">v1.2 - Final Draft</p>
                            <p className="text-xs text-gray-600">Updated 1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">v1.1 - First Review</p>
                            <p className="text-xs text-gray-600">Updated 2 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">v1.0 - Initial Draft</p>
                            <p className="text-xs text-gray-600">Created 3 days ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Modal */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Collaboration Contract - {collaboration.collabTitle}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContractModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={contractUrl}
                className="w-full h-full border border-gray-200 rounded"
                title="Collaboration Contract"
              />
            </div>
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Contract uploaded on {collaboration.startDate}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Sign Contract
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}