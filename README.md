![Inpact arch](https://github.com/user-attachments/assets/2b911c1f-2a14-4663-9a22-f04b22baa5b8)

# Inpact - AI-Powered Creator Collaboration & Sponsorship Matchmaking

Inpact is an open-source AI-powered platform designed to connect content creators, brands, and agencies through data-driven insights. By leveraging Generative AI (GenAI), audience analytics, and engagement metrics, Inpact ensures highly relevant sponsorship opportunities for creators while maximizing ROI for brands investing in influencer marketing.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Backend Setup](#3-backend-setup)
  - [4. Database Setup](#4-database-setup)
  - [5. Environment Variables](#5-environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Project Workflow](#project-workflow)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Contact](#contact)

---

## ✨ Features

### AI-Driven Sponsorship Matchmaking

- Automatically connects creators with brands based on audience demographics, engagement rates, and content style
- Real-time matching algorithm powered by AI
- Personalized recommendations for both creators and brands

### AI-Powered Creator Collaboration Hub

- Facilitates partnerships between creators with complementary audiences and content niches
- AI-suggested collaboration ideas based on audience overlap
- Joint campaign planning and execution tools

### AI-Based Pricing & Deal Optimization

- Provides fair sponsorship pricing recommendations based on engagement, market trends, and historical data
- Dynamic pricing suggestions for different campaign types
- Budget optimization for brands

### AI-Powered Negotiation & Contract Assistant

- Assists in structuring deals, generating contracts, and optimizing terms using AI insights
- Automated contract generation with customizable templates
- Smart negotiation suggestions

### Performance Analytics & ROI Tracking

- Enables brands and creators to track sponsorship performance, audience engagement, and campaign success
- Real-time analytics dashboards
- AI-powered insights and recommendations for future campaigns
- Screenshot extraction and metric tracking using Gemini Vision API

### Campaign Management

- Full lifecycle campaign management for brands
- Creator proposal system with status tracking
- Deliverable tracking and metric submission
- Contract management and signing workflow

---

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 16.0.1 (React 19.2.0)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query, Axios
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

### Backend

- **Framework**: FastAPI 0.120.3
- **Language**: Python 3.13+
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **AI Integration**:
  - Groq API (for text generation)
  - Google Gemini API (for content generation and vision tasks)
- **Server**: Uvicorn
- **Validation**: Pydantic

### Database & Services

- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for images and files)
- **Real-time**: Supabase Realtime (for live updates)

---

## 📁 Project Structure

```
InPactAI/
├── frontend/                    # Next.js frontend application
│   ├── app/                     # Next.js App Router
│   │   ├── brand/              # Brand-specific pages
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   ├── campaigns/      # Campaign management
│   │   │   ├── contracts/     # Contract management
│   │   │   ├── home/          # Brand dashboard
│   │   │   ├── onboarding/    # Brand onboarding flow
│   │   │   └── proposals/     # Proposal management
│   │   ├── creator/           # Creator-specific pages
│   │   │   ├── analytics/     # Creator analytics
│   │   │   ├── collaborations/ # Collaboration hub
│   │   │   ├── contracts/    # Contract management
│   │   │   ├── home/         # Creator dashboard
│   │   │   ├── onboarding/   # Creator onboarding flow
│   │   │   └── proposals/    # Proposal applications
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable React components
│   │   ├── analytics/         # Analytics components
│   │   ├── auth/             # Authentication components
│   │   ├── contracts/        # Contract components
│   │   ├── dashboard/        # Dashboard components
│   │   └── onboarding/       # Onboarding components
│   ├── lib/                   # Utility libraries
│   │   ├── api/              # API client functions
│   │   ├── auth-helpers.ts   # Auth utilities
│   │   ├── campaignApi.ts    # Campaign API client
│   │   ├── geminiApi.ts      # Gemini API client
│   │   └── supabaseClient.ts # Supabase client
│   ├── types/                 # TypeScript type definitions
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── next.config.ts         # Next.js configuration
│
├── backend/                    # FastAPI backend application
│   ├── app/                   # Main application code
│   │   ├── api/               # API routes
│   │   │   └── routes/        # Route handlers
│   │   │       ├── analytics.py      # Analytics endpoints
│   │   │       ├── auth.py           # Authentication endpoints
│   │   │       ├── campaigns.py      # Campaign endpoints
│   │   │       ├── collaborations.py # Collaboration endpoints
│   │   │       ├── creators.py       # Creator endpoints
│   │   │       ├── gemini_generate.py # Gemini AI endpoints
│   │   │       ├── groq_generate.py  # Groq AI endpoints
│   │   │       ├── health.py        # Health check endpoints
│   │   │       └── proposals.py     # Proposal endpoints
│   │   ├── core/              # Core application logic
│   │   │   ├── config.py      # Configuration settings
│   │   │   ├── dependencies.py # FastAPI dependencies
│   │   │   ├── security.py    # Security utilities
│   │   │   └── supabase_clients.py # Supabase clients
│   │   ├── db/                # Database utilities
│   │   ├── models/            # Pydantic models
│   │   ├── services/         # Business logic services
│   │   └── main.py           # FastAPI application entry point
│   ├── requirements.txt       # Python dependencies
│   └── env_example           # Environment variables example
│
├── docs/                      # Documentation
│   └── database/             # Database schema documentation
│
├── guides/                    # Implementation guides
│   └── summaries/            # Feature implementation summaries
│
└── README.md                  # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Python** (3.11 or higher) - [Download](https://www.python.org/downloads/)
- **pip** (Python package manager)
- **Git** - [Download](https://git-scm.com/downloads)

### Required Accounts & API Keys

- **Supabase Account** - [Sign up](https://supabase.com/)
- **Groq API Key** (for AI features) - [Get API Key](https://console.groq.com/)
- **Google Gemini API Key** (for AI features) - [Get API Key](https://makersuite.google.com/app/apikey)

### Recommended Tools

- **VS Code** or any modern code editor
- **Postman** or **Insomnia** (for API testing)
- **Supabase CLI** (optional, for local development)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/AOSSIE-Org/InPact.git
cd InPact
```

### 2. Frontend Setup

#### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

#### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

#### Step 3: Create Environment File

Create a `.env.local` file in the `frontend` directory:

```bash
touch .env.local
```

#### Step 4: Configure Environment Variables

Add the following variables to `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**How to get Supabase credentials:**

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Log in and create a new project (or select an existing one)
3. Navigate to **Project Settings** → **API**
4. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the **anon public** key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> **Important**: For production, ensure `NEXT_PUBLIC_API_URL` uses HTTPS.

### 3. Backend Setup

#### Step 1: Navigate to Backend Directory

```bash
cd ../backend
```

#### Step 2: Create Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

#### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 4: Navigate to App Directory

```bash
cd app
```

#### Step 5: Create Environment File

Create a `.env` file in the `backend/app` directory:

```bash
touch .env
```

#### Step 6: Configure Environment Variables

Copy the example file and edit it:

```bash
cp ../env_example .env
```

Edit `.env` with your credentials:

```env
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key

# Database Configuration (Optional - for direct PostgreSQL connection)
DATABASE_URL=postgresql://postgres.your-project-ref:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres

# AI Configuration (Optional)
GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key-here

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# JWT Secret Key from Supabase
# Location: Dashboard → Project Settings → API → JWT Settings → JWT Secret
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-dashboard
```

**How to get Supabase credentials:**

1. **Supabase URL & Keys:**
   - Go to **Project Settings** → **API**
   - Copy **Project URL** → `SUPABASE_URL`
   - Copy **anon public** key → `SUPABASE_KEY`
   - Copy **service_role** key → `SUPABASE_SERVICE_KEY` (keep this secret!)

2. **Database URL (Optional):**
   - Go to **Project Settings** → **Database**
   - Under **Connection string**, select **URI** or **Session Pooler**
   - For IPv6 networks, use the direct connection:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```
   - For IPv4 networks or if you encounter connection issues, use the Session Pooler:
     ```
     postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
     ```

3. **JWT Secret:**
   - Go to **Project Settings** → **API** → **JWT Settings**
   - Copy the **JWT Secret** (NOT the anon key!)

4. **AI API Keys:**
   - **Groq**: Visit [Groq Console](https://console.groq.com/) → Create API key
   - **Gemini**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) → Create API key

### 4. Database Setup

#### Step 1: Set Up Database Schema

1. **Open Supabase Dashboard**
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Select your project

2. **Access SQL Editor**
   - In the left sidebar, click on **SQL Editor**

3. **Run Schema Script**
   - The database schema is located in `backend/SQL`
   - Copy the contents of the SQL file
   - Paste into the SQL Editor
   - Click **Run** to execute

   > **Note**: The schema file contains table definitions and ENUM types. Make sure to run it in the correct order.

#### Step 2: Verify Tables

After running the schema, verify that the following tables exist:

- `profiles`
- `brands`
- `creators`
- `campaigns`
- `proposals`
- `contracts`
- `collaborations`
- `campaign_deliverables`
- `campaign_metrics`
- And other related tables

#### Step 3: Add Onboarding Column (if needed)

If the `profiles` table doesn't have the `onboarding_completed` column, run:

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
```

### 5. Environment Variables

#### Frontend Environment Variables (`.env.local`)

| Variable                        | Description              | Required | Example                     |
| ------------------------------- | ------------------------ | -------- | --------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL     | Yes      | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes      | `eyJhbGc...`                |
| `NEXT_PUBLIC_API_URL`           | Backend API URL          | Yes      | `http://localhost:8000`     |

#### Backend Environment Variables (`.env`)

| Variable               | Description                  | Required | Example                     |
| ---------------------- | ---------------------------- | -------- | --------------------------- |
| `SUPABASE_URL`         | Supabase project URL         | Yes      | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY`         | Supabase anon key            | Yes      | `eyJhbGc...`                |
| `SUPABASE_SERVICE_KEY` | Supabase service role key    | Yes      | `eyJhbGc...`                |
| `SUPABASE_JWT_SECRET`  | JWT secret from Supabase     | Yes      | `your-jwt-secret`           |
| `DATABASE_URL`         | PostgreSQL connection string | No       | `postgresql://...`          |
| `GROQ_API_KEY`         | Groq API key for AI          | No       | `gsk_xxxxx`                 |
| `GEMINI_API_KEY`       | Gemini API key for AI        | No       | `AIzaSy...`                 |
| `ALLOWED_ORIGINS`      | CORS allowed origins         | No       | `http://localhost:3000`     |

---

## 🏃 Running the Application

### Development Mode

#### Start Backend Server

1. Navigate to the backend app directory:

   ```bash
   cd backend/app
   ```

2. Activate virtual environment (if using one):

   ```bash
   source ../venv/bin/activate  # macOS/Linux
   # or
   venv\Scripts\activate  # Windows
   ```

3. Start the FastAPI server:

   ```bash
   uvicorn main:app --reload
   ```

   The backend will be available at: `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs` (Swagger UI)
   - Alternative Docs: `http://localhost:8000/redoc` (ReDoc)

#### Start Frontend Server

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```

````

   The frontend will be available at: `http://localhost:3000`

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
npm start
````

#### Build Backend

```bash
cd backend/app
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 📚 API Documentation

### Base URL

- **Development**: `http://localhost:8000`
- **Production**: Your production backend URL

### Main API Endpoints

#### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

#### Campaigns

- `GET /campaigns` - List campaigns (with filters)
- `POST /campaigns` - Create new campaign
- `GET /campaigns/{campaign_id}` - Get campaign details
- `PUT /campaigns/{campaign_id}` - Update campaign
- `DELETE /campaigns/{campaign_id}` - Delete campaign

#### Proposals

- `GET /proposals` - List proposals
- `POST /proposals` - Create proposal
- `GET /proposals/{proposal_id}` - Get proposal details
- `PUT /proposals/{proposal_id}` - Update proposal
- `DELETE /proposals/{proposal_id}` - Delete proposal
- `POST /proposals/{proposal_id}/accept` - Accept proposal
- `POST /proposals/{proposal_id}/reject` - Reject proposal

#### Contracts

- `GET /contracts` - List contracts
- `GET /contracts/{contract_id}` - Get contract details
- `POST /contracts` - Create contract
- `PUT /contracts/{contract_id}` - Update contract

#### Collaborations

- `GET /collaborations` - List collaborations
- `POST /collaborations` - Create collaboration
- `GET /collaborations/{collaboration_id}` - Get collaboration details

#### Creators

- `GET /creators` - List creators (with search/filters)
- `GET /creators/{creator_id}` - Get creator profile

#### Analytics

- `GET /analytics/campaigns/{campaign_id}` - Get campaign analytics
- `POST /analytics/metrics` - Create metric
- `POST /analytics/metrics/{metric_id}/submit` - Submit metric value
- `POST /analytics/screenshots/extract` - Extract metrics from screenshot

#### AI Generation

- `POST /api/groq/generate` - Generate content using Groq
- `POST /api/gemini/generate` - Generate content using Gemini

#### Health Check

- `GET /health` - Health check endpoint
- `GET /health/supabase` - Supabase connection check

### Interactive API Documentation

Once the backend is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

These provide interactive documentation where you can test endpoints directly.

---

## 📖 Usage Guide

### For Creators

1. **Sign Up / Login**
   - Visit the signup page and create an account
   - Select "Creator" as your role
   - Verify your email address

2. **Complete Onboarding**
   - Fill out your profile information
   - Add your social media platforms
   - Specify your niche and content types
   - Upload profile picture

3. **Browse Campaigns**
   - View available sponsorship opportunities
   - Filter by niche, budget, platform, etc.
   - View campaign details and requirements

4. **Apply for Sponsorships**
   - Submit proposals for campaigns
   - Include your pitch and portfolio
   - Track application status

5. **Manage Collaborations**
   - Discover potential collaboration partners
   - Send collaboration proposals
   - Manage active collaborations

6. **Track Performance**
   - View analytics for your campaigns
   - Submit deliverables and metrics
   - Monitor engagement and ROI

### For Brands

1. **Sign Up / Login**
   - Create a brand account
   - Select "Brand" as your role
   - Verify your email

2. **Complete Onboarding**
   - Add company information
   - Define target audience
   - Set marketing goals and budget
   - Upload brand assets

3. **Create Campaigns**
   - Create new sponsorship campaigns
   - Define deliverables and requirements
   - Set budget and timeline
   - Specify preferred creator criteria

4. **Review Proposals**
   - View creator applications
   - Review creator profiles and portfolios
   - Accept or reject proposals

5. **Manage Contracts**
   - Generate contracts using AI
   - Negotiate terms
   - Track contract status

6. **Monitor Analytics**
   - View campaign performance
   - Track ROI and engagement metrics
   - Analyze creator submissions
   - Get AI-powered insights

---

## 🔄 Project Workflow

### Overall System Workflow

```mermaid
graph TD;
  A[User Signup/Login] -->|via Supabase Auth| B[User Dashboard];
  B -->|Fetch Audience & Engagement Data| C[AI-Powered Sponsorship Matchmaking];
  C -->|Suggest Ideal Brand Deals| D[Creator Applies for Sponsorship];
  D -->|Submit Application| E[Brand Reviews & Shortlists];
  E -->|AI-Based Pricing & Negotiation| F[Contract Generation via AI];
  F -->|Sign Deal| G[Sponsorship Execution];
  G -->|Track Performance| H[AI-Powered ROI Analytics];
  H -->|Optimized Insights| I[Brands & Creators Adjust Strategies];
  I -->|Feedback Loop| C;
```

### Frontend Workflow

```mermaid
graph TD;
  A[User Visits Inpact] -->|Supabase Auth| B[Login/Signup];
  B -->|Fetch User Profile| C[Dashboard Loaded];
  C -->|Request AI-Powered Matches| D[Fetch Sponsorship Deals via API];
  D -->|Display Relevant Matches| E[User Applies for Sponsorship];
  E -->|Send Application via API| F[Wait for Brand Response];
  F -->|Fetch Application Status| G[Show Application Updates];
  G -->|If Approved| H[Contract Generation Page];
  H -->|AI Drafts Contract| I[User Reviews & Signs Contract];
  I -->|Start Campaign Execution| J[Track Sponsorship Performance];
  J -->|Show Performance Analytics| K[AI Optimizes Future Matches];
```

### Backend Workflow

```mermaid
graph TD;
  A[User Authentication] -->|Supabase Auth API| B[Verify User];
  B -->|Store User Data in DB| C[Return JWT Token];
  C -->|Fetch User Profile| D[Return Profile Data];
  D -->|Receive Sponsorship Match Request| E[Query AI Engine];
  E -->|Analyze Audience & Engagement| F[Generate Sponsorship Matches];
  F -->|Return Matches via API| G[Send to Frontend];
  G -->|User Applies for Sponsorship| H[Store Application in DB];
  H -->|Notify Brand| I[Brand Reviews Application];
  I -->|Brand Approves/Rejects| J[Update Application Status];
  J -->|If Approved| K[Generate AI-Powered Contract];
  K -->|AI Suggests Pricing & Terms| L[Store Finalized Contract in DB];
  L -->|Track Campaign Performance| M[Analyze Engagement & ROI];
  M -->|Return Insights| N[AI Refines Future Recommendations];
```

---

## 🔧 Troubleshooting

### Common Issues

#### Frontend Issues

**Issue: "Missing Supabase environment variables"**

- **Solution**: Ensure `.env.local` exists in the `frontend` directory with all required variables
- Check that variable names start with `NEXT_PUBLIC_` for client-side access

**Issue: "NEXT_PUBLIC_API_URL is missing or not valid"**

- **Solution**: For local development, set `NEXT_PUBLIC_API_URL=http://localhost:8000`
- For production, ensure it's a valid HTTPS URL

**Issue: Build fails with TypeScript errors**

- **Solution**: Run `npm install` to ensure all dependencies are installed
- Check that TypeScript version is compatible (v5+)

#### Backend Issues

**Issue: "Supabase client initialization failed"**

- **Solution**:
  - Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
  - Check that your Supabase project is active
  - Ensure network connectivity to Supabase

**Issue: "JWT verification failed"**

- **Solution**:
  - Verify `SUPABASE_JWT_SECRET` matches the JWT Secret in Supabase dashboard
  - Ensure you're using the JWT Secret, not the anon key

**Issue: Database connection errors**

- **Solution**:
  - Check `DATABASE_URL` format (if using direct connection)
  - For IPv4 networks, use Session Pooler connection string
  - Verify database password is correct
  - Check Supabase project status

**Issue: "Module not found" errors**

- **Solution**:
  - Activate virtual environment: `source venv/bin/activate`
  - Reinstall dependencies: `pip install -r requirements.txt`

#### Database Issues

**Issue: Tables don't exist**

- **Solution**: Run the SQL schema script in Supabase SQL Editor
- Check that all ENUM types are created before tables

**Issue: "onboarding_completed column doesn't exist"**

- **Solution**: Run the ALTER TABLE command:
  ```sql
  ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
  ```

#### API Issues

**Issue: CORS errors**

- **Solution**:
  - Add frontend URL to `ALLOWED_ORIGINS` in backend `.env`
  - Ensure backend CORS middleware is configured correctly

**Issue: 401 Unauthorized errors**

- **Solution**:
  - Verify JWT token is being sent in request headers
  - Check token expiration
  - Ensure user is logged in

### Getting Help

If you encounter issues not covered here:

1. Check the [Issues](https://github.com/AOSSIE-Org/InPact/issues) page
2. Review the documentation in the `docs/` and `guides/` directories
3. Reach out on Discord or create a new issue

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Contribution Process

1. **Fork the Repository on GitHub**
   - Go to [https://github.com/AOSSIE-Org/InPact](https://github.com/AOSSIE-Org/InPact) and click the "Fork" button in the top right.

2. **Clone Your Fork Locally**

   ```bash
   git clone <your-fork-url>
   cd InPact
   ```

3. **Add the Original Repository as Upstream Remote**

   ```bash
   git remote add upstream https://github.com/AOSSIE-Org/InPact.git
   ```

4. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Make Your Changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable
   - Update documentation as needed

6. **Commit Your Changes**

   ```bash
   git commit -m "Add: Description of your feature"
   ```

   Use clear, descriptive commit messages:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Docs:` for documentation changes

7. **Push to Your Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Submit for review

### Code Style Guidelines

- **Frontend**: Follow Next.js and React best practices
- **Backend**: Follow PEP 8 Python style guide
- **TypeScript**: Use strict mode, avoid `any` types
- **Comments**: Add comments for complex logic
- **Documentation**: Update README and code comments

### Development Setup for Contributors

1. Follow the installation steps above
2. Create a separate branch for your work
3. Test your changes thoroughly
4. Ensure all tests pass (if applicable)
5. Update relevant documentation

---

## 📞 Contact

- **GitHub Issues**: [Create an issue](https://github.com/AOSSIE-Org/InPact/issues)
- **Discord**: Join our Discord server (link in repository)
- **Email**: Contact through GitHub profile

---

## 📄 License

This project is open source. Please check the LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ by the AOSSIE community
- Powered by Supabase, Next.js, and FastAPI
- AI capabilities powered by Groq and Google Gemini

---

**Happy Coding! 🚀**
