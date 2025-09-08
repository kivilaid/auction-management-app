# Deployment Guide

## Quick Setup Instructions

### 1. Local Development Setup

The application is ready to run locally with mock data. To get started:

```bash
npm install
npm run dev
```

Navigate to http://localhost:3000 to see the application.

### 2. Convex Database Setup (Required for Full Functionality)

To enable real-time database features:

1. **Install Convex CLI** (if not already installed):
```bash
npm install -g convex
```

2. **Initialize Convex deployment**:
```bash
npx convex dev
```
Follow the prompts to:
- Create or select a Convex team
- Create a new project
- Choose a deployment name

3. **The system will automatically**:
- Generate proper API files
- Set up your database schema
- Update the `.env.local` file with your Convex URL

### 3. Production Deployment

#### Frontend (Vercel):
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variable: `NEXT_PUBLIC_CONVEX_URL` (from your Convex dashboard)
4. Deploy automatically

#### Backend (Convex Cloud):
```bash
npx convex deploy
```

## Current Status

✅ **Working Features (without Convex)**:
- Responsive UI with all pages
- Navigation between sections
- Form components and validation
- Mock data display
- Full TypeScript integration

✅ **Working Features (with Convex)**:
- Real-time database operations
- Add/edit/delete auction sheets
- Advanced search and filtering
- Sample data seeding
- Live data synchronization

## Architecture

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Convex (real-time database)
- **Schema**: Single-table design optimized for Japanese auction data
- **Styling**: Responsive mobile-first design

## Sample Data

Once Convex is connected, you can add sample data by:
1. Going to `/manage` page
2. Clicking "Add Sample Data" button
3. Or manually adding auction sheets via the form

## Support

For setup issues:
- Check Convex documentation: https://docs.convex.dev
- Verify all environment variables are set correctly
- Ensure you're using Node.js 18+