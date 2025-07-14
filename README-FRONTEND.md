# CRM Frontend Application

This is a complete React-based CRM application built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase MCP server running on port 3030

### Starting the Application

1. **Start the MCP Server** (if not already running):
   ```bash
   node mcp-server.js
   ```

2. **Start the Frontend Application**:
   ```bash
   npm run dev
   ```
   
   Or use the convenient batch file:
   ```bash
   start-crm.bat
   ```

3. **Open your browser** to `http://localhost:3000`

## 📱 Features

### ✅ Core CRM Functionality
- **Dashboard** - Overview with stats and charts
- **Contacts Management** - Create, read, update, delete contacts
- **Task Management** - Track tasks with priorities and due dates
- **Activity Tracking** - Log calls, emails, meetings, and notes
- **Real-time Data** - Connected to Supabase via MCP server

### ✅ Technical Features
- **React Query** - Smart data fetching and caching
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Beautiful, responsive UI
- **Next.js 14** - Modern React framework
- **Form Validation** - React Hook Form integration
- **Error Handling** - Graceful error states
- **Loading States** - Smooth user experience
- **Real-time Health Monitoring** - MCP server status

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form
- **Icons**: Heroicons
- **Charts**: Recharts

### Backend Integration
- **MCP Client**: Custom API client for Supabase MCP server
- **Data Layer**: React Query hooks for CRUD operations
- **Real-time Updates**: Automatic cache invalidation
- **Error Boundaries**: Graceful error handling

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── contacts/          # Contacts page
│   ├── tasks/             # Tasks page
│   ├── activities/        # Activities page
│   ├── layout.tsx         # Root layout with React Query
│   └── page.tsx           # Dashboard page
├── components/            # React components
│   ├── contacts/          # Contact management components
│   ├── tasks/             # Task management components
│   ├── activities/        # Activity management components
│   └── dashboard/         # Dashboard components
└── lib/                   # Utilities and services
    ├── mcpClient.ts       # MCP server API client
    ├── dataService.ts     # React Query hooks
    └── mockData.ts        # Mock data for fallback
```

## 🔌 API Integration

The application connects to your Supabase database through the MCP server:

- **Contacts API**: Full CRUD operations
- **Tasks API**: Task management with priorities
- **Activities API**: Activity logging and tracking
- **Health Check**: Real-time server monitoring

## 🎨 UI Components

### Pages
- ✅ Dashboard with real-time stats
- ✅ Contacts list and form
- ✅ Tasks list and form  
- ✅ Activities list and form

### Components
- ✅ Responsive sidebar navigation
- ✅ Modal forms for data entry
- ✅ Data tables with actions
- ✅ Status indicators and badges
- ✅ Loading and error states

## 🚀 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables
The application automatically connects to `localhost:3030` for the MCP server.

## 🔧 Configuration

### React Query Setup
- Automatic retries and error handling
- 5-minute cache time for data freshness
- Background refetching disabled
- Dev tools enabled in development

### Tailwind CSS
- Custom color scheme
- Responsive design utilities
- Component-friendly classes
- Dark mode ready

## 📊 Data Flow

1. **User Interaction** → Component
2. **Component** → React Query Hook  
3. **Hook** → MCP Client
4. **MCP Client** → Supabase MCP Server
5. **Server** → Supabase Database
6. **Response** → Cache → UI Update

## 🛠️ Troubleshooting

### Common Issues

1. **MCP Server Not Running**
   - Check if the server is running on port 3030
   - Look for the green connection status on dashboard

2. **Dependencies Issues**
   - Run `npm install` to ensure all packages are installed
   - Check Node.js version (requires 18+)

3. **Build Errors**
   - Check TypeScript errors with `npm run lint`
   - Ensure all imports are correct

### Health Check
The dashboard shows real-time connection status to the MCP server. If you see a red indicator, ensure:
- The MCP server is running (`node mcp-server.js`)
- Port 3030 is available
- No firewall blocking the connection

## 🎯 Next Steps

The frontend is fully functional and ready for:
- ✅ Creating and managing contacts
- ✅ Tracking tasks and activities
- ✅ Viewing dashboard analytics
- ✅ Real-time data synchronization

Your CRM application is now complete and ready to use!