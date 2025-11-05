import React from "react";
import { mockProfileDetails, mockWhyMatch } from "./mockProfileData";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";

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

const ViewProfileModal: React.FC<ViewProfileModalProps> = ({
  open,
  onClose,
  onConnect,
  matchPercentage = defaultMatch,
  whyMatch = mockWhyMatch,
}) => {
  if (!open) return null;
  const profile = mockProfileDetails;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      {/* Modal container */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] p-10 mx-4 animate-in fade-in-0 zoom-in-95 border border-gray-100 dark:border-gray-700">
        
        {/* Close button */}
       <button
  onClick={onClose}
  aria-label="Close"
  className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all"
>
  <X className="h-6 w-6" />
</button>


        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <Badge className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 mb-3">
            {matchPercentage}% Match
          </Badge>
          <Avatar className="h-24 w-24 mb-3 shadow-md ring-2 ring-yellow-400">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="bg-gray-200">
              {profile.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {profile.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {profile.contentType} • {profile.location}
          </p>
        </div>

        {/* Bio */}
        <p className="text-gray-700 dark:text-gray-300 text-center mb-6 leading-relaxed">
          {profile.bio}
        </p>

        {/* Social Links */}
        <div className="flex justify-center gap-5 mb-8">
          {profile.socialLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.platform}
              className="text-gray-500 hover:text-yellow-500 transition-transform hover:scale-110"
            >
              {link.icon === "instagram" && (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              )}
              {link.icon === "youtube" && (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.8 8.001a2.752 2.752 0 0 0-1.938-1.948C18.003 6 12 6 12 6s-6.003 0-7.862.053A2.752 2.752 0 0 0 2.2 8.001 28.934 28.934 0 0 0 2 12a28.934 28.934 0 0 0 .2 3.999 2.752 2.752 0 0 0 1.938 1.948C5.997 18 12 18 12 18s6.003 0 7.862-.053a2.752 2.752 0 0 0 1.938-1.948A28.934 28.934 0 0 0 22 12a28.934 28.934 0 0 0-.2-3.999zM10 15V9l5 3-5 3z" />
                </svg>
              )}
              {link.icon === "twitter" && (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4.36a9.09 9.09 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.67 1.64.9c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.95 3.65A4.48 4.48 0 0 1 .96 6v.06c0 2.13 1.52 3.91 3.54 4.31-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.55 1.7 2.16 2.94 4.07 2.97A9.06 9.06 0 0 1 0 20.29a12.8 12.8 0 0 0 6.95 2.04c8.34 0 12.9-6.91 12.9-12.9 0-.2 0-.39-.01-.58A9.22 9.22 0 0 0 23 3z" />
                </svg>
              )}
            </a>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-800 dark:text-gray-300 mb-6">
          <div className="text-center">
            <div className="font-bold text-lg">{profile.followers}</div>
            <div className="text-gray-500 text-xs">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{profile.engagement}</div>
            <div className="text-gray-500 text-xs">Engagement</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{profile.content}</div>
            <div className="text-gray-500 text-xs">Content</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{profile.collabs}</div>
            <div className="text-gray-500 text-xs">Collabs</div>
          </div>
        </div>

        {/* Why Match Section */}
        <div className="mb-8 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-3">
            Why You Match
          </h3>
          <ul className="space-y-4">
            {whyMatch.map((reason, idx) => (
              <li key={idx}>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {reason.point}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 pl-2 leading-snug">
                  {reason.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect Button */}
        <div className="flex justify-center">
          <Button
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-full py-2 px-8 shadow-md transition-all"
            onClick={onConnect}
          >
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewProfileModal;
