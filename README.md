# Job Search Dashboard 🎯

A comprehensive, full-stack job search tracking system built with Next.js, Supabase, and Tailwind CSS. Track applications, manage resumes, schedule interviews, and analyze your job search progress.

![Job Search Dashboard](https://img.shields.io/badge/Next.js-14-black) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue)

## ✨ Features

### MVP Features (Current)
- **Application Tracker**: Kanban-style board to track job applications through different stages
- **Job Cards**: Detailed cards with company, role, salary, location, priority, and status
- **Analytics Dashboard**: Real-time stats showing total applications, interview rates, and offer rates
- **User Authentication**: Secure authentication powered by Supabase
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Mode Support**: Built-in theme switching capability

### Core Capabilities
- 📊 Track unlimited job applications
- 🏷️ Tag and categorize applications
- 💰 Salary range tracking
- 📍 Location and work type (Remote/Hybrid/On-site)
- ⭐ Priority levels (A/B/C/Dream)
- 🔄 Status workflow (New → Submitted → Interviewing → Offer → Accepted/Rejected)
- 📝 Notes and job descriptions
- 🔗 Job posting URLs
- 📅 Application deadlines

### Coming Soon
- Resume/Document vault with version control
- Interview scheduler with Google Calendar integration
- Task management and action items
- Communication hub for tracking recruiter conversations
- Offer comparison tool
- Advanced analytics and reporting
- Table and calendar views
- Chrome extension for one-click job saving
- n8n, Slack, and Telegram integrations

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account (free tier works great)
- A Vercel account (for deployment)
- Git installed

## 🛠️ Setup Instructions

### 1. Clone or Download the Project

If you have the project files locally, navigate to the project directory:

```bash
cd job-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### A. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Job Dashboard
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is perfect to start
4. Click "Create new project" and wait for it to initialize (1-2 minutes)

#### B. Run the Database Schema

1. In your Supabase project, go to the **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste it into the SQL Editor
5. Click "Run" to execute the schema
6. You should see "Success. No rows returned" - this is good!

#### C. Get Your Supabase Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll need:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (the public API key)
   - **service_role** key (only if you need server-side operations)

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the login page!

### 6. Create Your Account

1. Click on the "Sign Up" tab
2. Enter your email and password (min 6 characters)
3. Check your email for the confirmation link
4. Click the confirmation link
5. You'll be redirected back to the app and automatically signed in

## 🌐 Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy: `Y`
   - Which scope: Choose your account
   - Link to existing project: `N`
   - Project name: `job-dashboard` (or your choice)
   - Directory: `./` (just press Enter)
   - Override settings: `N`

5. Add environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```
   
   When prompted, paste your values and select "Production" for each.

6. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/job-dashboard.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "Add New Project"

4. Import your GitHub repository

5. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

6. Add Environment Variables:
   - Click "Environment Variables"
   - Add each variable from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

7. Click "Deploy"

8. Wait for deployment (usually 1-2 minutes)

9. Once deployed, update your Supabase settings:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to "Site URL" and "Redirect URLs"

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.js` to customize the color scheme:

```js
theme: {
  extend: {
    colors: {
      primary: "your-color-here",
      // ... other colors
    }
  }
}
```

### Adding New Features

The codebase is structured for easy extension:

```
/components
  - JobCard.tsx (individual job cards)
  - AddJobDialog.tsx (add/edit form)
  - BoardView.tsx (Kanban board)
  - StatsCards.tsx (analytics)
  
/lib
  - supabase.ts (database client)
  - store.ts (state management)
  - utils.ts (helper functions)

/app
  - page.tsx (main page)
  - layout.tsx (root layout)
```

## 📊 Database Schema

The database includes these main tables:
- **applications**: Core job application data
- **resumes**: Resume/document management
- **interviews**: Interview scheduling and tracking
- **tasks**: Action items and follow-ups
- **offers**: Offer details and comparison
- **communications**: Recruiter interaction logs

All tables have Row Level Security (RLS) enabled for data privacy.

## 🔐 Security Features

- Row Level Security (RLS) on all tables
- User authentication via Supabase Auth
- Email verification required
- Secure password requirements (6+ characters)
- Environment variables for sensitive data
- No API keys exposed to client

## 🧪 Testing Your Deployment

After deployment:

1. Visit your Vercel URL
2. Create a new account
3. Verify your email
4. Add a test application:
   - Company: "Test Company"
   - Role: "Software Engineer"
   - Status: "New"
5. Verify the application appears on your board
6. Try editing and deleting the application
7. Check the analytics update correctly

## 🐛 Troubleshooting

### "Invalid API key" error
- Double-check your Supabase URL and anon key in environment variables
- Make sure you copied the entire key (they're very long)
- Verify environment variables are set in Vercel dashboard

### "Schema not found" error
- Re-run the database schema in Supabase SQL Editor
- Check that all tables were created successfully

### Email confirmation not received
- Check your spam folder
- Verify email settings in Supabase → Authentication → Email Templates
- For development, you can disable email confirmation in Supabase → Authentication → Providers → Email

### Build fails on Vercel
- Check build logs for specific errors
- Verify all dependencies are in package.json
- Make sure TypeScript has no errors: `npm run build` locally

## 🔄 Updating Your Deployment

To update your deployed app:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically rebuild and deploy your changes!

## 📝 Usage Tips

1. **Priority Levels**: Use A for must-apply jobs, B for good fits, C for backups, Dream for dream roles
2. **Tags**: Tag applications with skills, locations, or any custom categories
3. **Deadlines**: Always set deadlines to stay organized
4. **Status Updates**: Keep statuses current for accurate analytics
5. **Notes**: Use the notes field for interview prep, company research, or follow-up reminders

## 🚧 Roadmap

- [ ] Table view with sorting and filtering
- [ ] Calendar view for interviews and deadlines
- [ ] Resume vault with version control
- [ ] Google Calendar integration
- [ ] Task management system
- [ ] Communication hub
- [ ] Offer comparison tool
- [ ] Chrome extension for job scraping
- [ ] n8n workflow automation
- [ ] Slack/Telegram notifications
- [ ] Advanced analytics and reporting
- [ ] Export to CSV/PDF
- [ ] Dark mode toggle UI
- [ ] Mobile app (React Native)

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your needs!

## 📄 License

MIT License - feel free to use this project for your job search!

## 💡 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase logs in your project dashboard
3. Check Vercel deployment logs
4. Verify all environment variables are set correctly

## 🎉 Success!

You now have a fully functional job search dashboard! Start tracking your applications and land that dream job! 🚀

---

**Built with ❤️ for job seekers everywhere**
