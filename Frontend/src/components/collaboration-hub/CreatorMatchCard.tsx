import React, { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import ViewProfileModal from "./ViewProfileModal";
import ConnectModal from "./ConnectModal";

export interface CreatorMatchCardProps {
  name: string;
  avatar: string;
  contentType: string;
  matchPercentage: number;
  audienceMatch: string;
  followers: string;
  engagement: string;
  content: string;
  collabs: number;
  whyMatch: string[];
}

const getAudienceMatchColor = (level: string) => {
  switch (level) {
    case "Very High":
      return "bg-green-500";
    case "High":
      return "bg-yellow-400";
    case "Good":
      return "bg-blue-400";
    default:
      return "bg-gray-300";
  }
};

// New subcomponents for readability and maintainability
const CreatorStats: React.FC<{followers: string, engagement: string, content: string, collabs: number}> = ({ followers, engagement, content, collabs }) => (
  <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 w-full mb-2">
    <div><span className="font-semibold">Followers</span><br />{followers}</div>
    <div><span className="font-semibold">Engagement</span><br />{engagement}</div>
    <div><span className="font-semibold">Content</span><br />{content}</div>
    <div><span className="font-semibold">Collabs</span><br />{collabs} completed</div>
  </div>
);

const AudienceMatchBar: React.FC<{audienceMatch: string}> = ({ audienceMatch }) => (
  <div className="flex items-center gap-2 w-full justify-center mb-2">
    <span className="text-xs text-gray-500">Audience Match</span>
    <span className="font-semibold text-xs text-gray-700">{audienceMatch}</span>
    <div className="flex-1 h-2 rounded bg-gray-200 mx-2 min-w-[60px] max-w-[80px]" role="progressbar" aria-valuenow={audienceMatch === 'Very High' ? 100 : audienceMatch === 'High' ? 75 : audienceMatch === 'Good' ? 50 : 0} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-2 rounded ${getAudienceMatchColor(audienceMatch)}`} style={{ width: audienceMatch === "Very High" ? "100%" : audienceMatch === "High" ? "75%" : "50%" }} />
    </div>
  </div>
);

const MatchReasons: React.FC<{whyMatch: string[]}> = ({ whyMatch }) => (
  <div className="w-full mb-4">
    <div className="font-semibold text-sm mb-1">Why you match</div>
    <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
      {whyMatch.map((reason, idx) => (
        <li key={idx}>{reason}</li>
      ))}
    </ul>
  </div>
);

export const CreatorMatchCard: React.FC<CreatorMatchCardProps> = ({
  name,
  avatar,
  contentType,
  matchPercentage,
  audienceMatch,
  followers,
  engagement,
  content,
  collabs,
  whyMatch,
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleSendRequest = () => {
    setShowConnect(false);
    setRequestSent(true);
    setTimeout(() => setRequestSent(false), 2000);
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl shadow-md p-6 px-4 flex flex-col items-center w-full max-w-xs border border-gray-100 relative min-h-[440px]"
        aria-label={`Creator card for ${name || 'unknown creator'}`}
      >
        <Badge className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 z-10">
          {matchPercentage}% Match
        </Badge>
        <div className="flex flex-col items-center gap-2 mt-8 mb-2">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-gray-200">{typeof name === 'string' && name.length > 0 ? name.slice(0,2).toUpperCase() : '--'}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-bold text-gray-900 text-center">{name}</h3>
          <div className="text-gray-500 text-sm text-center">{contentType}</div>
        </div>
        <AudienceMatchBar audienceMatch={audienceMatch} />
        <CreatorStats followers={followers} engagement={engagement} content={content} collabs={collabs} />
        <MatchReasons whyMatch={whyMatch} />
        <div className="flex gap-2 w-full mt-auto justify-center pt-2 pb-2">
          <Button className="bg-gray-100 text-gray-900 hover:bg-gray-200 flex-1 font-semibold rounded-full py-2" variant="secondary" onClick={() => setShowProfile(true)}>View Profile</Button>
          <Button className="bg-yellow-400 text-white hover:bg-yellow-500 flex-1 font-semibold rounded-full py-2" onClick={() => setShowConnect(true)}>Connect</Button>
        </div>
        {requestSent && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm shadow w-max" aria-live="polite">Request Sent!</div>
        )}
      </div>
      <ViewProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        onConnect={() => {
          setShowProfile(false);
          setTimeout(() => setShowConnect(true), 200);
        }}
      />
      <ConnectModal
        open={showConnect}
        onClose={() => setShowConnect(false)}
        onSend={handleSendRequest}
      />
    </>
  );
};

export default CreatorMatchCard; 