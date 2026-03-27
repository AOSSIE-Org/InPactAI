# Database Setup Guide

## Overview

This guide helps you set up and troubleshoot database connectivity issues for the InPact AI Backend.

## Quick Start

### 1. Environment Variables

Create a `.env` file in the `Backend` directory with the following variables:

```env
# PostgreSQL Database Credentials
user=your_database_user
password=your_database_password
host=your_database_host
port=5432
dbname=your_database_name

# Supabase (for REST API fallback)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key

# Optional: Connection Settings
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
DB_CONNECTION_TIMEOUT=10
DB_MAX_RETRIES=3
DB_RETRY_DELAY=1.0
DB_PREFER_IPV4=true
DB_SSL_MODE=require
DB_USE_REST_FALLBACK=true
```

### 2. Supabase Setup

If you're using Supabase:

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Settings** → **Database**
4. Copy the connection details:
   - Host
   - Port
   - Database name
   - User
   - Password (use the password you set when creating the project)

### 3. Create Required Tables

Run the following SQL in your Supabase SQL Editor or pgAdmin:

```sql
-- Trending Niches Table
CREATE TABLE IF NOT EXISTS trending_niches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    insight TEXT,
    global_activity INTEGER DEFAULT 1 CHECK (global_activity BETWEEN 1 AND 5),
    fetched_at DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_trending_niches_fetched_at ON trending_niches(fetched_at DESC);
```

## Common Issues and Solutions

### Issue 1: IPv6 DNS Resolution Error

**Error Message:**
```
❌ Connection attempt failed: getaddrinfo failed
🔴 DNS/IPv6 RESOLUTION ERROR
```

**Root Cause:**
- Supabase hosts resolve to IPv6-only addresses
- Your local network/ISP doesn't support IPv6 properly
- Windows network stack issues with IPv6

**Solutions:**

#### Option 1: Use Supabase Connection Pooler (Recommended)

1. Go to Supabase Dashboard → **Database** → **Connection Pooler**
2. Enable the connection pooler
3. Use the pooler connection string (it's IPv4 compatible):
   ```env
   host=aws-0-us-east-1.pooler.supabase.com
   port=6543
   ```

#### Option 2: Configure IPv4 DNS Servers

1. Open Network Settings in Windows
2. Change DNS servers to Google DNS:
   - Primary: `8.8.8.8`
   - Secondary: `8.8.4.4`

#### Option 3: Use a VPN with IPv6 Support

Use a VPN service that properly supports IPv6 connectivity.

#### Option 4: REST API Fallback Mode

The server will automatically use Supabase REST API as a fallback if PostgreSQL connection fails. Ensure you have set:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
DB_USE_REST_FALLBACK=true
```

### Issue 2: Missing Tables

**Error Message:**
```
⚠️ 'trending_niches' table not found
```

**Solution:**

Run the table creation SQL from section "3. Create Required Tables" above.

### Issue 3: SSL Connection Issues

**Error Message:**
```
SSL error: certificate verify failed
```

**Solution:**

1. Update your `.env` file:
   ```env
   DB_SSL_MODE=require
   ```

2. Or disable SSL for local development (not recommended for production):
   ```env
   DB_SSL_MODE=disable
   ```

### Issue 4: Connection Timeout

**Error Message:**
```
Connection timeout after X seconds
```

**Solutions:**

1. Increase timeout in `.env`:
   ```env
   DB_CONNECTION_TIMEOUT=30
   DB_POOL_TIMEOUT=60
   ```

2. Check your firewall settings
3. Verify database host is reachable:
   ```powershell
   Test-NetConnection -ComputerName your-host.supabase.co -Port 5432
   ```

## Degraded Mode Operation

If the database connection fails, the server will start in **degraded mode**:

- ✅ Server starts successfully
- ✅ Health check endpoints work
- ⚠️ Database-dependent features are limited
- ⚠️ Clear error messages for unavailable features

## Health Check Endpoints

### Basic Health Check
```
GET /
```

Response:
```json
{
  "message": "Welcome to InPact AI API!",
  "status": "healthy",
  "database": {
    "connected": true,
    "has_fallback": true
  },
  "version": "1.0.0"
}
```

### Detailed Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "error": null,
    "has_fallback": true,
    "config_valid": true
  }
}
```

## Testing Your Setup

### 1. Start the Server

```powershell
cd Backend
uvicorn app.main:app --reload
```

### 2. Check Server Logs

Look for these messages:
```
✅ Database connected successfully!
✅ Tables created successfully or already exist
✅ trending_niches table found
✅ Server Ready
```

### 3. Test Endpoints

```powershell
# Health check
curl http://localhost:8000/

# Trending niches
curl http://localhost:8000/api/trending-niches
```

## Advanced Configuration

### Connection Pool Settings

For production environments, optimize connection pooling:

```env
DB_POOL_SIZE=20           # Number of connections in pool
DB_MAX_OVERFLOW=40        # Additional connections allowed
DB_POOL_TIMEOUT=30        # Seconds to wait for connection
DB_POOL_RECYCLE=3600     # Recycle connections after 1 hour
```

### Retry Configuration

Configure retry behavior for better resilience:

```env
DB_MAX_RETRIES=5          # Number of connection attempts
DB_RETRY_DELAY=2.0        # Initial delay between retries (exponential backoff)
```

## Troubleshooting Commands

### Check Network Connectivity

```powershell
# Test DNS resolution
nslookup db.your-project.supabase.co

# Test port connectivity
Test-NetConnection -ComputerName db.your-project.supabase.co -Port 5432

# Check IPv6 connectivity
ping -6 db.your-project.supabase.co
```

### Database Connection Test

```python
# test_connection.py
import asyncio
import asyncpg

async def test():
    conn = await asyncpg.connect(
        user='your_user',
        password='your_password',
        database='your_database',
        host='your_host',
        port=5432,
        ssl='require'
    )
    result = await conn.fetchval('SELECT 1')
    print(f"Connection successful! Result: {result}")
    await conn.close()

asyncio.run(test())
```

## Support

If you continue to experience issues:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test database connectivity using the commands above
4. Review the [Supabase documentation](https://supabase.com/docs/guides/database)

## Production Deployment

For production deployments:

1. ✅ Use connection pooler
2. ✅ Enable connection health checks (`pool_pre_ping=True`)
3. ✅ Set appropriate timeouts
4. ✅ Configure proper SSL/TLS
5. ✅ Set up monitoring and alerts
6. ✅ Use connection pooling
7. ✅ Enable REST API fallback
8. ✅ Test failover scenarios
