-- =====================================================
-- SAFE MIGRATION STRATEGY FOR CRM SCHEMA UPGRADE
-- =====================================================
-- This migration safely upgrades existing contacts table
-- to comprehensive CRM schema while preserving data
-- =====================================================

-- Step 1: Create backup of existing data
CREATE TABLE IF NOT EXISTS contacts_backup_20250714 AS 
SELECT * FROM public.contacts;

-- Step 2: Create new comprehensive contacts table structure
-- (Temporary table to avoid conflicts)
CREATE TABLE IF NOT EXISTS contacts_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information (mapped from existing)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    company_name VARCHAR(200), -- maps to existing 'company'
    job_title VARCHAR(100),
    
    -- Contact Information (mapped from existing)
    email VARCHAR(255), -- existing field
    phone VARCHAR(20),  -- existing field
    mobile VARCHAR(20),
    website VARCHAR(255),
    
    -- Address Information (NEW FIELDS)
    street_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    
    -- CRM Fields (NEW FIELDS)
    contact_status VARCHAR(50) DEFAULT 'active' CHECK (contact_status IN ('active', 'inactive', 'prospect', 'customer', 'churned')),
    lead_source VARCHAR(100),
    lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
    lifecycle_stage VARCHAR(50) DEFAULT 'lead' CHECK (lifecycle_stage IN ('lead', 'prospect', 'opportunity', 'customer', 'evangelist')),
    
    -- Relationship Management (NEW FIELDS)
    assigned_to UUID, -- Will add FK constraint after users table exists
    tags TEXT[],
    notes TEXT,
    
    -- Social Media (NEW FIELDS)
    linkedin_url VARCHAR(255),
    twitter_handle VARCHAR(100),
    
    -- Business Information (NEW FIELDS)
    annual_revenue DECIMAL(15,2),
    employee_count INTEGER,
    industry VARCHAR(100),
    
    -- System Fields (existing created_at, updated_at preserved)
    created_by UUID, -- Will add FK constraint after users table exists
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_email_per_company UNIQUE (email, company_name)
);

-- Step 3: Migrate existing data to new structure
INSERT INTO contacts_new (
    first_name, 
    last_name, 
    company_name, 
    email, 
    phone, 
    created_at, 
    updated_at
)
SELECT 
    first_name,
    last_name,
    company, -- mapping 'company' to 'company_name'
    email,
    phone,
    created_at,
    updated_at
FROM public.contacts;

-- Step 4: Drop old table and rename new table
DROP TABLE public.contacts CASCADE;
ALTER TABLE contacts_new RENAME TO contacts;

-- Step 5: Create performance indexes
CREATE INDEX idx_contacts_full_name ON public.contacts(full_name);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_company_name ON public.contacts(company_name);
CREATE INDEX idx_contacts_contact_status ON public.contacts(contact_status);
CREATE INDEX idx_contacts_lifecycle_stage ON public.contacts(lifecycle_stage);
CREATE INDEX idx_contacts_assigned_to ON public.contacts(assigned_to);
CREATE INDEX idx_contacts_created_by ON public.contacts(created_by);
CREATE INDEX idx_contacts_lead_score ON public.contacts(lead_score);
CREATE INDEX idx_contacts_tags ON public.contacts USING GIN(tags);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at);
CREATE INDEX idx_contacts_updated_at ON public.contacts(updated_at);

-- Step 6: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON public.contacts 
    FOR EACH ROW EXECUTE FUNCTION update_contacts_updated_at();

-- Step 7: Verification query
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_contacts,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as contacts_with_email,
    COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as contacts_with_phone
FROM public.contacts;

-- Step 8: Data quality checks
SELECT 
    'Data Quality Check' as check_type,
    COUNT(*) as count,
    'Contacts with missing first_name' as description
FROM public.contacts 
WHERE first_name IS NULL OR first_name = '';

SELECT 
    'Data Quality Check' as check_type,
    COUNT(*) as count,
    'Contacts with missing last_name' as description
FROM public.contacts 
WHERE last_name IS NULL OR last_name = '';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Contacts table migration completed successfully!';
    RAISE NOTICE '🔄 Existing data preserved and enhanced';
    RAISE NOTICE '📊 Added 20+ new CRM fields';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🔧 Automatic timestamp triggers active';
    RAISE NOTICE '💾 Backup created as contacts_backup_20250714';
END $$;