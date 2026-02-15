import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import ViewProfileModal from "./ViewProfileModal";
import { mockProfileDetails } from "./mockProfileData";

interface NewCollaborationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

interface ProposalData {
  contentLength: string;
  paymentSchedule: string;
  numberOfPosts: string;
  timeline: string;
  notes: string;
}

export default function NewCollaborationModal({
  open,
  onClose,
  onSubmit,
}: NewCollaborationModalProps) {
  const [modalStep, setModalStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [collabDesc, setCollabDesc] = useState("");
  const [aiDesc, setAiDesc] = useState("");
  const [proposal, setProposal] = useState<ProposalData>({
    contentLength: "",
    paymentSchedule: "",
    numberOfPosts: "",
    timeline: "",
    notes: "",
  });
  const [aiProposal, setAiProposal] = useState<ProposalData | null>(null);
  const [reviewed, setReviewed] = useState(false);

  // Mock creator search (returns mockProfileDetails for any search)
  const searchResults = searchTerm ? [mockProfileDetails] : [];

  // Mock AI suggestions
  const handleAiDesc = () => {
    setAiDesc(
      "AI Suggestion: Collaborate on a tech review series with cross-promotion and audience Q&A."
    );
  };

  const handleAiProposal = () => {
    setAiProposal({
      contentLength: "5-7 min video",
      paymentSchedule: "50% upfront, 50% after delivery",
      numberOfPosts: "2 Instagram posts, 1 YouTube video",
      timeline: "Within 3 weeks of product launch",
      notes: "Open to creative input and additional deliverables.",
    });
  };

  const handleResetModal = () => {
    setModalStep(1);
    setSearchTerm("");
    setSelectedCreator(null);
    setShowProfile(false);
    setCollabDesc("");
    setAiDesc("");
    setProposal({
      contentLength: "",
      paymentSchedule: "",
      numberOfPosts: "",
      timeline: "",
      notes: "",
    });
    setAiProposal(null);
    setReviewed(false);
    onClose();
  };

  const handleSubmit = () => {
    setReviewed(true);
    setTimeout(() => {
      if (onSubmit) {
        onSubmit({
          creator: selectedCreator,
          description: collabDesc || aiDesc,
          proposal,
          reviewed: true,
        });
      }
      handleResetModal();
    }, 1500);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) handleResetModal();
        }}
      >
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>New Collaboration Request</DialogTitle>
          </DialogHeader>

          {/* Stepper */}
          <div className="flex justify-between mb-4 text-xs">
            <div
              className={`font-bold ${
                modalStep === 1 ? "text-purple-700" : "text-gray-400"
              }`}
            >
              1. Search Creator
            </div>
            <div
              className={`font-bold ${
                modalStep === 2 ? "text-purple-700" : "text-gray-400"
              }`}
            >
              2. Describe Collab
            </div>
            <div
              className={`font-bold ${
                modalStep === 3 ? "text-purple-700" : "text-gray-400"
              }`}
            >
              3. Proposal Details
            </div>
            <div
              className={`font-bold ${
                modalStep === 4 ? "text-purple-700" : "text-gray-400"
              }`}
            >
              4. Review & Send
            </div>
          </div>

          {/* Step 1: Search Creator */}
          {modalStep === 1 && (
            <div>
              <Input
                placeholder="Search creators by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              {searchResults.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {searchResults.map((creator, idx) => (
                    <Card
                      key={idx}
                      className={`border-2 ${
                        selectedCreator?.id === creator.id
                          ? "border-purple-500"
                          : "border-gray-200"
                      }`}
                    >
                      <CardContent className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="font-bold text-lg">
                            {creator.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {creator.contentType} • {creator.location}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onClose(); 
                            setSelectedCreator(creator);
                            setShowProfile(true);
                          }}
                        >
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          className="bg-purple-600 text-white"
                          onClick={() => setSelectedCreator(creator)}
                        >
                          Select
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  Type a name to search for creators.
                </div>
              )}
              <div className="flex justify-end mt-6 gap-2">
                <Button variant="outline" onClick={handleResetModal}>
                  Cancel
                </Button>
                <Button
                  disabled={!selectedCreator}
                  className="bg-purple-600 text-white"
                  onClick={() => setModalStep(2)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Describe Collab */}
          {modalStep === 2 && (
            <div>
              <div className="mb-2 font-semibold">
                Describe the collaboration you're looking for
              </div>
              <Textarea
                placeholder="Describe your ideal collaboration..."
                value={collabDesc}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCollabDesc(e.target.value)
                }
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={handleAiDesc}>
                  AI Suggest
                </Button>
                {aiDesc && (
                  <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded text-xs flex-1">
                    {aiDesc}
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-6 gap-2">
                <Button variant="outline" onClick={handleResetModal}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={() => setModalStep(1)}>
                  Back
                </Button>
                <Button
                  className="bg-purple-600 text-white"
                  onClick={() => setModalStep(3)}
                  disabled={!collabDesc && !aiDesc}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Proposal Details */}
          {modalStep === 3 && (
            <div>
              <div className="mb-2 font-semibold">Proposal Details</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Content Length (e.g. 5-7 min video)"
                  value={proposal.contentLength}
                  onChange={(e) =>
                    setProposal({ ...proposal, contentLength: e.target.value })
                  }
                />
                <Input
                  placeholder="Payment Schedule (e.g. 50% upfront)"
                  value={proposal.paymentSchedule}
                  onChange={(e) =>
                    setProposal({
                      ...proposal,
                      paymentSchedule: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Number of Posts (e.g. 2 IG posts)"
                  value={proposal.numberOfPosts}
                  onChange={(e) =>
                    setProposal({ ...proposal, numberOfPosts: e.target.value })
                  }
                />
                <Input
                  placeholder="Timeline (e.g. 3 weeks)"
                  value={proposal.timeline}
                  onChange={(e) =>
                    setProposal({ ...proposal, timeline: e.target.value })
                  }
                />
              </div>
              <Textarea
                placeholder="Additional Notes"
                value={proposal.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setProposal({ ...proposal, notes: e.target.value })
                }
                className="mt-2"
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={handleAiProposal}>
                  AI Draft Proposal
                </Button>
                {aiProposal && (
                  <div className="bg-green-50 text-green-800 px-3 py-2 rounded text-xs flex-1">
                    <div>
                      <b>AI Proposal:</b>
                    </div>
                    <div>Content Length: {aiProposal.contentLength}</div>
                    <div>Payment: {aiProposal.paymentSchedule}</div>
                    <div>Posts: {aiProposal.numberOfPosts}</div>
                    <div>Timeline: {aiProposal.timeline}</div>
                    <div>Notes: {aiProposal.notes}</div>
                    <Button
                      size="sm"
                      className="mt-1 bg-green-200 text-green-900"
                      onClick={() => setProposal(aiProposal)}
                    >
                      Use This
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-6 gap-2">
                <Button variant="outline" onClick={handleResetModal}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={() => setModalStep(2)}>
                  Back
                </Button>
                <Button
                  className="bg-purple-600 text-white"
                  onClick={() => setModalStep(4)}
                  disabled={
                    !proposal.contentLength ||
                    !proposal.paymentSchedule ||
                    !proposal.numberOfPosts ||
                    !proposal.timeline
                  }
                >
                  Next
                </Button>
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
                  <div className="mb-2">
                    <b>Description:</b> {collabDesc || aiDesc}
                  </div>
                  <div className="mb-2">
                    <b>Content Length:</b> {proposal.contentLength}
                  </div>
                  <div className="mb-2">
                    <b>Payment Schedule:</b> {proposal.paymentSchedule}
                  </div>
                  <div className="mb-2">
                    <b>Number of Posts:</b> {proposal.numberOfPosts}
                  </div>
                  <div className="mb-2">
                    <b>Timeline:</b> {proposal.timeline}
                  </div>
                  <div className="mb-2">
                    <b>Notes:</b> {proposal.notes}
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between mt-6 gap-2">
                <Button variant="outline" onClick={handleResetModal}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={() => setModalStep(3)}>
                  Back
                </Button>
                <Button
                  className="bg-green-600 text-white"
                  onClick={handleSubmit}
                >
                  Send Request
                </Button>
              </div>
              {reviewed && (
                <div className="text-green-700 text-center mt-4 font-semibold">
                  Request Sent!
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ViewProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        onConnect={() => {
          setShowProfile(false);
          setSelectedCreator(searchResults[0]);
        }}
      />
    </>
  );
}
