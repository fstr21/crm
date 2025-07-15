# SUPABASE AUTHENTICATION WITH RATE LIMITING - IMPLEMENTATION PLAN

## Current State Analysis

✅ **Supabase JavaScript Client**: Already installed (`@supabase/supabase-js: ^2.38.0`)
✅ **Mock Data Cleanup**: 95% complete, only one hardcoded user ID in ActivityForm.tsx
✅ **Database Schema**: Supabase schema exists (`supabase_crm_schema_auth_fixed.sql`)
✅ **Local Redis**: Available for rate limiting (no Docker required)

⚠️ **Missing**: No Supabase client configuration or auth implementation yet

## Phase 1: Remove Remaining Mock Data

### 1.1 Fix ActivityForm Component
**File**: `src/components/activities/ActivityForm.tsx:43`
**Issue**: Hardcoded `user_id: 'current-user'`
**Solution**: Replace with auth context

## Phase 2: Supabase Client Setup

### 2.1 Environment Configuration
**Create**: `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REDIS_URL=redis://localhost:6379
```

### 2.2 Supabase Client Configuration
**Create**: `src/lib/supabase.ts`
- Initialize Supabase client
- Configure auth options
- Set up persistence

## Phase 3: Authentication Implementation

### 3.1 Auth Context & Provider
**Create**: `src/contexts/AuthContext.tsx`
- User state management
- Login/logout functions
- Session persistence
- Loading states

### 3.2 Authentication Components
**Create**: `src/components/auth/`
- `LoginForm.tsx` - Email/password login
- `SignupForm.tsx` - User registration  
- `GoogleLoginButton.tsx` - OAuth flow
- `AuthGuard.tsx` - Protected route wrapper

### 3.3 Authentication Pages
**Create**: `src/app/auth/`
- `login/page.tsx` - Login page
- `signup/page.tsx` - Registration page
- `callback/page.tsx` - OAuth callback handler

## Phase 4: Rate Limiting Implementation

### 4.1 Redis Client Setup
**Create**: `src/lib/redis.ts`
- Redis connection configuration
- Rate limiting utilities
- Error handling

### 4.2 Rate Limiting Middleware
**Create**: `src/middleware/rateLimiter.ts`
- Track auth attempts by IP/user
- 5 attempts per 15 minutes limit
- Redis-based storage
- Block/allow logic

### 4.3 Auth Attempt Logging
**Database**: Add `auth_attempts` table
```sql
CREATE TABLE auth_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address INET NOT NULL,
  email VARCHAR(255),
  attempt_type VARCHAR(50) NOT NULL, -- 'login', 'signup', 'oauth'
  success BOOLEAN NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Phase 5: Google OAuth Configuration

### 5.1 Supabase Dashboard Setup
- Enable Google provider
- Configure OAuth credentials
- Set redirect URLs
- Enable email confirmation (production)

### 5.2 OAuth Flow Implementation
- `signInWithOAuth()` for Google
- Handle callback with code exchange
- Error handling for OAuth failures
- User profile creation/update

## Phase 6: Security Enhancements

### 6.1 Session Management
- JWT validation
- Token refresh handling
- Secure cookie configuration
- Session timeout

### 6.2 Password Security
- Strong password requirements
- Password reset flow
- Account lockout after failed attempts
- CAPTCHA integration (future)

## Phase 7: Integration & Testing

### 7.1 Update Existing Components
- Replace hardcoded user data with auth context
- Add authentication guards to protected pages
- Update API calls to include auth headers
- Handle unauthenticated states

### 7.2 Real Data Testing Requirements
**NO MOCK DATA ALLOWED**
- Real Supabase project setup
- Actual Google OAuth app credentials
- Live Redis instance testing
- Real email delivery testing
- PostgreSQL auth audit logging

### 7.3 Test Scenarios
- ✅ Email/password signup with confirmation
- ✅ Email/password login with rate limiting
- ✅ Google OAuth complete flow
- ✅ Rate limiting triggers after 5 attempts
- ✅ Redis stores attempt counts correctly
- ✅ PostgreSQL logs all auth attempts
- ✅ Session persistence across page refreshes
- ✅ Logout clears all sessions
- ✅ Protected routes redirect to login

## Implementation Order

1. **Remove mock data** (1 file fix)
2. **Setup Supabase client** (environment + client config)
3. **Create auth context** (state management)
4. **Build auth components** (login/signup forms)
5. **Implement rate limiting** (Redis + middleware)
6. **Add Google OAuth** (provider configuration)
7. **Update existing app** (remove hardcoded data)
8. **Real testing** (automation with actual services)

## Success Criteria

- ✅ Zero hardcoded user data remaining
- ✅ Working Google OAuth login
- ✅ Working email/password auth
- ✅ Rate limiting prevents brute force (5/15min)
- ✅ All auth attempts logged to PostgreSQL
- ✅ Session persistence works
- ✅ Protected routes enforce authentication
- ✅ Real test automation passes 95% scenarios

## Dependencies Required

- Supabase project with Google OAuth enabled
- Local Redis instance (no Docker required)
- Supabase PostgreSQL database with auth tables
- Google Cloud Console OAuth app
- Environment variables configured

---

**Next Step**: Execute Phase 1 - Remove remaining mock data from ActivityForm.tsx