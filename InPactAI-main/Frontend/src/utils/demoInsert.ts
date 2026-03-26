import { supabase } from './supabase';

export async function demoInsert() {
  // Insert user
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      id: 'demo-user-123',
      username: 'demouser',
      email: 'demo@example.com',
      role: 'creator',
      age: '25',
      gender: 'Male',
      country: 'India',
      category: 'Tech',
    });
  console.log('User:', user, userError);

  // Insert social profile
  const { data: profile, error: profileError } = await supabase
    .from('social_profiles')
    .insert({
      user_id: 'demo-user-123',
      platform: 'YouTube',
      username: 'demoyt',
      followers: 1000,
      posts: 10,
      channel_id: 'UC1234567890abcdef',
      channel_name: 'Demo Channel',
      subscriber_count: 1000,
      total_views: 50000,
      video_count: 10,
      per_post_cost: 100,
      per_video_cost: 200,
      per_post_cost_currency: 'USD',
      per_video_cost_currency: 'USD',
      channel_url: 'https://youtube.com/channel/UC1234567890abcdef',
    });
  console.log('Profile:', profile, profileError);
} 