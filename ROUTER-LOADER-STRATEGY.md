# Router Loader Strategy Implementation

## Overview
This project uses **React Router's Loader Strategy** as a modern replacement for traditional middleware patterns. This approach eliminates the need for separate `middleware.ts` files and avoids framework deprecation warnings.

## Why Router Loaders?

### Traditional Middleware Problems
- ❌ Framework-specific (Next.js `middleware.ts` doesn't work in Vite)
- ❌ Deprecation warnings in newer versions
- ❌ Separate file to maintain
- ❌ Not native to React ecosystem

### Router Loader Benefits
- ✅ Native React Router v6.4+ feature
- ✅ Route-level protection before rendering
- ✅ Data preloading for better UX
- ✅ Type-safe with TypeScript
- ✅ No deprecation concerns
- ✅ Fully within React ecosystem

## Implementation

### 1. Loader Functions (`src/lib/loaders.ts`)

All middleware-like logic is centralized in loader functions:

```typescript
// Protected route check
export async function protectedLoader() {
  const session = await checkAuth();
  if (!session) return redirect("/login");
  return { session };
}

// Data preloading
export async function dashboardLoader() {
  const session = await checkAuth();
  if (!session) return redirect("/login");
  
  const profile = await fetchUserProfile();
  return { session, profile };
}
```

### 2. Usage in Routes

Loaders execute **before** components render:

```typescript
<Route
  path="/dashboard"
  loader={dashboardLoader}
  element={<DashboardPage />}
/>
```

### 3. Accessing Loader Data

Components receive preloaded data:

```typescript
import { useLoaderData } from "react-router-dom";

function DashboardPage() {
  const { session, profile } = useLoaderData();
  // Data is ready, no loading state needed
}
```

## Available Loaders

| Loader | Purpose | Returns |
|--------|---------|---------|
| `protectedLoader` | Auth check only | `{ session }` |
| `publicRouteLoader` | Redirect if logged in | `null` |
| `dashboardLoader` | Auth + profile data | `{ session, profile }` |
| `sponsorshipsLoader` | Auth + sponsorships | `{ session, sponsorships }` |
| `messagesLoader` | Auth + chat list | `{ session, chats }` |
| `collaborationDetailsLoader` | Auth + specific collab | `{ session, collaboration }` |
| `analyticsLoader` | Auth + analytics data | `{ session, analytics }` |
| `contractsLoader` | Auth + contracts | `{ session, contracts }` |
| `roleBasedLoader(roles)` | Auth + role check | `{ session, profile }` |

## Migration Guide

### Before (with middleware.ts)
```typescript
// middleware.ts - NOT SUPPORTED IN VITE
export function middleware(request) {
  if (!isAuthenticated) {
    return redirect('/login');
  }
}
```

### After (with router loaders)
```typescript
// src/lib/loaders.ts
export async function protectedLoader() {
  const session = await checkAuth();
  if (!session) return redirect("/login");
  return { session };
}

// App.tsx
<Route
  path="/dashboard"
  loader={protectedLoader}
  element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
/>
```

## Advanced Usage

### Role-Based Access
```typescript
<Route
  path="/admin"
  loader={roleBasedLoader(['admin', 'moderator'])}
  element={<AdminPanel />}
/>
```

### Error Handling
```typescript
export async function dataLoader() {
  try {
    const data = await fetchData();
    return { data };
  } catch (error) {
    // Redirect on error or return error state
    return { error: error.message };
  }
}
```

### Parallel Data Fetching
```typescript
export async function complexLoader() {
  const [profile, stats, notifications] = await Promise.all([
    fetchProfile(),
    fetchStats(),
    fetchNotifications()
  ]);
  return { profile, stats, notifications };
}
```

## Integration with Backend Middleware

This frontend router strategy works seamlessly with our FastAPI backend middleware (`Backend/app/main.py`):

- **Frontend**: Route-level auth checks before rendering
- **Backend**: Request logging, timing, security headers
- **API Client**: Auth token injection, error handling

Together, these create a complete request/response pipeline without needing framework-specific middleware files.

## Performance Benefits

1. **Faster Page Loads**: Data loads in parallel with component code
2. **No Loading Spinners**: Data ready before render
3. **Better UX**: Instant navigation with prefetched data
4. **Reduced Waterfalls**: All data loads at route level

## Best Practices

✅ **DO:**
- Use loaders for auth checks
- Preload critical data
- Handle errors gracefully
- Return redirects for unauthorized access

❌ **DON'T:**
- Load unnecessary data
- Make slow API calls that block navigation
- Forget error handling
- Use loaders for side effects

## Conclusion

The Router Loader Strategy provides:
- ✅ Modern, maintainable middleware replacement
- ✅ No framework deprecation warnings
- ✅ Better performance through data preloading
- ✅ Type-safe, testable code
- ✅ Native React Router integration

This eliminates the need for `middleware.ts` entirely while providing superior functionality within the React ecosystem.
