# Gemini API Integration Guide for InPactAI

## Overview

This guide explains how Gemini API integration is implemented in the InPactAI project, including backend and frontend setup, security best practices, and step-by-step instructions for future use.

---

## Implementation Summary

### 1. Backend (Python/FastAPI)

- **API Route:** `/generate` (POST)
- **File:** `backend/app/routes/gemini_generate.py`
- **Functionality:** Accepts a JSON body with a `prompt` string, calls the Gemini REST API using the API key from environment, and returns the response as JSON.
- **Security:** The Gemini API key is stored in `backend/.env` and loaded via Pydantic `Settings` (`gemini_api_key`). It is **never** exposed to the frontend.
- **Router Inclusion:** The Gemini router is included in `backend/app/main.py` using `app.include_router(gemini_generate.router)`.

### 2. Frontend (Next.js/TypeScript)

- **API Call Function:** `frontend/lib/geminiApi.ts`
- **Functionality:** Calls the backend `/generate` endpoint using the API URL from `NEXT_PUBLIC_API_URL` in `.env`. Accepts a prompt and returns the backend response.
- **Security:** The frontend never accesses the Gemini API key directly.

---

## How to Use Gemini API in This Project

### Backend Usage

1. **Add your Gemini API key** to `backend/.env`:
   ```
   GEMINI_API_KEY="your-gemini-api-key"
   ```
2. **Access the key in code** via Pydantic Settings:
   ```python
   from app.core.config import settings
   GEMINI_API_KEY = settings.gemini_api_key
   ```
3. **Call the Gemini REST API** using Python's `requests`:
   ```python
   response = requests.post(
       "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
       json={"contents": [{"role": "user", "parts": [{"text": prompt}]}]},
       headers={"Content-Type": "application/json"},
       params={"key": GEMINI_API_KEY},
       timeout=30
   )
   result = response.json()
   ```
4. **Never expose the API key to the frontend.**

### Frontend Usage

1. **Set the backend API URL** in `frontend/.env`:
   ```
   NEXT_PUBLIC_API_URL="http://localhost:8000"
   ```
2. **Use the provided function** in `frontend/lib/geminiApi.ts`:
   ```typescript
   import { generateGeminiText } from "./lib/geminiApi";
   const result = await generateGeminiText("Your prompt here");
   ```
3. **Do not use the Gemini API key in frontend code.**

---

## Security Best Practices

- Store secrets only in backend `.env` files.
- Use Pydantic Settings for environment variable management.
- Only call Gemini API from backend code.
- Frontend communicates with backend via secure endpoints.

---

## Troubleshooting

- If requests hang, check your API key, network, and backend logs.
- Ensure all required Python packages are installed: `fastapi`, `requests`, `pydantic-settings`.
- Confirm routers are included in `main.py`.

---

## References

- [Gemini REST API Docs](https://ai.google.dev/gemini-api/docs)
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/settings/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)

---

## Contact

For questions or improvements, contact the InPactAI maintainers.
