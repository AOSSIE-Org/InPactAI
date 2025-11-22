import React from "react";
import { mockProfileDetails, mockWhyMatch } from "./mockProfileData";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

interface WhyMatchReason {
  point: string;
  description: string;
}

const defaultMatch = 98;

interface ViewProfileModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: () => void;
  matchPercentage?: number;
  whyMatch?: WhyMatchReason[];
}

const ViewProfileModal: React.FC<ViewProfileModalProps> = ({ open, onClose, onConnect, matchPercentage = defaultMatch, whyMatch = mockWhyMatch }) => {
  if (!open) return null;
  const profile = mockProfileDetails;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative flex flex-col">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="flex flex-col items-center mb-4">
          <Badge className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 mb-2">
            {matchPercentage}% Match
          </Badge>
          <Avatar className="h-20 w-20 mb-2">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="bg-gray-200">{profile.name.slice(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-gray-900 text-center">{profile.name}</h2>
          <div className="text-gray-500 text-sm text-center">{profile.contentType} • {profile.location}</div>
        </div>
        <div className="text-gray-700 text-center mb-4">{profile.bio}</div>
        <div className="flex justify-center gap-4 mb-4">
          {profile.socialLinks.map((link, idx) => (
            <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900" title={link.platform}>
              {/* icon rendering handled in parent */}
              {link.icon === "instagram" && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              )}
              {link.icon === "youtube" && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.8 8.001a2.752 2.752 0 0 0-1.938-1.948C18.003 6 12 6 12 6s-6.003 0-7.862.053A2.752 2.752 0 0 0 2.2 8.001 28.934 28.934 0 0 0 2 12a28.934 28.934 0 0 0 .2 3.999 2.752 2.752 0 0 0 1.938 1.948C5.997 18 12 18 12 18s6.003 0 7.862-.053a2.752 2.752 0 0 0 1.938-1.948A28.934 28.934 0 0 0 22 12a28.934 28.934 0 0 0-.2-3.999zM10 15V9l5 3-5 3z"/></svg>
              )}
              {link.icon === "twitter" && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4.36a9.09 9.09 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.67 1.64.9c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.95 3.65A4.48 4.48 0 0 1 .96 6v.06c0 2.13 1.52 3.91 3.54 4.31-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.55 1.7 2.16 2.94 4.07 2.97A9.06 9.06 0 0 1 0 20.29a12.8 12.8 0 0 0 6.95 2.04c8.34 0 12.9-6.91 12.9-12.9 0-.2 0-.39-.01-.58A9.22 9.22 0 0 0 23 3z"/></svg>
              )}
            </a>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-700 mb-4">
          <div><span className="font-semibold">Followers</span><br />{profile.followers}</div>
          <div><span className="font-semibold">Engagement</span><br />{profile.engagement}</div>
          <div><span className="font-semibold">Content</span><br />{profile.content}</div>
          <div><span className="font-semibold">Collabs</span><br />{profile.collabs} completed</div>
        </div>
        <div className="mb-4 bg-gray-50 border border-gray-100 rounded-lg p-3">
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
        <Button className="bg-yellow-400 text-white hover:bg-yellow-500 font-semibold rounded-full py-2 mt-2" onClick={onConnect}>
          Connect
        </Button>
      </div>
    </div>
  );
};

export default ViewProfileModal; 