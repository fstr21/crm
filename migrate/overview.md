# 📘 PROJECT_OVERVIEW.md - Complete CRM Vision & Architecture

## 🎯 Project Vision

### What We're Building
**NovaCRM** - A modern, modular Customer Relationship Management platform that adapts to any business size or type through intelligent feature organization, not paywalls.

### Core Philosophy
> "Every business is unique. Your CRM should be too."

Instead of forcing users into rigid plans or feature tiers, NovaCRM provides **all features to all users**, intelligently showing only what's relevant to their business type.

### Target Market
- **Freelancers**: Simple contact and task management
- **Small Businesses**: Sales pipeline and invoicing
- **Agencies**: Project management and team collaboration
- **E-commerce**: Order tracking and customer support
- **Enterprises**: Full suite with advanced analytics

### Key Differentiators
1. **No Feature Paywalls**: One price, all features
2. **Smart Defaults**: Onboarding tailors the experience
3. **True Modularity**: Enable/disable any feature
4. **Modern Stack**: Fast, secure, scalable
5. **AI-Powered**: Intelligent automation throughout

---

## 🧩 Modular Architecture Explained

### How It Works

```
┌─────────────────────────────────────────────────────┐
│                  User Onboarding                     │
│  "I'm a [Freelancer/Agency/Sales Team/etc.]"       │
└─────────────────────┬───────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│              Smart Module Configuration              │
│  ✅ Contacts  ✅ Tasks  ❌ Sales  ❌ Inventory      │
└─────────────────────┬───────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│               Tailored Dashboard                     │
│  Shows only relevant features and metrics           │
└─────────────────────────────────────────────────────┘
```

### Module Categories

#### 1. **Core Modules** (Always Enabled)
- **Contacts**: Foundation of any CRM
- **Dashboard**: Central command center
- **Settings**: User preferences and configuration

#### 2. **Business Modules** (Context-Aware)
```typescript
interface Module {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  visibleFor: BusinessType[];
  dependencies?: string[];
}

// Example: Sales module
{
  id: 'sales',
  name: 'Sales Pipeline',
  description: 'Lead tracking, deals, and forecasting',
  enabled: false,
  visibleFor: ['sales_team', 'consultant', 'agency'],
  dependencies: ['contacts']
}
```

#### 3. **Feature Modules** (User Choice)
Users can manually enable ANY module in Settings → Modules, regardless of their business type.

### Smart Defaults by Business Type

| Business Type | Default Enabled Modules |
|--------------|------------------------|
| **Freelancer** | Contacts, Tasks, Calendar, Time Tracking, Invoicing |
| **Sales Team** | Contacts, Leads, Sales Pipeline, Email Sequences, Reports |
| **Agency** | Contacts, Projects, Tasks, Team, Time Tracking, Client Portal |
| **E-commerce** | Contacts, Orders, Inventory, Support Tickets, Analytics |
| **Nonprofit** | Contacts, Donors, Campaigns, Volunteers, Events |
| **Consultant** | Contacts, Projects, Calendar, Proposals, Billing |

---

## 📋 Complete Feature Roadmap

### Phase 1: Foundation (Weeks 1-4) 🏗️

#### Core Infrastructure
- [x] Next.js + Supabase setup
- [x] Local development environment
- [x] Supabase database migrations
- [ ] Module registry system
- [ ] Feature flag infrastructure
- [ ] User preferences storage

#### Essential Features
- [ ] **Authentication System**
  - [ ] Email/password login
  - [ ] OAuth (Google, Microsoft)
  - [ ] Multi-factor authentication
  - [ ] Role-based permissions

- [ ] **Contact Management**
  - [ ] CRUD operations
  - [ ] Custom fields
  - [ ] Tags and segments
  - [ ] Import/export (CSV, Excel)
  - [ ] Duplicate detection

- [ ] **Dashboard Framework**
  - [ ] Widget system
  - [ ] Customizable layout
  - [ ] Real-time updates
  - [ ] Quick actions

### Phase 2: Core CRM (Weeks 5-8) 💼

#### Task Management Module
```
src/modules/tasks/
├── components/
│   ├── TaskBoard.tsx      # Kanban view
│   ├── TaskList.tsx       # List view
│   ├── TaskDetail.tsx     # Detail modal
│   └── TaskFilters.tsx    # Advanced filtering
├── hooks/
│   └── useTasks.ts
├── api/
│   └── tasks.ts
└── types/
    └── task.types.ts
```

Features:
- [ ] Task CRUD with rich text
- [ ] Kanban board view
- [ ] Priority and status
- [ ] Due dates and reminders
- [ ] Task dependencies
- [ ] Recurring tasks
- [ ] Time tracking

#### Communication Hub
- [ ] **Email Integration**
  - [ ] Gmail/Outlook sync
  - [ ] Email templates
  - [ ] Track opens/clicks
  - [ ] Email sequences

- [ ] **Calendar Module**
  - [ ] Google/Outlook sync
  - [ ] Appointment scheduling
  - [ ] Availability management
  - [ ] Meeting notes

### Phase 3: Business Modules (Weeks 9-12) 🚀

#### Sales Pipeline Module
```typescript
// Module definition
{
  id: 'sales',
  name: 'Sales Pipeline',
  icon: 'TrendingUp',
  enabled: false,
  permissions: ['sales:view', 'sales:manage'],
  routes: [
    '/pipeline',
    '/leads',
    '/forecasting'
  ],
  widgets: [
    'PipelineOverview',
    'RevenueChart',
    'LeadSources'
  ]
}
```

Features:
- [ ] Lead capture and scoring
- [ ] Deal stages (customizable)
- [ ] Pipeline visualization
- [ ] Revenue forecasting
- [ ] Win/loss analysis
- [ ] Commission tracking

#### Project Management Module
- [ ] Project templates
- [ ] Milestones and phases
- [ ] Resource allocation
- [ ] Gantt charts
- [ ] Time and budget tracking
- [ ] Client portal access

#### Billing & Invoicing Module
- [ ] Invoice generation
- [ ] Payment processing (Stripe)
- [ ] Recurring billing
- [ ] Expense tracking
- [ ] Financial reports
- [ ] Multi-currency support

### Phase 4: Advanced Features (Weeks 13-16) 🎯

#### Analytics & Reporting
- [ ] Custom report builder
- [ ] Scheduled reports
- [ ] Data visualization
- [ ] Export capabilities
- [ ] KPI tracking
- [ ] Predictive analytics

#### Automation Engine
- [ ] Workflow builder
- [ ] Trigger conditions
- [ ] Action library
- [ ] Email automation
- [ ] Task automation
- [ ] API webhooks

#### Team Collaboration
- [ ] Team chat
- [ ] @mentions
- [ ] Activity streams
- [ ] Document sharing
- [ ] Approval workflows
- [ ] Performance tracking

---

## 🏗️ Technical Architecture

### Supabase-First Architecture

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// src/lib/modules/registry.ts
export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  routes: RouteConfig[];
  components: ComponentMap;
  permissions: string[];
  settings?: SettingsSchema;
}

// src/lib/modules/loader.ts
export class ModuleLoader {
  private modules: Map<string, ModuleConfig>;
  
  async loadModule(moduleId: string) {
    const module = await import(`@/modules/${moduleId}`);
    this.registerRoutes(module.routes);
    this.registerComponents(module.components);
    this.registerPermissions(module.permissions);
  }
  
  async isModuleEnabled(moduleId: string, userId: string) {
    const { data } = await supabase
      .from('user_preferences')
      .select('modules')
      .eq('user_id', userId)
      .single();
      
    return data?.modules?.[moduleId]?.enabled ?? false;
  }
}
```

### Database Schema Structure

```sql
-- Module preferences per user (Supabase)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id),
  business_type business_type_enum,
  modules JSONB DEFAULT '{}', -- { "sales": { "enabled": true, "settings": {} } }
  theme VARCHAR(50) DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags for gradual rollout (Supabase)
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0,
  target_users UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE business_type_enum AS ENUM (
  'FREELANCER',
  'SMALL_BUSINESS',
  'AGENCY',
  'SALES_TEAM',
  'ECOMMERCE',
  'NONPROFIT',
  'CONSULTANT',
  'ENTERPRISE',
  'CUSTOM'
);
```

### Component Architecture

```
src/
├── components/
│   ├── ui/                 # Base components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── dialog.tsx
│   ├── common/            # Shared components
│   │   ├── Layout.tsx
│   │   ├── Navigation.tsx
│   │   └── ModuleWrapper.tsx
│   └── widgets/           # Dashboard widgets
│       ├── StatsCard.tsx
│       ├── ActivityFeed.tsx
│       └── QuickActions.tsx
├── modules/               # Feature modules
│   ├── core/             # Always loaded
│   ├── sales/            # Lazy loaded
│   ├── projects/         # Lazy loaded
│   └── billing/          # Lazy loaded
├── hooks/
│   ├── useModule.ts      # Module loading hook
│   ├── usePermissions.ts # Permission checking
│   ├── usePreferences.ts # User preferences
│   └── useSupabase.ts    # Supabase integration
└── lib/
    ├── modules/          # Module system
    ├── permissions/      # RBAC system
    ├── supabase/         # Supabase client & utilities
    └── api/             # API utilities
```

---

## 🔌 API Design Specification

### Supabase API + Next.js API Routes

```
# Supabase Auto-Generated APIs
/rest/v1/
├── contacts           # Auto CRUD via Supabase
├── user_preferences   # Auto CRUD via Supabase
├── feature_flags      # Auto CRUD via Supabase
└── tasks              # Auto CRUD via Supabase

# Custom Next.js API Routes
/api/
├── auth/
│   ├── POST   /callback     # Supabase auth callback
│   ├── POST   /signout      # Custom signout logic
│   └── GET    /user         # Get current user
├── modules/
│   ├── GET    /             # List available modules
│   ├── GET    /:id          # Get module details
│   └── POST   /toggle       # Enable/disable module
├── contacts/
│   └── POST   /import       # CSV import (custom logic)
└── webhooks/
    └── POST   /supabase     # Supabase webhooks
```

### API Response Format

```typescript
// Supabase success response
{
  "data": [...],
  "error": null,
  "count": 156,
  "status": 200,
  "statusText": "OK"
}

// Supabase error response
{
  "data": null,
  "error": {
    "code": "PGRST116",
    "message": "Invalid email format",
    "details": "...",
    "hint": "..."
  },
  "count": null,
  "status": 400,
  "statusText": "Bad Request"
}

// Custom API wrapper for consistency
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

---

## 🧪 Testing Strategy

### Test Pyramid with Supabase

```
         /\
        /  \    E2E Tests (10%)
       /────\   - Critical user journeys
      /      \  - Cross-browser testing
     /────────\ Integration Tests (30%)
    /          \- Supabase API endpoints
   /────────────\- Module interactions
  /              \ Unit Tests (60%)
 /────────────────\- Components
/                  \- Utilities
```

### Testing Approach with Supabase

```typescript
// Module testing with Supabase
describe('Sales Module', () => {
  beforeEach(async () => {
    // Setup test database
    await supabase.from('users').delete().neq('id', 'keep-me');
    await supabase.from('user_preferences').delete().neq('id', 'keep-me');
  });
  
  it('should be disabled by default for freelancers', async () => {
    const { data: user } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpass'
    });
    
    await supabase.from('user_preferences').insert({
      user_id: user.user!.id,
      business_type: 'FREELANCER'
    });
    
    const isEnabled = await isModuleEnabled('sales', user.user!.id);
    expect(isEnabled).toBe(false);
  });
  
  it('should be enabled by default for sales teams', async () => {
    const { data: user } = await supabase.auth.signUp({
      email: 'sales@example.com',
      password: 'testpass'
    });
    
    await supabase.from('user_preferences').insert({
      user_id: user.user!.id,
      business_type: 'SALES_TEAM'
    });
    
    const isEnabled = await isModuleEnabled('sales', user.user!.id);
    expect(isEnabled).toBe(true);
  });
});
```

---

## 🚀 Deployment Strategy

### Supabase-Powered Environments

| Environment | Purpose | URL | Supabase Project | Branch |
|------------|---------|-----|------------------|--------|
| Development | Local development | localhost:3000 | Local Supabase | feature/* |
| Staging | Testing & QA | staging.novacrm.app | Supabase Staging | develop |
| Production | Live application | app.novacrm.app | Supabase Production | main |

### Feature Rollout with Supabase

```typescript
// Gradual feature rollout using Supabase
const getFeatureFlags = async (userId: string) => {
  const { data } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('enabled', true);
    
  return data?.reduce((acc, flag) => {
    const isTargeted = flag.target_users.includes(userId);
    const isInRollout = Math.random() * 100 < flag.rollout_percentage;
    
    acc[flag.name] = isTargeted || isInRollout;
    return acc;
  }, {});
};
```

---

## 💡 Future Considerations

### AI Integration
- Natural language commands
- Predictive analytics
- Smart data entry
- Automated insights
- Chatbot support

### Mobile Strategy
- Progressive Web App first
- Native apps later
- Offline capability
- Push notifications

### Enterprise Features
- SAML/SSO
- Audit logs
- Data residency
- SLA guarantees
- White labeling

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase CLI installed globally: `npm install -g supabase`
- Git for version control

### Environment Setup

```bash
# Clone repository
git clone https://github.com/yourusername/novacrm.git
cd novacrm

# Install dependencies
npm install

# Start local Supabase
supabase start

# Run database migrations
supabase db reset

# Start development server
npm run dev
```

### Local Supabase Configuration

```typescript
// .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key

// Development URLs
Supabase Studio: http://localhost:54323
Database: postgresql://postgres:postgres@localhost:54322/postgres
REST API: http://localhost:54321/rest/v1/
Auth: http://localhost:54321/auth/v1/
```

### MCP Server Setup (Local)

```json
// .mcp.json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": ["./mcp-servers/supabase-server.js"],
      "env": {
        "SUPABASE_URL": "http://localhost:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "your_local_service_role_key"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\Users\\fstr2\\Desktop\\crm"]
    }
  }
}
```

---

## 📚 Development Standards

### Code Style with Supabase
```typescript
// ✅ Good: Clear, typed, Supabase-integrated
export async function createContact(
  data: CreateContactDto,
  userId: string
): Promise<Contact> {
  // Validate permissions with Supabase RLS
  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({ ...data, user_id: userId })
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  
  // Create activity log
  await supabase.from('activities').insert({
    user_id: userId,
    action: 'contact.created',
    entity_id: contact.id,
    entity_type: 'contact'
  });
  
  return contact;
}

// ❌ Bad: No types, no validation, no activity logging
export async function createContact(data) {
  return supabase.from('contacts').insert(data);
}
```

### Git Workflow with Supabase
```
main ─────────────────────────► Production (Supabase Prod)
  │
  └── develop ──────────────► Staging (Supabase Staging)
        │
        ├── feature/sales-pipeline (Local Supabase)
        ├── feature/email-integration (Local Supabase)
        └── fix/auth-timeout (Local Supabase)
```

### Database Migration Workflow
```bash
# Create new migration
supabase migration new add_sales_pipeline

# Apply migrations locally
supabase db reset

# Deploy to staging
supabase db push --project-ref staging-project-id

# Deploy to production
supabase db push --project-ref production-project-id
```

### Commit Standards
```
feat(sales): add pipeline drag-and-drop
fix(auth): resolve Supabase token refresh race condition
docs(api): update Supabase contact endpoints
refactor(modules): simplify loader logic
test(billing): add invoice generation tests
migration(db): add user_preferences table
```

### Database Version Control
```bash
# Create migration
supabase migration new migration_name

# Apply locally
supabase db reset

# Commit migration files
git add supabase/migrations/
git commit -m "migration(db): add user_preferences table"

# Deploy to staging/production
supabase db push --project-ref project-id
```

---

## 🎯 Success Metrics

### Technical KPIs
- Page load < 2 seconds
- API response < 200ms
- 99.9% uptime
- Zero security breaches
- 90%+ test coverage

### Business KPIs
- User activation rate > 80%
- Feature adoption > 60%
- Monthly active users growth
- Customer satisfaction > 4.5/5
- Churn rate < 5%

---

## 🚀 Production Deployment with Supabase

### Deployment Pipeline
```
Local Development → Staging → Production
     │              │         │
 Local Supabase   Supabase    Supabase
   (localhost)    Staging     Production
```

### Environment Configuration
```bash
# Staging deployment
supabase link --project-ref staging-project-id
supabase db push
vercel deploy --env staging

# Production deployment
supabase link --project-ref production-project-id
supabase db push
vercel deploy --prod
```

### Supabase Project Setup
```typescript
// Production environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

// Enable required features
- Row Level Security (RLS)
- Real-time subscriptions
- Email authentication
- Storage for file uploads
```

---

## 🤝 Team Collaboration

### Roles
- **Frontend**: React, TypeScript, Module UI
- **Backend**: Supabase, API Routes, Authentication
- **DevOps**: Vercel, Supabase, CI/CD, Monitoring
- **QA**: Testing, Automation, Quality
- **Product**: Features, UX, Analytics

### Communication
- Daily standups
- Weekly planning
- Bi-weekly demos
- Monthly retrospectives

---

**This is NovaCRM - Where every business gets enterprise features without enterprise pricing.**