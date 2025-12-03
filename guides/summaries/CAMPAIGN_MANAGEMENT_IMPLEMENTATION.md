# Campaign Management System Implementation Guide

## Overview

A comprehensive campaign management system for brand users to create, view, and manage influencer marketing campaigns.

## Features Implemented

### 1. **Main Campaign Hub** (`/brand/createcampaign`)

- Modern landing page with two primary options:
  - **View All Campaigns**: Navigate to campaign list
  - **Create New Campaign**: Start a new campaign
- Quick stats dashboard (Total, Active, Applications)
- Beautiful gradient UI with hover effects

### 2. **Campaign List View** (`/brand/campaigns`)

- **Search & Filter**:
  - Search campaigns by title or description
  - Filter by status (Draft, Active, Paused, Completed, Archived)
  - Real-time filtering

- **Campaign Cards**:
  - Summary view showing highlights (title, status, dates, budget, platforms)
  - Expandable details on click
  - Color-coded status badges
  - Formatted currency and dates

- **Detailed View** (Expandable):
  - Full description
  - Campaign duration
  - Budget range
  - Target platforms
  - Preferred creator niches
  - Follower range requirements
  - Deliverables with quantity and guidance
  - Target audience details
  - Edit and view applications buttons

### 3. **Create Campaign Form** (`/brand/campaigns/create`)

Comprehensive form with all database schema fields:

#### Basic Information

- Campaign title (required)
- Short description
- Detailed description

#### Campaign Duration

- Start date
- End date

#### Budget

- Minimum budget (INR)
- Maximum budget (INR)

#### Target Platforms

- Multi-select from: Instagram, YouTube, TikTok, Twitter, LinkedIn, Facebook, Twitch, Blog, Podcast

#### Deliverables

- Dynamic deliverable builder
- Fields: Platform, Content Type, Quantity, Guidance, Required flag
- Add/remove multiple deliverables
- Visual list of added deliverables

#### Creator Preferences

- Preferred niches (multi-select from 17+ options)
- Follower range selection (Nano to Mega influencers)

#### Target Audience

- Age groups (multi-select)
- Gender (multi-select)
- Income levels (multi-select)
- Audience description (free text)

#### Actions

- Save as Draft
- Publish Campaign (sets status to active)
- Form validation
- Error handling

## Technical Implementation

### Backend (`/backend`)

#### API Routes (`app/api/routes/campaigns.py`)

- `POST /campaigns` - Create new campaign
- `GET /campaigns` - List all campaigns for a brand (with filters)
- `GET /campaigns/{id}` - Get single campaign details
- `PUT /campaigns/{id}` - Update campaign
- `DELETE /campaigns/{id}` - Delete campaign

**Authentication**: User ID passed via query parameter (from auth middleware)

**Features**:

- Auto-slug generation from title
- Brand ID lookup from user ID
- Pagination support (limit/offset)
- Search functionality
- Status filtering
- Ownership verification
- Auto-publish timestamp on status change

#### Database Schema Matching

All fields match the `campaigns` table in PostgreSQL:

```sql
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY,
  brand_id uuid NOT NULL,
  title text NOT NULL,
  slug text UNIQUE,
  short_description text,
  description text,
  status text NOT NULL DEFAULT 'draft',
  platforms ARRAY,
  deliverables jsonb,
  target_audience jsonb,
  budget_min numeric,
  budget_max numeric,
  preferred_creator_niches ARRAY,
  preferred_creator_followers_range text,
  created_at timestamp,
  updated_at timestamp,
  published_at timestamp,
  starts_at timestamp,
  ends_at timestamp,
  is_featured boolean
)
```

### Frontend (`/frontend`)

#### Types (`types/campaign.ts`)

- `Campaign` - Full campaign interface
- `CampaignFormData` - Form data interface
- `CampaignDeliverable` - Deliverable structure
- `TargetAudience` - Audience targeting structure
- Constants for all dropdown options

#### API Utilities (`lib/campaignApi.ts`)

- `fetchCampaigns(filters)` - Get campaigns with filtering
- `fetchCampaignById(id)` - Get single campaign
- `createCampaign(data)` - Create new campaign
- `updateCampaign(id, data)` - Update campaign
- `deleteCampaign(id)` - Delete campaign
- Helper functions: `formatCurrency`, `formatDate`, `getStatusColor`

#### Components

1. **Main Hub** (`app/brand/createcampaign/page.tsx`)
   - Two action cards with gradients
   - Feature lists
   - Stats placeholders

2. **Campaign List** (`app/brand/campaigns/page.tsx`)
   - Search bar with icon
   - Status filter dropdown
   - Empty state handling
   - Loading state with spinner
   - Error state with retry
   - Expandable campaign cards
   - Responsive grid layout

3. **Create Form** (`app/brand/campaigns/create/page.tsx`)
   - Multi-section form with clear headings
   - Toggle buttons for multi-select fields
   - Dynamic deliverable builder
   - Form validation
   - Loading states
   - Error messages

## Authentication & Authorization

All routes are protected with `AuthGuard` component:

- Requires "Brand" role
- Redirects to login if not authenticated
- Redirects to correct home if wrong role

Backend verifies brand ownership for all operations.

## UI/UX Features

### Design System

- **Colors**: Blue (primary), Purple (secondary), status-based colors
- **Gradients**: Subtle background gradients for visual appeal
- **Shadows**: Elevation with shadow-lg and shadow-md
- **Transitions**: Smooth hover and state transitions
- **Responsive**: Mobile-first design with breakpoints

### User Experience

- **Clear CTAs**: Large, obvious action buttons
- **Visual Feedback**: Loading spinners, hover effects, disabled states
- **Error Handling**: User-friendly error messages
- **Validation**: Client-side validation with helpful messages
- **Search**: Real-time search with Enter key support
- **Filters**: Easy-to-use dropdown filters
- **Expandable Details**: Minimize clutter, show on demand

### Accessibility

- Semantic HTML
- Clear labels
- Keyboard navigation support
- Color contrast compliance
- Focus states

## Environment Variables

### Backend (`.env`)

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
DATABASE_URL=postgresql://...
```

### Frontend (`.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

## Running the Application

### Backend

```bash
cd backend
# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows
# Install dependencies
pip install -r requirements.txt
# Run server
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
# Install dependencies
npm install
# Run development server
npm run dev
```

### Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Routes

### Brand Routes

- `/brand/createcampaign` - Main campaign hub
- `/brand/campaigns` - Campaign list view
- `/brand/campaigns/create` - Create new campaign
- `/brand/campaigns/edit/{id}` - Edit campaign (TODO)

### API Endpoints

- `GET /campaigns?user_id={id}&status={status}&search={term}` - List campaigns
- `POST /campaigns?user_id={id}` - Create campaign
- `GET /campaigns/{campaign_id}?user_id={id}` - Get campaign
- `PUT /campaigns/{campaign_id}?user_id={id}` - Update campaign
- `DELETE /campaigns/{campaign_id}?user_id={id}` - Delete campaign

## Database Relationships

```
auth.users
    ↓
profiles (role: Brand)
    ↓
brands (brand profile data)
    ↓
campaigns (marketing campaigns)
    ↓
├── campaign_deliverables
├── campaign_applications
├── campaign_invites
└── deals
```

## Future Enhancements

### Planned Features

1. **Edit Campaign** - Form pre-populated with existing data
2. **Campaign Analytics** - Performance metrics and graphs
3. **Applications View** - See creator applications per campaign
4. **Bulk Actions** - Archive/delete multiple campaigns
5. **Export** - Download campaign data as CSV/PDF
6. **Duplicate Campaign** - Clone existing campaigns
7. **Campaign Templates** - Pre-filled templates for common campaign types
8. **Rich Text Editor** - Better description formatting
9. **Image Upload** - Campaign banners and media
10. **Collaboration** - Invite team members to manage campaigns

### Technical Improvements

1. **Pagination** - Implement proper pagination for large lists
2. **Caching** - Cache campaign data for better performance
3. **Optimistic Updates** - Update UI before API response
4. **Real-time Updates** - WebSocket for live updates
5. **Notifications** - Email/push notifications for applications
6. **Better Validation** - More comprehensive field validation
7. **Testing** - Unit and integration tests
8. **Error Logging** - Centralized error tracking

## Troubleshooting

### Common Issues

**1. "Brand profile not found" error**

- Ensure user has completed onboarding as a Brand
- Check that `brands` table has entry for user_id

**2. Campaigns not loading**

- Check backend is running on port 8000
- Verify CORS settings allow frontend origin
- Check browser console for API errors

**3. Form submission fails**

- Check all required fields are filled
- Verify budget min < max
- Verify start date < end date
- Check backend logs for validation errors

**4. Authentication errors**

- Ensure user is logged in
- Verify Supabase credentials are correct
- Check auth token hasn't expired

## Support

For issues or questions:

1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure database schema matches expectations
4. Review API documentation at `/docs`

## License

This implementation is part of the InPactAI project.
