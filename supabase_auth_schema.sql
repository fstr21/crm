-- =====================================================
-- AUTH ATTEMPTS TABLE FOR RATE LIMITING
-- =====================================================

-- Create table for logging authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL,
    email VARCHAR(255),
    attempt_type VARCHAR(50) NOT NULL CHECK (attempt_type IN ('login', 'signup', 'oauth', 'password_reset')),
    success BOOLEAN NOT NULL DEFAULT FALSE,
    user_agent TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip_created 
ON public.auth_attempts (ip_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_attempts_email_created 
ON public.auth_attempts (email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_attempts_type_created 
ON public.auth_attempts (attempt_type, created_at DESC);

-- RLS policies (if needed)
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to insert/select
CREATE POLICY "Service role can manage auth attempts" 
ON public.auth_attempts 
FOR ALL 
TO service_role 
USING (true);

-- Policy to allow authenticated users to view their own attempts
CREATE POLICY "Users can view their own auth attempts" 
ON public.auth_attempts 
FOR SELECT 
TO authenticated 
USING (email = auth.jwt() ->> 'email');

-- Grant permissions
GRANT ALL ON public.auth_attempts TO service_role;
GRANT SELECT ON public.auth_attempts TO authenticated;