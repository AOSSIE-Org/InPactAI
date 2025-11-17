![Inpact arch](https://github.com/user-attachments/assets/2b911c1f-2a14-4663-9a22-f04b22baa5b8)

# Inpact - AI-Powered Creator Collaboration & Sponsorship Matchmaking

Inpact is an open-source AI-powered platform designed to connect content creators, brands, and agencies through data-driven insights. By leveraging Generative AI (GenAI), audience analytics, and engagement metrics, Inpact ensures highly relevant sponsorship opportunities for creators while maximizing ROI for brands investing in influencer marketing.

## Features

### AI-Driven Sponsorship Matchmaking

- Automatically connects creators with brands based on audience demographics, engagement rates, and content style.

### AI-Powered Creator Collaboration Hub

- Facilitates partnerships between creators with complementary audiences and content niches.

### AI-Based Pricing & Deal Optimization

- Provides fair sponsorship pricing recommendations based on engagement, market trends, and historical data.

### AI-Powered Negotiation & Contract Assistant

- Assists in structuring deals, generating contracts, and optimizing terms using AI insights.

### Performance Analytics & ROI Tracking

- Enables brands and creators to track sponsorship performance, audience engagement, and campaign success.

## Tech Stack

- **Frontend**: ReactJS
- **Backend**: FastAPI
- **Database**: Supabase
- **AI Integration**: GenAI for audience analysis and sponsorship recommendations

---

## Workflow

### 1. User Registration & Profile Setup

- Creators, brands, and agencies sign up and set up their profiles.
- AI gathers audience insights and engagement data.

### 2. AI-Powered Sponsorship Matchmaking

- The platform suggests brands and sponsorship deals based on audience metrics.
- Creators can apply for sponsorships or receive brand invitations.

### 3. Collaboration Hub

- Creators can find and connect with others for joint campaigns.
- AI recommends potential collaborations based on niche and audience overlap.

### 4. AI-Based Pricing & Contract Optimization

- AI provides fair pricing recommendations for sponsorships.
- Auto-generates contract templates with optimized terms.

### 5. Campaign Execution & Tracking

- Creators execute sponsorship campaigns.
- Brands track campaign performance through engagement and ROI metrics.

### 6. Performance Analysis & Continuous Optimization

- AI analyzes campaign success and suggests improvements for future deals.
- Brands and creators receive insights for optimizing future sponsorships.

---

## Getting Started

### Prerequisites

Make sure you have these installed:
- Node.js (v18 or higher) + npm
- Python 3.9+ 
- Git
- A Supabase account (free tier is enough)

### Local Development Setup (Step-by-Step)

#### 1. Clone the Repository
```bash
git clone https://github.com/AOSSIE-Org/InPact.git
cd InPact
```

#### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_YOUTUBE_API_KEY=your-youtube-api-key
```

**How to get Supabase frontend keys:**
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Open your project → **Settings** → **API**
3. Copy **Project URL** → `VITE_SUPABASE_URL`
4. Copy **anon public** key → `VITE_SUPABASE_ANON_KEY`

**How to get Youtube API Key**
1. Log in to the [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Create a new project or select an existing one from the project drop-down menu.
3. In the Cloud Console, search for "YouTube Data API" in the search bar and select "YouTube Data API v3" from the results.
4. Click the "Enable" button to enable the API for your project.
5. Navigate to the "Credentials" tab in the left-hand menu.
6. Click "Create Credentials" and then select "API key" from the dropdown menu and now use that api key.

#### 3. Backend Setup (with Python Virtual Environment – Highly Recommended)

```bash
cd ../backend

# Create a virtual environment (isolates dependencies)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

cd app
```

#### 4. Create Backend `.env` File

Create `.env` in `backend/app/` and fill all values:

```env
# Supabase Database Connection
user=postgres
password=YOUR_DB_PASSWORD
host=db.yourproject.supabase.co
port=5432
dbname=postgres

# API Keys
GROQ_API_KEY=your_groq_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
GEMINI_API_KEY=your_gemini_key
YOUTUBE_API_KEY=your_youtube_key
```

**Where to get each key (with direct links):**

| Variable            | Service                        | How to Get (Step-by-Step)                                                                                   |
|---------------------|--------------------------------|-------------------------------------------------------------------------------------------------------------|
| `SUPABASE_URL` & `SUPABASE_KEY` | Supabase                  | Same as frontend → **Settings → API** → copy URL & anon key                                                |
| `host` & `password` | Supabase PostgreSQL           | **Settings → Database → Connection info** → copy Host + the password you set when creating the project    |
| `GROQ_API_KEY`      | Groq (fast AI inference)      | → [console.groq.com/keys](https://console.groq.com/keys) → Create API Key → copy (`gsk_...`)                |
| `GEMINI_API_KEY`    | Google Gemini                 | → [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) → Create API key                |
| `YOUTUBE_API_KEY`   | YouTube Data API v3           | 1. [console.cloud.google.com](https://console.cloud.google.com)<br>2. New Project → Enable YouTube Data API v3<br>3. Credentials → Create API Key |

All are free for development use.

#### 5. Start the Servers

**Terminal 1 (Frontend):**
```bash
cd frontend
npm run dev
```
→ Opens at `http://localhost:5173`

**Terminal 2 (Backend – make sure venv is active):**
```bash
cd backend/app
uvicorn main:app --reload
```
→ Runs at `http://127.0.0.1:8000`

You’re all set! Open `http://localhost:5173` and register/login.

---

## Data Population

To populate the database with initial data, follow these steps:

1. **Open Supabase Dashboard**

   - Go to [Supabase](https://supabase.com/) and log in.
   - Select your created project.

2. **Access the SQL Editor**

   - In the left sidebar, click on **SQL Editor**.

3. **Run the SQL Script**
   - Open the `sql.txt` file in your project.
   - Copy the SQL queries from the file.
   - Paste the queries into the SQL Editor and click **Run**.

This will populate the database with the required initial data for the platform. 🚀

---

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m "Added feature"`).
4. Push to your branch (`git push origin feature-name`).
5. Open a Pull Request.

---

## Overall Workflow

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

**FRONTEND workflow in detail**

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

**BACKEND workflow in detail**

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

## Contact

For queries, issues, or feature requests, please raise an issue or reach out on our Discord server.


Happy Coding!

