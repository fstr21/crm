-- Create a simple test table for MCP testing
CREATE TABLE IF NOT EXISTS mcp_test (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create basic CRM tables for testing
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  company TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'TODO',
  priority TEXT DEFAULT 'MEDIUM',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert some sample data for testing
INSERT INTO mcp_test (name, email) VALUES 
('Test User 1', 'test1@example.com'),
('Test User 2', 'test2@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO contacts (email, first_name, last_name, company) VALUES 
('john.doe@company.com', 'John', 'Doe', 'Test Company'),
('jane.smith@startup.io', 'Jane', 'Smith', 'Startup Inc')
ON CONFLICT (email) DO NOTHING;