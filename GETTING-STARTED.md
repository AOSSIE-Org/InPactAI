# 🚀 Getting Started with Docker

Welcome! This guide will get you up and running in under 5 minutes.

## Prerequisites

Install Docker Desktop:
- **Windows**: [Download Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- **Mac**: [Download Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
- **Linux**: Install Docker Engine and Docker Compose

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/AOSSIE-Org/InPact.git
cd InPact
```

### 2. Setup Environment Variables

#### Backend Configuration

```bash
cd Backend
cp .env.example .env
```

Open `Backend/.env` and add your credentials:

```env
user=postgres
password=your_supabase_password
host=db.xxxxx.supabase.co
port=5432
dbname=postgres
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key
REDIS_HOST=redis
REDIS_PORT=6379
```

#### Frontend Configuration

```bash
cd ../Frontend
cp .env.example .env
```

Open `Frontend/.env` and add your credentials:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_API_URL=http://localhost:8000
```

### 3. Get Your Credentials

#### Supabase (Required)

1. Go to [supabase.com](https://supabase.com/)
2. Create an account and new project
3. Go to Project Settings → API
4. Copy **Project URL** → Use as `SUPABASE_URL` and `VITE_SUPABASE_URL`
5. Copy **anon public key** → Use as `SUPABASE_KEY` and `VITE_SUPABASE_ANON_KEY`
6. Go to Project Settings → Database → Connection String
7. Copy the connection details → Use in Backend/.env

#### API Keys (Optional but recommended)

- **GROQ**: [console.groq.com](https://console.groq.com/)
- **Gemini**: [makersuite.google.com](https://makersuite.google.com/)
- **YouTube**: [console.cloud.google.com](https://console.cloud.google.com/)

### 4. Start the Application

From the project root directory:

```bash
cd ..
docker compose up --build
```

Wait for the build to complete (first time takes 3-5 minutes).

### 5. Access the Application

Once you see "Application startup complete":

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Daily Development

### Start Services
```bash
docker compose up
```

### Stop Services
```bash
docker compose down
```

### View Logs
```bash
docker compose logs -f
```

### Restart After Code Changes
No need! Hot reload is enabled. Just save your files and the app will refresh automatically.

### Rebuild After Dependency Changes
If you modified `requirements.txt` or `package.json`:
```bash
docker compose up --build
```

## Troubleshooting

### Port Already in Use
```bash
docker compose down
netstat -ano | findstr :5173    # Windows
lsof -i :5173                   # Mac/Linux
```

### Container Won't Start
```bash
docker compose logs backend
docker compose logs frontend
```

### Database Connection Failed
- Verify your Supabase credentials in `Backend/.env`
- Make sure you copied the correct host and password
- Check if your IP is whitelisted in Supabase

### Permission Errors (Linux/Mac)
```bash
sudo chown -R $USER:$USER .
```

### Clear Everything and Restart
```bash
docker compose down -v
docker system prune -a
docker compose up --build
```

## Need Help?

- Check [DOCKER.md](DOCKER.md) for detailed documentation
- See [DOCKER-REFERENCE.md](DOCKER-REFERENCE.md) for quick commands
- View [DOCKER-ARCHITECTURE.md](DOCKER-ARCHITECTURE.md) for system design
- Ask on project's discussion board

## What's Next?

1. Populate the database using `sql.txt` in Supabase SQL Editor
2. Start coding! The app will hot reload on file changes
3. Check out the API docs at http://localhost:8000/docs
4. Read the contribution guidelines

## Validation

Run the validation script to check your setup:

```bash
python validate-env.py
```

Or use the verification script:

**Windows:**
```bash
verify-setup.bat
```

**Linux/Mac:**
```bash
chmod +x verify-setup.sh
./verify-setup.sh
```

---

**That's it! You're all set up and ready to contribute! 🎉**
