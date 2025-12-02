import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import CreatorCard from '../../components/CreatorCard';
import { Search, Filter } from 'lucide-react';

interface Creator {
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
}

export default function BrandCreatorSearch() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'busy'>('all');

  useEffect(() => {
    const loadCreators = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('users')
          .select(`
            id,
            username,
            profile_image,
            category,
            country,
            availability_status,
            availability_message,
            social_profiles (
              platform,
              followers,
              subscriber_count
            )
          `)
          .eq('role', 'creator');

        // Apply availability filter
        if (availabilityFilter === 'available') {
          query = query.eq('availability_status', 'available');
        } else if (availabilityFilter === 'busy') {
          query = query.eq('availability_status', 'busy');
        } else {
          // For 'all', exclude 'not_looking'
          query = query.neq('availability_status', 'not_looking');
        }

        const { data, error } = await query;

        if (error) throw error;
        setCreators(data || []);
      } catch (error) {
        console.error('Error loading creators:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadCreators();
  }, [availabilityFilter]);

  const filteredCreators = creators.filter(creator =>
    creator.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Creators</h1>
          <p className="text-gray-600">Find the perfect creators for your brand collaborations</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Availability Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available' | 'busy')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="all">All Creators</option>
                <option value="available">Available Only</option>
                <option value="busy">Busy Creators</option>
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-3 text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredCreators.length}</span> creators
            {availabilityFilter === 'available' && ' who are available for work'}
            {availabilityFilter === 'busy' && ' who are currently busy'}
          </div>
        </div>

        {/* Creators Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-24 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No creators found</div>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onViewProfile={(id: string) => {
                  // Navigate to creator profile
                  console.log('View profile:', id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
