# Campaign Management System - Visual Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BRAND USER JOURNEY                                │
└─────────────────────────────────────────────────────────────────────┘

1. Login → Complete Onboarding → Brand Home
                                      ↓
                        ┌─────────────┴─────────────┐
                        │   /brand/createcampaign   │
                        │   (Campaign Hub)          │
                        └─────────┬─────────┬───────┘
                                 │         │
                    ┌────────────┘         └────────────┐
                    ↓                                    ↓
        ┌──────────────────────┐          ┌──────────────────────┐
        │ View All Campaigns   │          │ Create New Campaign  │
        │ /brand/campaigns     │          │ /brand/campaigns/    │
        │                      │          │        create        │
        └──────────┬───────────┘          └──────────┬───────────┘
                   │                                  │
                   ↓                                  ↓
        ┌──────────────────────┐          ┌──────────────────────┐
        │ • Search Campaigns   │          │ • Fill Form          │
        │ • Filter by Status   │          │ • Add Deliverables   │
        │ • Expand Details     │          │ • Set Budget         │
        │ • Edit/View Apps     │          │ • Save/Publish       │
        └──────────────────────┘          └──────────────────────┘
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Pages:                         Components:                     │
│  • /brand/createcampaign        • AuthGuard                     │
│  • /brand/campaigns             • SlidingMenu                   │
│  • /brand/campaigns/create                                      │
│                                                                  │
│  Utils:                         Types:                          │
│  • lib/campaignApi.ts           • types/campaign.ts             │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/REST API
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Routes:                        Models:                         │
│  • POST /campaigns              • CampaignCreate                │
│  • GET /campaigns               • CampaignUpdate                │
│  • GET /campaigns/{id}          • CampaignResponse              │
│  • PUT /campaigns/{id}                                          │
│  • DELETE /campaigns/{id}                                       │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Supabase Client
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL/Supabase)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tables:                                                         │
│  • auth.users                                                    │
│  • profiles (role: Brand)                                        │
│  • brands                                                        │
│  • campaigns ← Main table                                        │
│  • campaign_deliverables                                         │
│  • campaign_applications                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Data Flow: Create Campaign

```
User fills form
     ↓
Clicks "Publish Campaign"
     ↓
Frontend validates form
     ↓
campaignApi.createCampaign(formData)
     ↓
Transform formData → API payload
     ↓
POST /campaigns?user_id={userId}
     ↓
Backend receives request
     ↓
Get brand_id from user_id
     ↓
Generate slug from title
     ↓
Insert into campaigns table
     ↓
Return created campaign
     ↓
Frontend shows success
     ↓
Navigate to /brand/campaigns
     ↓
Display new campaign in list
```

---

## 📋 Data Flow: View Campaigns

```
User visits /brand/campaigns
     ↓
Load campaigns on mount
     ↓
campaignApi.fetchCampaigns(filters)
     ↓
GET /campaigns?user_id={id}&status={status}&search={term}
     ↓
Backend receives request
     ↓
Get brand_id from user_id
     ↓
Build query with filters
     ↓
Fetch from campaigns table
     ↓
Return campaigns array
     ↓
Frontend displays list
     ↓
User can:
  • Search
  • Filter
  • Expand details
  • Edit campaign
```

---

## 🗂️ File Structure

```
InPactAI/
├── backend/
│   └── app/
│       ├── main.py (✓ Modified - Added campaigns router)
│       └── api/
│           └── routes/
│               └── campaigns.py (✓ NEW - All endpoints)
│
├── frontend/
│   ├── app/
│   │   └── brand/
│   │       ├── createcampaign/
│   │       │   └── page.tsx (✓ Modified - Hub page)
│   │       └── campaigns/
│   │           ├── page.tsx (✓ NEW - List view)
│   │           └── create/
│   │               └── page.tsx (✓ NEW - Form)
│   │
│   ├── types/
│   │   └── campaign.ts (✓ NEW - TypeScript types)
│   │
│   └── lib/
│       └── campaignApi.ts (✓ NEW - API utilities)
│
└── guides/
    └── summaries/
        ├── CAMPAIGN_MANAGEMENT_IMPLEMENTATION.md (✓ NEW)
        ├── CAMPAIGN_QUICK_REFERENCE.md (✓ NEW)
        └── CAMPAIGN_VISUAL_FLOW.md (✓ NEW - This file)
```

---

## 🎨 UI Components Breakdown

### Main Hub (`/brand/createcampaign`)

```
┌────────────────────────────────────────────────────┐
│              Campaign Management                    │
│    Create new campaigns or manage existing ones     │
├────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────┐  ┌───────────────────┐     │
│  │ View All          │  │ Create New        │     │
│  │ Campaigns         │  │ Campaign          │     │
│  │                   │  │                   │     │
│  │ [Blue Card]       │  │ [Purple Card]     │     │
│  │ • Search & filter │  │ • Set goals       │     │
│  │ • View details    │  │ • Define audience │     │
│  │ • Track apps      │  │ • Set budget      │     │
│  │                   │  │ • Find creators   │     │
│  │ [Go to Campaigns] │  │ [Start Creating]  │     │
│  └───────────────────┘  └───────────────────┘     │
│                                                     │
│  Quick Stats:                                       │
│  [Total: -]  [Active: -]  [Applications: -]        │
└────────────────────────────────────────────────────┘
```

### Campaign List (`/brand/campaigns`)

```
┌────────────────────────────────────────────────────┐
│  My Campaigns              [+ Create Campaign]      │
├────────────────────────────────────────────────────┤
│  [Search...] [Filter ▼] [Search]                   │
├────────────────────────────────────────────────────┤
│                                                     │
│  Campaign Title 1                    [ACTIVE]      │
│  Brief description here...                         │
│  📅 Jan 1 | 💰 ₹50K-₹200K | 👥 Instagram, YouTube │
│                                           [▼]      │
│  ─────────────────────────────────────────────     │
│  │ Full description...                         │   │
│  │ Deliverables: 5 posts, 2 videos            │   │
│  │ [Edit] [View Applications]                 │   │
│  ─────────────────────────────────────────────     │
│                                                     │
│  Campaign Title 2                    [DRAFT]       │
│  Another campaign...                               │
│  📅 Feb 15 | 💰 ₹100K-₹500K | 👥 TikTok          │
│                                           [▼]      │
└────────────────────────────────────────────────────┘
```

### Create Form (`/brand/campaigns/create`)

```
┌────────────────────────────────────────────────────┐
│  ← Back        Create New Campaign                  │
├────────────────────────────────────────────────────┤
│  📝 Basic Information                               │
│  Campaign Title * [________________]                │
│  Short Description [________________]               │
│  Detailed Description [____________]                │
│                      [____________]                │
├────────────────────────────────────────────────────┤
│  📅 Campaign Duration                               │
│  Start Date [____] End Date [____]                 │
├────────────────────────────────────────────────────┤
│  💰 Budget Range (INR)                             │
│  Min [_____] Max [_____]                           │
├────────────────────────────────────────────────────┤
│  📱 Target Platforms                                │
│  [Instagram] [YouTube] [TikTok] [Twitter]...       │
├────────────────────────────────────────────────────┤
│  📦 Campaign Deliverables                           │
│  Platform [▼] Type [▼] Qty [1] [+ Add]            │
│  • Instagram - Post (Qty: 3) ☑ Required [🗑]      │
│  • YouTube - Video (Qty: 1) ☑ Required [🗑]       │
├────────────────────────────────────────────────────┤
│  👤 Creator Preferences                             │
│  [Fashion] [Beauty] [Lifestyle]...                 │
│  Follower Range [10K-50K (Micro) ▼]               │
├────────────────────────────────────────────────────┤
│  🎯 Target Audience                                 │
│  Age: [18-24] [25-34] [35-44]...                  │
│  Gender: [Male] [Female] [All]                     │
│  Income: [Middle] [Upper-middle]...                │
│  Description [________________]                     │
├────────────────────────────────────────────────────┤
│  [Cancel] [Save as Draft] [Publish Campaign]       │
└────────────────────────────────────────────────────┘
```

---

## 🔄 State Management

### Campaign List Page States

- **Loading**: Shows spinner while fetching
- **Error**: Shows error message with retry
- **Empty**: Shows "No campaigns" with CTA
- **Loaded**: Shows campaign cards
- **Expanded**: Shows full details for selected campaign

### Create Form States

- **Initial**: Empty form
- **Filling**: User entering data
- **Validating**: Client-side validation
- **Submitting**: API call in progress
- **Success**: Navigate to list
- **Error**: Show error message, stay on form

---

## 🎯 User Interactions

### List Page

1. **Search**: Type → Enter → API call → Update list
2. **Filter**: Select status → Auto API call → Update list
3. **Expand**: Click card → Toggle expanded state → Show details
4. **Edit**: Click edit → Navigate to edit page (TODO)
5. **Create**: Click button → Navigate to create page

### Create Form

1. **Select Platforms**: Click buttons → Toggle selection
2. **Add Deliverable**: Fill fields → Click Add → Append to list
3. **Remove Deliverable**: Click trash icon → Remove from list
4. **Select Niches**: Click buttons → Toggle selection
5. **Target Audience**: Click options → Toggle selection
6. **Save Draft**: Click → Validate → API → Navigate
7. **Publish**: Click → Validate → API → Navigate

---

## ✅ Validation Rules

### Required Fields

- Campaign title

### Conditional Validation

- Budget: min < max (if both provided)
- Dates: start < end (if both provided)

### Deliverable Validation

- Platform and content type required to add

### Data Types

- Budget: Numeric
- Dates: ISO date format
- Arrays: Platform, niches, target audience
- JSONB: Deliverables, target audience

---

This visual flow provides a complete overview of the campaign management system implementation!
