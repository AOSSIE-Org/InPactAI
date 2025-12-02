import { Instagram, Youtube, Facebook } from 'lucide-react';
import AvailabilityBadge from './AvailabilityBadge';

interface CreatorCardProps {
  creator: {
    id: string;
    username: string;
    profile_image: string | null;
    category: string;
    country: string;
    availability_status: 'available' | 'busy' | 'not_looking';
    availability_message?: string | null;
    social_profiles?: Array<{
      platform: string;
      followers?: number;
      subscriber_count?: number;
    }>;
  };
  onViewProfile?: (id: string) => void;
}

export default function CreatorCard({ creator, onViewProfile }: CreatorCardProps) {
  const totalFollowers = creator.social_profiles?.reduce((sum, profile) => {
    return sum + (profile.followers || profile.subscriber_count || 0);
  }, 0) || 0;

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Header with Profile Image */}
      <div className="relative h-32 bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="absolute -bottom-12 left-6">
          <img
            src={creator.profile_image || '/default-avatar.png'}
            alt={creator.username}
            className="h-24 w-24 rounded-full border-4 border-white object-cover"
          />
        </div>
        {/* Availability Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <AvailabilityBadge 
            status={creator.availability_status} 
            message={creator.availability_message}
            size="sm"
            showMessage={false}
          />
        </div>
      </div>

      {/* Content */}
      <div className="pt-14 px-6 pb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{creator.username}</h3>
            <p className="text-sm text-gray-600">
              {creator.category} • {creator.country}
            </p>
          </div>
        </div>

        {/* Availability Message */}
        {creator.availability_message && (
          <div className="mb-3 text-xs text-gray-600 italic bg-gray-50 p-2 rounded">
            "{creator.availability_message}"
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div>
            <div className="text-xl font-bold text-gray-900">
              {totalFollowers.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Total Followers</div>
          </div>
          <div className="flex gap-2">
            {creator.social_profiles?.map((profile, idx) => (
              <div
                key={idx}
                className="p-1.5 bg-gray-100 rounded-full text-gray-600"
                title={profile.platform}
              >
                {getPlatformIcon(profile.platform)}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onViewProfile?.(creator.id)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            creator.availability_status === 'available'
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : creator.availability_status === 'busy'
              ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}
        >
          {creator.availability_status === 'available'
            ? 'Contact Creator'
            : creator.availability_status === 'busy'
            ? 'View Profile'
            : 'View Profile Only'}
        </button>
      </div>
    </div>
  );
}
