-- =====================================================
-- COMPREHENSIVE CRM DATABASE SCHEMA FOR SUPABASE
-- =====================================================
-- This schema provides a complete CRM solution with:
-- - User management and authentication
-- - Contact lifecycle management
-- - Task assignment and tracking
-- - Activity logging and history
-- - Proper relationships and indexes
-- - Sample data for testing
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USERS TABLE (extends auth.users)
-- =====================================================
-- User profiles extending Supabase auth.users
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    avatar_url TEXT,
    phone VARCHAR(20),
    job_title VARCHAR(100),
    department VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    is_active BOOLEAN DEFAULT TRUE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CONTACTS TABLE
-- =====================================================
-- Comprehensive contact management
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    company_name VARCHAR(200),
    job_title VARCHAR(100),
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    website VARCHAR(255),
    
    -- Address Information
    street_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    
    -- CRM Fields
    contact_status VARCHAR(50) DEFAULT 'active' CHECK (contact_status IN ('active', 'inactive', 'prospect', 'customer', 'churned')),
    lead_source VARCHAR(100),
    lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
    lifecycle_stage VARCHAR(50) DEFAULT 'lead' CHECK (lifecycle_stage IN ('lead', 'prospect', 'opportunity', 'customer', 'evangelist')),
    
    -- Relationship Management
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    tags TEXT[],
    notes TEXT,
    
    -- Social Media
    linkedin_url VARCHAR(255),
    twitter_handle VARCHAR(100),
    
    -- Business Information
    annual_revenue DECIMAL(15,2),
    employee_count INTEGER,
    industry VARCHAR(100),
    
    -- System Fields
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_email_per_company UNIQUE (email, company_name)
);

-- =====================================================
-- 3. TASKS TABLE
-- =====================================================
-- Task management and assignment
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Task Details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) DEFAULT 'general' CHECK (task_type IN ('call', 'email', 'meeting', 'follow_up', 'demo', 'proposal', 'general')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
    
    -- Assignment
    assigned_to UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Relationships
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    
    -- Scheduling
    due_date TIMESTAMPTZ,
    start_date TIMESTAMPTZ,
    estimated_duration INTEGER, -- in minutes
    
    -- Completion
    completed_at TIMESTAMPTZ,
    completion_notes TEXT,
    
    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_completion CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR 
        (status != 'completed' AND completed_at IS NULL)
    ),
    CONSTRAINT valid_dates CHECK (start_date <= due_date)
);

-- =====================================================
-- 4. ACTIVITIES TABLE
-- =====================================================
-- Activity and interaction tracking
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Activity Details
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'task', 'deal', 'document', 'system')),
    subject VARCHAR(200) NOT NULL,
    description TEXT,
    outcome VARCHAR(100),
    
    -- Relationships
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Activity Metadata
    activity_date TIMESTAMPTZ DEFAULT NOW(),
    duration INTEGER, -- in minutes
    location VARCHAR(200),
    
    -- Communication Details
    direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
    channel VARCHAR(50), -- email, phone, in-person, video, etc.
    
    -- File Attachments
    attachments JSONB DEFAULT '[]',
    
    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. CONTACT RELATIONSHIPS TABLE
-- =====================================================
-- Track relationships between contacts
CREATE TABLE public.contact_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    related_contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('colleague', 'manager', 'subordinate', 'partner', 'vendor', 'customer')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent self-relationships and duplicates
    CONSTRAINT no_self_relationship CHECK (contact_id != related_contact_id),
    CONSTRAINT unique_relationship UNIQUE (contact_id, related_contact_id, relationship_type)
);

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_active ON public.users(is_active);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Contacts indexes
CREATE INDEX idx_contacts_full_name ON public.contacts(full_name);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_company_name ON public.contacts(company_name);
CREATE INDEX idx_contacts_contact_status ON public.contacts(contact_status);
CREATE INDEX idx_contacts_lifecycle_stage ON public.contacts(lifecycle_stage);
CREATE INDEX idx_contacts_assigned_to ON public.contacts(assigned_to);
CREATE INDEX idx_contacts_created_by ON public.contacts(created_by);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at);
CREATE INDEX idx_contacts_updated_at ON public.contacts(updated_at);
CREATE INDEX idx_contacts_lead_score ON public.contacts(lead_score);
CREATE INDEX idx_contacts_tags ON public.contacts USING GIN(tags);

-- Tasks indexes
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_contact_id ON public.tasks(contact_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at);
CREATE INDEX idx_tasks_task_type ON public.tasks(task_type);
CREATE INDEX idx_tasks_assigned_to_status ON public.tasks(assigned_to, status);

-- Activities indexes
CREATE INDEX idx_activities_contact_id ON public.activities(contact_id);
CREATE INDEX idx_activities_created_by ON public.activities(created_by);
CREATE INDEX idx_activities_activity_type ON public.activities(activity_type);
CREATE INDEX idx_activities_activity_date ON public.activities(activity_date);
CREATE INDEX idx_activities_created_at ON public.activities(created_at);
CREATE INDEX idx_activities_task_id ON public.activities(task_id);

-- Contact relationships indexes
CREATE INDEX idx_contact_relationships_contact_id ON public.contact_relationships(contact_id);
CREATE INDEX idx_contact_relationships_related_contact_id ON public.contact_relationships(related_contact_id);
CREATE INDEX idx_contact_relationships_type ON public.contact_relationships(relationship_type);

-- =====================================================
-- 7. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON public.contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON public.tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at 
    BEFORE UPDATE ON public.activities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_relationships ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Contacts policies
CREATE POLICY "Users can view contacts they created or are assigned to" ON public.contacts
    FOR SELECT USING (
        created_by = auth.uid() OR 
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can insert contacts" ON public.contacts
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update contacts they created or are assigned to" ON public.contacts
    FOR UPDATE USING (
        created_by = auth.uid() OR 
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Tasks policies
CREATE POLICY "Users can view tasks assigned to them or tasks they created" ON public.tasks
    FOR SELECT USING (
        assigned_to = auth.uid() OR 
        assigned_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can insert tasks" ON public.tasks
    FOR INSERT WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Users can update tasks assigned to them or tasks they created" ON public.tasks
    FOR UPDATE USING (
        assigned_to = auth.uid() OR 
        assigned_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Activities policies
CREATE POLICY "Users can view activities they created or for contacts they can access" ON public.activities
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.contacts 
            WHERE id = activities.contact_id AND (
                created_by = auth.uid() OR 
                assigned_to = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() AND role IN ('admin', 'manager')
                )
            )
        )
    );

CREATE POLICY "Users can insert activities" ON public.activities
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update activities they created" ON public.activities
    FOR UPDATE USING (created_by = auth.uid());

-- Contact relationships policies
CREATE POLICY "Users can view contact relationships for contacts they can access" ON public.contact_relationships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contacts 
            WHERE id = contact_relationships.contact_id AND (
                created_by = auth.uid() OR 
                assigned_to = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() AND role IN ('admin', 'manager')
                )
            )
        )
    );

-- =====================================================
-- 9. USEFUL VIEWS
-- =====================================================

-- Contact summary view
CREATE VIEW public.contact_summary AS
SELECT 
    c.id,
    c.full_name,
    c.company_name,
    c.email,
    c.phone,
    c.contact_status,
    c.lifecycle_stage,
    c.lead_score,
    u.full_name as assigned_to_name,
    c.created_at,
    c.updated_at,
    (SELECT COUNT(*) FROM public.tasks WHERE contact_id = c.id AND status != 'completed') as open_tasks_count,
    (SELECT COUNT(*) FROM public.activities WHERE contact_id = c.id) as activities_count,
    (SELECT MAX(activity_date) FROM public.activities WHERE contact_id = c.id) as last_activity_date
FROM public.contacts c
LEFT JOIN public.users u ON c.assigned_to = u.id;

-- Task dashboard view
CREATE VIEW public.task_dashboard AS
SELECT 
    t.id,
    t.title,
    t.task_type,
    t.priority,
    t.status,
    t.due_date,
    c.full_name as contact_name,
    c.company_name,
    u.full_name as assigned_to_name,
    t.created_at,
    CASE 
        WHEN t.due_date < NOW() AND t.status NOT IN ('completed', 'cancelled') THEN 'overdue'
        WHEN t.due_date < NOW() + INTERVAL '24 hours' AND t.status NOT IN ('completed', 'cancelled') THEN 'due_soon'
        ELSE 'on_track'
    END as urgency_status
FROM public.tasks t
LEFT JOIN public.contacts c ON t.contact_id = c.id
LEFT JOIN public.users u ON t.assigned_to = u.id;

-- Activity timeline view
CREATE VIEW public.activity_timeline AS
SELECT 
    a.id,
    a.activity_type,
    a.subject,
    a.description,
    a.activity_date,
    a.duration,
    c.full_name as contact_name,
    c.company_name,
    u.full_name as created_by_name,
    a.created_at
FROM public.activities a
LEFT JOIN public.contacts c ON a.contact_id = c.id
LEFT JOIN public.users u ON a.created_by = u.id
ORDER BY a.activity_date DESC;

-- =====================================================
-- 10. FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to get contact stats
CREATE OR REPLACE FUNCTION get_contact_stats(contact_uuid UUID)
RETURNS TABLE(
    total_activities INTEGER,
    last_activity_date TIMESTAMPTZ,
    open_tasks INTEGER,
    completed_tasks INTEGER,
    lead_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM public.activities WHERE contact_id = contact_uuid),
        (SELECT MAX(activity_date) FROM public.activities WHERE contact_id = contact_uuid),
        (SELECT COUNT(*)::INTEGER FROM public.tasks WHERE contact_id = contact_uuid AND status != 'completed'),
        (SELECT COUNT(*)::INTEGER FROM public.tasks WHERE contact_id = contact_uuid AND status = 'completed'),
        (SELECT c.lead_score FROM public.contacts c WHERE c.id = contact_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to update lead score based on activities
CREATE OR REPLACE FUNCTION update_lead_score(contact_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    new_score INTEGER := 0;
    activity_count INTEGER;
    recent_activity_count INTEGER;
    completed_tasks INTEGER;
BEGIN
    -- Count total activities
    SELECT COUNT(*) INTO activity_count 
    FROM public.activities 
    WHERE contact_id = contact_uuid;
    
    -- Count recent activities (last 30 days)
    SELECT COUNT(*) INTO recent_activity_count 
    FROM public.activities 
    WHERE contact_id = contact_uuid 
    AND activity_date >= NOW() - INTERVAL '30 days';
    
    -- Count completed tasks
    SELECT COUNT(*) INTO completed_tasks 
    FROM public.tasks 
    WHERE contact_id = contact_uuid AND status = 'completed';
    
    -- Calculate score
    new_score := LEAST(100, 
        (activity_count * 5) + 
        (recent_activity_count * 10) + 
        (completed_tasks * 15)
    );
    
    -- Update the contact
    UPDATE public.contacts 
    SET lead_score = new_score 
    WHERE id = contact_uuid;
    
    RETURN new_score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample users (these will need to be created in Supabase Auth first)
-- Note: In a real application, these would be created through Supabase Auth
INSERT INTO public.users (id, email, first_name, last_name, job_title, department, role) VALUES
(uuid_generate_v4(), 'admin@company.com', 'John', 'Admin', 'CRM Administrator', 'IT', 'admin'),
(uuid_generate_v4(), 'manager@company.com', 'Jane', 'Manager', 'Sales Manager', 'Sales', 'manager'),
(uuid_generate_v4(), 'user1@company.com', 'Mike', 'Johnson', 'Sales Representative', 'Sales', 'user'),
(uuid_generate_v4(), 'user2@company.com', 'Sarah', 'Wilson', 'Account Executive', 'Sales', 'user');

-- Insert sample contacts
INSERT INTO public.contacts (first_name, last_name, company_name, email, phone, job_title, contact_status, lifecycle_stage, lead_source, assigned_to, created_by) VALUES
('Alice', 'Brown', 'Tech Solutions Inc', 'alice@techsolutions.com', '555-0101', 'CTO', 'active', 'customer', 'Website', 
    (SELECT id FROM public.users WHERE email = 'user1@company.com' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'user1@company.com' LIMIT 1)),
('Bob', 'Smith', 'Marketing Pro LLC', 'bob@marketingpro.com', '555-0102', 'Marketing Director', 'active', 'prospect', 'Referral',
    (SELECT id FROM public.users WHERE email = 'user2@company.com' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'user2@company.com' LIMIT 1)),
('Carol', 'Davis', 'StartupXYZ', 'carol@startupxyz.com', '555-0103', 'CEO', 'active', 'lead', 'Cold Outreach',
    (SELECT id FROM public.users WHERE email = 'user1@company.com' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'manager@company.com' LIMIT 1)),
('David', 'Lee', 'Enterprise Corp', 'david@enterprise.com', '555-0104', 'VP of Sales', 'active', 'opportunity', 'Trade Show',
    (SELECT id FROM public.users WHERE email = 'user2@company.com' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'user2@company.com' LIMIT 1)),
('Eva', 'Martinez', 'Global Systems', 'eva@globalsystems.com', '555-0105', 'IT Manager', 'prospect', 'prospect', 'LinkedIn',
    (SELECT id FROM public.users WHERE email = 'user1@company.com' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'user1@company.com' LIMIT 1));

-- Insert sample tasks
INSERT INTO public.tasks (title, description, task_type, priority, status, assigned_to, contact_id, due_date, assigned_by) VALUES
('Follow up on demo', 'Schedule follow-up call after product demo', 'follow_up', 'high', 'pending',
    (SELECT id FROM public.users WHERE email = 'user1@company.com' LIMIT 1),
    (SELECT id FROM public.contacts WHERE email = 'alice@techsolutions.com' LIMIT 1),
    NOW() + INTERVAL '2 days',
    (SELECT id FROM public.users WHERE email = 'manager@company.com' LIMIT 1)),
('Send proposal', 'Send detailed proposal with pricing', 'proposal', 'high', 'in_progress',
    (SELECT id FROM public.users WHERE email = 'user2@company.com' LIMIT 1),
    (SELECT id FROM public.contacts WHERE email = 'david@enterprise.com' LIMIT 1),
    NOW() + INTERVAL '3 days',
    (SELECT id FROM public.users WHERE email = 'user2@company.com' LIMIT 1)),
('Initial outreach call', 'Make first contact call to introduce our services', 'call', 'medium', 'pending',
    (SELECT id FROM public.users WHERE email = 'user1@company.com' LIMIT 1),
    (SELECT id FROM public.contacts WHERE email = 'carol@startupxyz.com' LIMIT 1),
    NOW() + INTERVAL '1 day',
    (SELECT id FROM public.users WHERE email = 'user1@company.com' LIMIT 1)),
('Email campaign follow-up', 'Follow up on email campaign response', 'email', 'low', 'completed',
    (SELECT id FROM public.users WHERE email = 'user2@company.com' LIMIT 1),
    (SELECT id FROM public.contacts WHERE email = 'bob@marketingpro.com' LIMIT 1),
    NOW() - INTERVAL '1 day',
    (SELECT id FROM public.users WHERE email = 'user2@company.com' LIMIT 1));

-- Insert sample activities
INSERT INTO public.activities (activity_type, subject, description, contact_id, created_by, activity_date, duration, direction, channel) VALUES
('call', 'Initial discovery call', 'Discussed current tech stack and pain points', 
    (SELECT id FROM public.contacts WHERE email = 'alice@techsolutions.com' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'user1@company.com' LIMIT 1),
    NOW() - INTERVAL '2 days', 45, 'outbound', 'phone'),
('email', 'Product information sent', 'Sent detailed product brochure and case studies',
    (SELECT id FROM public.contacts WHERE email = 'bob@marketingpro.com' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'user2@company.com' LIMIT 1),
    NOW() - INTERVAL '1 day', 15, 'outbound', 'email'),
('meeting', 'Product demo session', 'Conducted comprehensive product demonstration',
    (SELECT id FROM public.contacts WHERE email = 'david@enterprise.com' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'user2@company.com' LIMIT 1),
    NOW() - INTERVAL '3 days', 60, 'outbound', 'video'),
('note', 'LinkedIn connection', 'Connected on LinkedIn and sent personalized message',
    (SELECT id FROM public.contacts WHERE email = 'eva@globalsystems.com' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'user1@company.com' LIMIT 1),
    NOW() - INTERVAL '1 day', 10, 'outbound', 'social'),
('call', 'Pricing discussion', 'Discussed pricing options and contract terms',
    (SELECT id FROM public.contacts WHERE email = 'alice@techsolutions.com' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'user1@company.com' LIMIT 1),
    NOW() - INTERVAL '1 day', 30, 'outbound', 'phone');

-- Insert sample contact relationships
INSERT INTO public.contact_relationships (contact_id, related_contact_id, relationship_type, notes) VALUES
((SELECT id FROM public.contacts WHERE email = 'alice@techsolutions.com' LIMIT 1),
 (SELECT id FROM public.contacts WHERE email = 'bob@marketingpro.com' LIMIT 1),
 'partner', 'Both companies collaborate on marketing technology solutions'),
((SELECT id FROM public.contacts WHERE email = 'david@enterprise.com' LIMIT 1),
 (SELECT id FROM public.contacts WHERE email = 'eva@globalsystems.com' LIMIT 1),
 'colleague', 'Both work in similar roles at enterprise companies');

-- =====================================================
-- 12. COMPLETION MESSAGE
-- =====================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'CRM Database Schema Created Successfully!';
    RAISE NOTICE 'Tables created: users, contacts, tasks, activities, contact_relationships';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Row Level Security enabled with appropriate policies';
    RAISE NOTICE 'Sample data inserted for testing';
    RAISE NOTICE 'Views created: contact_summary, task_dashboard, activity_timeline';
    RAISE NOTICE 'Utility functions created for common operations';
END $$;