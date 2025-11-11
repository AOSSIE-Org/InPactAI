# Deployment Environment Configuration

## Environment Variables

- `NEXT_PUBLIC_API_URL` must be set to a valid HTTPS URL for the backend API.
- Example for production:
  - `NEXT_PUBLIC_API_URL=https://your-production-backend.example.com`

## HTTPS Enforcement

- All backend URLs must use HTTPS in production.
- The application will fail to start if `NEXT_PUBLIC_API_URL` is missing or not HTTPS.

## Vercel Deployment

- See `vercel.json` for environment and rewrite configuration.

## Docker Deployment (optional)

If deploying with Docker, ensure the environment variable is set in your Dockerfile or deployment environment:

```
ENV NEXT_PUBLIC_API_URL=https://your-production-backend.example.com
```

## Local Development

- For local development, you may use HTTP, but production must use HTTPS.

---

**Do not deploy to production without setting a valid HTTPS backend URL.**
