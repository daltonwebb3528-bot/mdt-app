# MDT System - Mobile Data Terminal

A police in-vehicle computer system for CAD calls, plate searches, person searches, and real-time alerts.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database/Auth:** Supabase
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Hosting:** Vercel

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up
3. Go to **Project Settings** > **API**
4. Copy the **Project URL** and **anon public** key

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Create a Test User

1. In Supabase, go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter an email and password (e.g., `test@example.com` / `password123`)
4. Make sure "Auto Confirm User" is checked

### 4. Deploy to Vercel

**Option A: Deploy via GitHub**
1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" and import your repository
4. Add the environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)
5. Click Deploy

**Option B: Deploy via CLI**
```bash
npm install -g vercel
vercel login
vercel
# Follow prompts, add env vars when asked
```

### 5. Configure Supabase Auth Redirect

After deploying, go to Supabase:
1. **Authentication** > **URL Configuration**
2. Add your Vercel URL to **Site URL**: `https://your-app.vercel.app`
3. Add to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- Real-time alert streaming (SSE)
- Plate/Person/Phone/Address searches
- CAD call details with AI analysis
- LPR alerts with vehicle info
- Incident linking
- Related searches panel
- Dark theme optimized for in-vehicle use

## Notes

- All search data is simulated/fake for demo purposes
- Alerts are generated randomly every 20-40 seconds
- Auth is required to access the app
