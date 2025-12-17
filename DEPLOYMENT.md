# Quick Deployment Guide 🚀

This guide will get your Job Search Dashboard deployed to Vercel in under 10 minutes.

## Prerequisites
- A Supabase account (free)
- A Vercel account (free)
- Git installed
- Node.js 18+ installed

## Step 1: Set Up Supabase (3 minutes)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name: `job-dashboard`
   - Set a database password (save it!)
   - Choose your region
   - Click "Create new project"

2. **Run Database Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Click "New Query"
   - Copy/paste the entire `supabase/schema.sql` file
   - Click "Run"
   - Wait for "Success" message

3. **Get Your API Keys**
   - Go to Settings → API
   - Copy:
     - Project URL
     - anon public key
     - service_role key

## Step 2: Deploy to Vercel (5 minutes)

### Option A: Quick Deploy Button (Easiest)

1. Click this button:
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GITHUB_URL)

2. Connect your GitHub account

3. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. Click "Deploy"

### Option B: Manual Deploy

1. **Push to GitHub**
   ```bash
   cd job-dashboard
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/job-dashboard.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add environment variables (see above)
   - Click "Deploy"

3. **Wait for Build** (1-2 minutes)

## Step 3: Configure Supabase Auth (1 minute)

1. Go to Supabase Dashboard → Authentication → URL Configuration

2. Add your Vercel URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: 
     - `https://your-app.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for local dev)

## Step 4: Test Your App (1 minute)

1. Visit your Vercel URL
2. Click "Sign Up"
3. Enter email and password
4. Check your email for confirmation
5. Click confirmation link
6. Start adding job applications!

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify Supabase URL and keys have no extra spaces
- Check Vercel build logs for specific errors

### Can't Sign In
- Verify email confirmation was clicked
- Check Supabase Auth settings
- Try password reset if needed

### Database Errors
- Re-run the schema.sql in Supabase
- Check that all tables were created
- Verify RLS policies are enabled

## Environment Variables Reference

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Optional (auto-set by Vercel)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## What's Included in MVP

✅ Job application tracking
✅ Kanban board view
✅ Analytics dashboard
✅ User authentication
✅ Priority and status management
✅ Tags and categorization
✅ Salary tracking
✅ Application deadlines
✅ Notes and job descriptions
✅ Responsive design

## Next Steps

1. **Customize**: Edit colors in `tailwind.config.js`
2. **Add Features**: Check the main README for roadmap
3. **Share**: Invite team members or keep it private
4. **Backup**: Export data regularly (coming soon)

## Support

- 📖 Full documentation: See README.md
- 🐛 Issues: Check Vercel and Supabase logs
- 💡 Ideas: Fork and customize!

---

**Total Setup Time**: ~10 minutes

**You're all set!** 🎉 Start tracking your job search and land that dream role!
