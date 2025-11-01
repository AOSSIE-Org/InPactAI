# Supabase Integration Setup

This project uses Supabase for authentication, database, and backend services.

## 🚀 Quick Start

### Frontend Setup (Next.js)

1. **Install dependencies** (already done):
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Update with your Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     ```

3. **Use the Supabase client**:
   ```typescript
   import { supabase } from '@/lib/supabaseClient';
   
   // Example: Fetch data
   const { data, error } = await supabase
     .from('your_table')
     .select('*');
   ```

### Backend Setup (FastAPI)

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment variables**:
   - Copy `env_example` to `.env`:
     ```bash
     cp env_example .env
     ```
   - Update with your Supabase credentials:
     ```env
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_KEY=your-service-role-key-here
     ```

3. **Use the Supabase client**:
   ```python
   from app.services.supabase_client import supabase
   
   # Example: Fetch data
   response = supabase.table('your_table').select('*').execute()
   ```

## 🔍 Health Check

Test your Supabase connection:

```bash
# Start the backend server
cd backend
uvicorn app.main:app --reload

# Check Supabase connection
curl http://localhost:8000/health/supabase
```

Expected response:
```json
{
  "connected": true,
  "message": "Supabase client initialized",
  "status": "ready"
}
```

## 📁 Project Structure

### Frontend
```
frontend/
├── lib/
│   └── supabaseClient.ts    # Supabase client initialization
├── types/
│   └── supabase.ts          # TypeScript types for database
└── .env.example             # Environment variables template
```

### Backend
```
backend/
├── app/
│   ├── core/
│   │   └── config.py        # Configuration settings
│   ├── services/
│   │   └── supabase_client.py  # Supabase client initialization
│   └── api/
│       └── routes/
│           └── health.py    # Health check endpoints
└── env_example              # Environment variables template
```

## 🔑 Environment Variables

### Frontend (Next.js)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key (safe for client-side)

### Backend (FastAPI)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Supabase service role key (admin access, keep secret!)
- `DATABASE_URL`: (Optional) Direct PostgreSQL connection string
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)

## 🔒 Security Notes

1. **Never commit `.env` files** - they are in `.gitignore`
2. **Frontend uses anon key** - safe for browser, limited permissions
3. **Backend uses service key** - full admin access, never expose to frontend
4. **Rotate keys if exposed** - generate new keys in Supabase dashboard
5. **Use environment-specific keys** - different keys for dev/staging/prod

## 📚 Next Steps

1. Create your database tables in Supabase Dashboard
2. Update `frontend/types/supabase.ts` with your table types
3. Implement authentication flows
4. Add Row Level Security (RLS) policies in Supabase

## 🛠️ Useful Commands

```bash
# Frontend development
cd frontend && npm run dev

# Backend development
cd backend && uvicorn app.main:app --reload

# Install new dependencies
cd frontend && npm install <package>
cd backend && pip install <package> && pip freeze > requirements.txt
```

## 📖 Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Python + Supabase Guide](https://supabase.com/docs/reference/python/introduction)
