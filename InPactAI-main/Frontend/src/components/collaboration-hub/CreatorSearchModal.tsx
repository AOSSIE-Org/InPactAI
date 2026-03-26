import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent } from "../ui/card";
import ViewProfileModal from "./ViewProfileModal";
import { mockProfileDetails } from "./mockProfileData";

interface CreatorSearchModalProps {
  open: boolean;
  onClose: () => void;
  onConnect?: (creator: any) => void;
}

export default function CreatorSearchModal({ open, onClose, onConnect }: CreatorSearchModalProps) {
  const [aiSearchDesc, setAiSearchDesc] = useState("");
  const [aiSearchResults, setAiSearchResults] = useState<any[]>([]);
  const [aiSearchSubmitted, setAiSearchSubmitted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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
    onClose();
  };

  const handleConnect = (creator: any) => {
    if (onConnect) {
      onConnect(creator);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleResetAiSearch(); }}>
        <DialogContent className="max-w-xl w-full">
          <DialogHeader>
            <DialogTitle>Find Creators with AI</DialogTitle>
          </DialogHeader>
          
          <div className="mb-2 font-semibold">Describe your project or collaboration needs</div>
          <Textarea 
            placeholder="Describe your ideal project, campaign, or collaboration..." 
            value={aiSearchDesc} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAiSearchDesc(e.target.value)} 
            rows={3} 
          />
          
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={handleResetAiSearch}>Cancel</Button>
            <Button 
              className="bg-blue-600 text-white" 
              onClick={handleAiSearch} 
              disabled={!aiSearchDesc}
            >
              Find Creators
            </Button>
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowProfile(true)}
                      >
                        View Profile
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-purple-600 text-white"
                        onClick={() => handleConnect(creator)}
                      >
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ViewProfileModal 
        open={showProfile} 
        onClose={() => setShowProfile(false)} 
        onConnect={() => { 
          setShowProfile(false); 
          if (aiSearchResults.length > 0) {
            handleConnect(aiSearchResults[0]);
          }
        }} 
      />
    </>
  );
} 