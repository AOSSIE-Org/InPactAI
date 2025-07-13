import React, { useState } from "react";
import { mockProfileDetails, mockCollabIdeas, mockRequestTexts, mockWhyMatch } from "./mockProfileData";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

interface WhyMatchReason {
  point: string;
  description: string;
}

interface ConnectModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (selectedText: string) => void;
  matchPercentage?: number;
  whyMatch?: WhyMatchReason[];
}

const defaultMatch = 98;
const IDEAS_PER_PAGE = 3;

const ConnectModal: React.FC<ConnectModalProps> = ({ open, onClose, onSend, matchPercentage = defaultMatch, whyMatch = mockWhyMatch }) => {
  const [ideasPage, setIdeasPage] = useState(0);
  const [selectedText, setSelectedText] = useState(mockRequestTexts[0]);
  if (!open) return null;
  const profile = mockProfileDetails;
  const totalIdeas = mockCollabIdeas.length;
  const startIdx = (ideasPage * IDEAS_PER_PAGE) % totalIdeas;
  const ideasToShow = Array.from({ length: IDEAS_PER_PAGE }, (_, i) => mockCollabIdeas[(startIdx + i) % totalIdeas]);

  const handleNextIdeas = () => {
    setIdeasPage((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div
        className="bg-white rounded-2xl shadow-xl w-auto min-w-[320px] max-w-full mx-2 p-0 sm:p-0 relative flex flex-col sm:flex-row overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-modal-title"
      >
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-10" onClick={onClose} aria-label="Close">
          ×
        </button>
        {/* Left: Profile Info */}
        <div className="flex flex-col items-center sm:items-start bg-gray-50 sm:bg-white p-6 sm:p-8 w-full sm:w-auto border-b sm:border-b-0 sm:border-r border-gray-100">
          <Badge className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 mb-2">
            {matchPercentage}% Match
          </Badge>
          <Avatar className="h-16 w-16 mb-2">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="bg-gray-200">{profile.name.slice(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h2 id="connect-modal-title" className="text-xl font-bold text-gray-900 text-center sm:text-left">Connect with {profile.name}</h2>
          <div className="text-gray-500 text-sm text-center sm:text-left mb-2">{profile.contentType}</div>
          <div className="mb-3 bg-gray-50 border border-gray-100 rounded-lg p-3 w-full">
            <div className="font-semibold text-sm mb-1">Why you match</div>
            <ul className="space-y-3">
              {whyMatch.map((reason, idx) => (
                <li key={idx}>
                  <div className="font-semibold text-xs text-gray-800 mb-1">{reason.point}</div>
                  <div className="text-xs text-gray-600 pl-2">{reason.description}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Right: Ideas and Messages */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 w-full sm:w-auto">
          <div className="mb-4">
            <div className="font-semibold text-sm mb-2">AI-Generated Collaboration Ideas</div>
            <ul className="space-y-2">
              {ideasToShow.map((idea, idx) => (
                <li key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="font-semibold text-gray-800">{idea.title}</div>
                  <div className="text-xs text-gray-600">{idea.description}</div>
                </li>
              ))}
            </ul>
            {totalIdeas > IDEAS_PER_PAGE && (
              <div className="flex justify-center mt-3">
                <Button className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-semibold rounded-full px-6 py-2 text-sm" onClick={handleNextIdeas}>
                  See More Ideas
                </Button>
              </div>
            )}
          </div>
          <div className="mb-4">
            <div className="font-semibold text-sm mb-2">Select a message to send</div>
            <fieldset className="space-y-2 border-0 p-0 m-0">
              <legend className="sr-only">Select a message to send</legend>
              {mockRequestTexts.map((text, idx) => {
                const radioId = `requestText-${idx}`;
                return (
                  <div key={radioId} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      id={radioId}
                      name="requestText"
                      value={text}
                      checked={selectedText === text}
                      onChange={() => setSelectedText(text)}
                      className="mt-1 accent-yellow-400"
                    />
                    <label htmlFor={radioId} className={`text-sm px-4 py-2 rounded-2xl inline-block ${selectedText === text ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' : 'bg-gray-100 text-gray-700'}`}>
                      {text}
                    </label>
                  </div>
                );
              })}
            </fieldset>
          </div>
          <div className="flex gap-2 w-full mt-auto justify-center pt-2 pb-2">
            <Button className="bg-gray-100 text-gray-900 hover:bg-gray-200 flex-1 font-semibold rounded-full py-2" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button className="bg-yellow-400 text-white hover:bg-yellow-500 flex-1 font-semibold rounded-full py-2" onClick={() => onSend(selectedText)}>Send Request</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectModal; 