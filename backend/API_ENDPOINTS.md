# InPact AI - API Endpoints Reference

**Total Endpoints: 109**

## Quick Access to API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs` (or your production URL + `/docs`)
- **ReDoc**: `http://localhost:8000/redoc` (or your production URL + `/redoc`)
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## Endpoint Categories

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Health Checks (`/health`)
- `GET /health/` - Basic health check
- `GET /health/supabase` - Supabase connection check

### Campaigns (`/campaigns`)
- `GET /campaigns` - List campaigns
- `GET /campaigns/public` - Public campaigns
- `GET /campaigns/{campaign_id}` - Get campaign details
- `POST /campaigns` - Create campaign
- `PUT /campaigns/{campaign_id}` - Update campaign
- `DELETE /campaigns/{campaign_id}` - Delete campaign
- `GET /campaigns/{campaign_id}/deliverables` - Get deliverables
- `GET /campaigns/{campaign_id}/find-creators` - Find matching creators
- `GET /campaigns/{campaign_id}/search-creator` - Search creator
- `GET /campaigns/{campaign_id}/applications` - Get applications
- `POST /campaigns/{campaign_id}/applications` - Submit application
- `PUT /campaigns/{campaign_id}/applications/{application_id}/status` - Update application status
- `POST /campaigns/{campaign_id}/applications/{application_id}/create-proposal` - Create proposal from application

### Proposals (`/proposals`)
- `GET /proposals/sent` - Get sent proposals
- `GET /proposals/received` - Get received proposals
- `GET /proposals/negotiations` - Get negotiations
- `GET /proposals/draft` - Draft proposal
- `POST /proposals` - Create proposal
- `PUT /proposals/{proposal_id}/status` - Update proposal status
- `DELETE /proposals/{proposal_id}` - Delete proposal
- `POST /proposals/{proposal_id}/negotiation/start` - Start negotiation
- `POST /proposals/{proposal_id}/negotiation/messages` - Send negotiation message
- `GET /proposals/{proposal_id}/negotiation/deal-probability` - Get deal probability
- `POST /proposals/{proposal_id}/negotiation/analyze-sentiment` - Analyze sentiment
- `POST /proposals/{proposal_id}/negotiation/draft-message` - Draft message
- `POST /proposals/{proposal_id}/negotiation/translate` - Translate message
- `POST /proposals/{proposal_id}/negotiation/accept` - Accept negotiation
- `PUT /proposals/{proposal_id}/negotiation/terms` - Update negotiation terms

### Analytics (`/analytics`)
- `POST /analytics/metrics` - Create metric
- `GET /analytics/metrics/{metric_id}` - Get metric
- `PUT /analytics/metrics/{metric_id}` - Update metric
- `DELETE /analytics/metrics/{metric_id}` - Delete metric
- `GET /analytics/metrics/{metric_id}/history` - Get metric history
- `POST /analytics/metrics/{metric_id}/submit` - Submit metric value
- `POST /analytics/metrics/{metric_id}/extract-from-screenshot` - Extract from screenshot
- `GET /analytics/campaigns/{campaign_id}/dashboard` - Campaign dashboard
- `GET /analytics/brand/all-deliverables` - All brand deliverables
- `GET /analytics/brand/dashboard-stats` - Brand dashboard stats
- `GET /analytics/creator/campaigns` - Creator campaigns
- `GET /analytics/creator/campaigns/{campaign_id}` - Creator campaign details
- `GET /analytics/creator/dashboard-stats` - Creator dashboard stats
- `GET /analytics/creator/deliverables/{deliverable_id}/metrics` - Deliverable metrics
- `GET /analytics/creator/pending-requests` - Pending update requests
- `POST /analytics/creator/metrics/{metric_id}/comment` - Add comment
- `POST /analytics/metric-updates/{update_id}/feedback` - Add feedback
- `POST /analytics/update-requests` - Create update request

### AI Analytics (`/analytics/ai`)
- `POST /analytics/ai/predictive` - Predictive analytics
- `GET /analytics/ai/insights` - Automated insights
- `GET /analytics/ai/audience-segmentation` - Audience segmentation
- `POST /analytics/ai/sentiment` - Sentiment analysis
- `GET /analytics/ai/anomaly-detection` - Anomaly detection
- `GET /analytics/ai/attribution` - Attribution modeling
- `GET /analytics/ai/benchmarking` - Benchmarking
- `GET /analytics/ai/churn-prediction` - Churn prediction
- `POST /analytics/ai/natural-language-query` - Natural language query
- `GET /analytics/ai/kpi-optimization` - KPI optimization

### Profiles (`/brand/profile`, `/creator/profile`)
- `GET /brand/profile` - Get brand profile
- `PUT /brand/profile` - Update brand profile
- `POST /brand/profile/ai-fill` - AI fill brand profile
- `GET /creator/profile` - Get creator profile
- `PUT /creator/profile` - Update creator profile
- `POST /creator/profile/ai-fill` - AI fill creator profile

### Creators (`/creators`)
- `GET /creators` - List creators
- `GET /creators/recommendations` - Get recommendations
- `GET /creators/{creator_id}` - Get creator details
- `GET /creators/niches/list` - List niches
- `GET /creators/campaign-wall/recommendations` - Campaign wall recommendations
- `GET /creators/applications` - Creator applications

### Collaborations (`/collaborations`)
- `GET /collaborations` - List collaborations
- `GET /collaborations/{collaboration_id}` - Get collaboration
- `GET /collaborations/{collaboration_id}/workspace` - Get workspace
- `GET /collaborations/stats/summary` - Get stats summary
- `POST /collaborations/propose` - Propose collaboration
- `POST /collaborations/generate-ideas` - Generate ideas
- `POST /collaborations/recommend-creator` - Recommend creator
- `POST /collaborations/{collaboration_id}/accept` - Accept collaboration
- `POST /collaborations/{collaboration_id}/decline` - Decline collaboration
- `POST /collaborations/{collaboration_id}/complete` - Complete collaboration
- `POST /collaborations/{collaboration_id}/deliverables` - Create deliverable
- `PATCH /collaborations/{collaboration_id}/deliverables/{deliverable_id}` - Update deliverable
- `POST /collaborations/{collaboration_id}/messages` - Send message
- `POST /collaborations/{collaboration_id}/assets` - Upload asset
- `POST /collaborations/{collaboration_id}/feedback` - Submit feedback

### Contracts (`/contracts`)
- `GET /contracts` - List contracts
- `GET /contracts/{contract_id}` - Get contract
- `GET /contracts/{contract_id}/deliverables` - Get deliverables
- `GET /contracts/{contract_id}/versions` - Get versions
- `GET /contracts/{contract_id}/versions/current` - Get current version
- `GET /contracts/{contract_id}/chat` - Get chat
- `GET /contracts/{contract_id}/summarize` - Summarize contract
- `POST /contracts/generate-template` - Generate template
- `POST /contracts/{contract_id}/ask-question` - Ask question
- `POST /contracts/{contract_id}/translate` - Translate contract
- `POST /contracts/{contract_id}/explain-clause` - Explain clause
- `POST /contracts/{contract_id}/deliverables` - Create deliverable
- `POST /contracts/{contract_id}/deliverables/approve` - Approve deliverables
- `POST /contracts/{contract_id}/deliverables/{deliverable_id}/submit` - Submit deliverable
- `POST /contracts/{contract_id}/deliverables/{deliverable_id}/review` - Review deliverable
- `POST /contracts/{contract_id}/request-status-change` - Request status change
- `POST /contracts/{contract_id}/respond-status-change` - Respond to status change
- `POST /contracts/{contract_id}/track-signed-download` - Track signed download
- `POST /contracts/{contract_id}/track-unsigned-download` - Track unsigned download
- `POST /contracts/{contract_id}/versions` - Create version
- `POST /contracts/{contract_id}/versions/{version_id}/approve` - Approve version
- `PUT /contracts/{contract_id}/signed-link` - Update signed link
- `PUT /contracts/{contract_id}/unsigned-link` - Update unsigned link

### AI Generation (`/generate`, `/groq/generate`)
- `POST /generate` - Gemini generation
- `POST /groq/generate` - Groq generation

## How to Use

1. **Interactive Documentation**: Visit `/docs` when your backend is running
2. **List Endpoints**: Run `python3 backend/list_endpoints.py`
3. **Test Endpoints**: Use the Swagger UI at `/docs` or tools like Postman/curl

## Base URL

- **Local**: `http://localhost:8000`
- **Production**: Set via `NEXT_PUBLIC_API_URL` environment variable

