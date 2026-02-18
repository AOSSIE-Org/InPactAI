import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { MessageSquare, CheckCircle, XCircle, Lightbulb, TrendingUp, Users, Star, Mail } from "lucide-react";

// Mock data for incoming requests
const mockRequests = [
  {
    id: "1", // Updated to string for UUID compatibility
    sender: {
      name: "TechSavvy",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      contentNiche: "Tech Reviews",
      audienceSize: "250K",
      followers: 250000,
      engagement: "4.2%",
      rating: 4.7,
    },
    summary: "Collaboration for a new smartphone launch campaign.",
    proposal: {
      contentLength: "5-7 min video",
      paymentSchedule: "50% upfront, 50% after delivery",
      numberOfPosts: "2 Instagram posts, 1 YouTube video",
      timeline: "Within 3 weeks of product launch",
      notes: "Open to creative input and additional deliverables."
    },
    stats: {
      posts: 120,
      completionRate: "98%",
      avgViews: "80K"
    },
    ai: {
      advantages: [
        "Access to a highly engaged tech audience.",
        "Boosts brand credibility through trusted reviews.",
        "Potential for long-term partnership."
      ],
      ideas: [
        "Unboxing and first impressions video.",
        "Live Q&A session with audience.",
        "Social media giveaway collaboration."
      ],
      recommendations: [
        "Highlight unique features in the first 60 seconds.",
        "Leverage Instagram Stories for behind-the-scenes content.",
        "Schedule a follow-up review after 1 month."
      ]
    }
  },
  {
    id: "2", // Updated to string for UUID compatibility
    sender: {
      name: "EcoChic",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      contentNiche: "Sustainable Fashion",
      audienceSize: "180K",
      followers: 180000,
      engagement: "5.1%",
      rating: 4.9,
    },
    summary: "Proposal for a sustainable clothing line promotion.",
    proposal: {
      contentLength: "3-5 min Instagram Reel",
      paymentSchedule: "Full payment after campaign",
      numberOfPosts: "1 Reel, 2 Stories",
      timeline: "Next month",
      notes: "Would love to brainstorm eco-friendly angles together."
    },
    stats: {
      posts: 95,
      completionRate: "96%",
      avgViews: "60K"
    },
    ai: {
      advantages: [
        "Tap into eco-conscious audience.",
        "Enhance brand's sustainability image.",
        "Opportunity for co-branded content."
      ],
      ideas: [
        "Instagram Reels styling challenge.",
        "Joint blog post on sustainable fashion tips.",
        "Giveaway of eco-friendly products."
      ],
      recommendations: [
        "Feature behind-the-scenes of production.",
        "Encourage user-generated content with a hashtag.",
        "Host a live styling session."
      ]
    }
  }
];

const CollabRequests: React.FC = () => {
  const [requests, setRequests] = useState(mockRequests);

  // Use environment variable for the API base URL
  const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

  const handleAccept = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/collaboration/update-status/${id}?status=accepted`, {
        method: 'PUT',
      });
      if (response.ok) {
        setRequests(prev => prev.filter(req => req.id !== id));
      } else {
        // Feedback for non-OK responses
        const err = await response.json().catch(() => ({}));
        alert(`Failed to accept: ${err.detail || "Server error"}`);
      }
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const handleDeny = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/collaboration/update-status/${id}?status=denied`, {
        method: 'PUT',
      });
      if (response.ok) {
        setRequests(prev => prev.filter(req => req.id !== id));
      } else {
        // Feedback for non-OK responses
        alert("Failed to deny request. Please try again.");
      }
    } catch (error) {
      console.error("Failed to deny request:", error);
    }
  };

  const handleMessage = (id: string) => {
    // TODO: Open message modal or redirect to chat
    alert("Open chat with sender (not implemented)");
  };

  return (
    <div className="space-y-6">
      {requests.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No collaboration requests at this time.</div>
      ) : (
        requests.map((req) => (
          <Card key={req.id} className="shadow-sm border border-gray-200">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={req.sender.avatar} alt={req.sender.name} />
                  <AvatarFallback>{req.sender.name.slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-bold">{req.sender.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">{req.sender.contentNiche} &bull; {req.sender.audienceSize} audience</CardDescription>
                  <div className="flex gap-2 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {req.sender.followers.toLocaleString()} followers</span>
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {req.sender.engagement} engagement</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {req.sender.rating}/5</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <span className="font-medium text-gray-800">Request:</span> {req.summary}
              </div>
              {/* Initial Collaboration Proposal Section */}
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1 text-purple-700 font-semibold text-sm">
                  <span role="img" aria-label="proposal">📝</span> Initial Collaboration Proposal
                </div>
                <ul className="text-xs text-purple-900 ml-2">
                  <li><b>Content Length:</b> {req.proposal.contentLength}</li>
                  <li><b>Payment Schedule:</b> {req.proposal.paymentSchedule}</li>
                  <li><b>Number of Posts:</b> {req.proposal.numberOfPosts}</li>
                  <li><b>Timeline:</b> {req.proposal.timeline}</li>
                  <li><b>Notes:</b> {req.proposal.notes}</li>
                </ul>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* AI Advantages */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1 text-blue-700 font-semibold text-sm"><Lightbulb className="h-4 w-4" /> Advantages</div>
                  <ul className="list-disc ml-5 text-xs text-blue-900">
                    {req.ai.advantages.map((adv, i) => <li key={i}>{adv}</li>)}
                  </ul>
                </div>
                {/* AI Ideas */}
                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1 text-green-700 font-semibold text-sm"><Lightbulb className="h-4 w-4" /> Collaboration Ideas</div>
                  <ul className="list-disc ml-5 text-xs text-green-900">
                    {req.ai.ideas.map((idea, i) => <li key={i}>{idea}</li>)}
                  </ul>
                </div>
                {/* AI Recommendations */}
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1 text-yellow-700 font-semibold text-sm"><Lightbulb className="h-4 w-4" /> Recommendations</div>
                  <ul className="list-disc ml-5 text-xs text-yellow-900">
                    {req.ai.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex flex-wrap gap-2 mb-2 text-xs text-gray-600">
                <span>Posts: <b>{req.stats.posts}</b></span>
                <span>Completion Rate: <b>{req.stats.completionRate}</b></span>
                <span>Avg Views: <b>{req.stats.avgViews}</b></span>
              </div>
              <div className="flex gap-3 mt-4">
                <Button size="sm" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200 border border-green-200" onClick={() => handleAccept(req.id)} aria-label="Accept collaboration request">
                  <CheckCircle className="h-4 w-4" /> Accept
                </Button>
                <Button size="sm" className="flex items-center gap-1 bg-red-100 text-red-800 hover:bg-red-200 border border-red-200" onClick={() => handleDeny(req.id)} aria-label="Deny collaboration request">
                  <XCircle className="h-4 w-4" /> Deny
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => handleMessage(req.id)} aria-label="Message sender">
                  <MessageSquare className="h-4 w-4" /> Message
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1" aria-label="Email sender">
                  <Mail className="h-4 w-4" /> Email
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default CollabRequests;