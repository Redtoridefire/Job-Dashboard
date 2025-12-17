# Setup Checklist ✅

Use this checklist to ensure you've completed all setup steps.

## 🎯 Pre-Deployment

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Supabase account created
- [ ] Vercel account created

## 📦 Local Setup

- [ ] Downloaded/cloned project files
- [ ] Navigated to project directory (`cd job-dashboard`)
- [ ] Ran `npm install`
- [ ] Created `.env.local` file
- [ ] Tested local dev server (`npm run dev`)

## 🗄️ Supabase Configuration

- [ ] Created new Supabase project
- [ ] Noted database password
- [ ] Ran `schema.sql` in SQL Editor
- [ ] Verified all tables created successfully
- [ ] Copied Project URL
- [ ] Copied anon public key
- [ ] Copied service_role key
- [ ] Added environment variables to `.env.local`

## 🚀 Vercel Deployment

### If Using Vercel CLI:
- [ ] Installed Vercel CLI (`npm install -g vercel`)
- [ ] Logged in (`vercel login`)
- [ ] Deployed (`vercel`)
- [ ] Added environment variables
- [ ] Deployed to production (`vercel --prod`)

### If Using Vercel Dashboard:
- [ ] Pushed code to GitHub
- [ ] Connected GitHub repo to Vercel
- [ ] Added environment variables in Vercel dashboard
- [ ] Clicked "Deploy"
- [ ] Deployment successful

## ⚙️ Post-Deployment

- [ ] Updated Supabase Auth URLs:
  - [ ] Site URL set to Vercel URL
  - [ ] Redirect URLs include `/auth/callback`
- [ ] Tested signup flow
- [ ] Verified email confirmation
- [ ] Tested login
- [ ] Created test application
- [ ] Verified application shows on board
- [ ] Tested edit functionality
- [ ] Tested delete functionality
- [ ] Checked analytics update

## 🔐 Security Verification

- [ ] Environment variables not committed to Git
- [ ] `.env.local` in `.gitignore`
- [ ] RLS policies enabled on all tables
- [ ] Email verification working
- [ ] Password requirements enforced (6+ chars)

## 🎨 Optional Customization

- [ ] Updated app colors in `tailwind.config.js`
- [ ] Customized metadata in `app/layout.tsx`
- [ ] Added custom favicon
- [ ] Updated README with your info

## 📊 Testing

- [ ] Can create new applications
- [ ] Can edit existing applications
- [ ] Can delete applications
- [ ] Can change application status
- [ ] Analytics show correct numbers
- [ ] Tags work correctly
- [ ] Salary tracking works
- [ ] Deadlines save correctly
- [ ] Notes persist
- [ ] URLs open correctly

## 🐛 Troubleshooting Done

If you had issues, mark what you fixed:
- [ ] Fixed API key errors
- [ ] Resolved database schema issues
- [ ] Fixed build errors
- [ ] Resolved authentication issues
- [ ] Fixed environment variable issues

## ✨ You're Done!

Once all boxes are checked, you're ready to start tracking your job search!

## 📝 Notes Section

Use this space for any custom configurations or notes:

```
Your custom notes here...
```

## 🎉 Next Steps

1. Add your first real job applications
2. Set up tags that make sense for your search
3. Customize priorities for your needs
4. Keep statuses updated for accurate analytics
5. Consider future features you want to add

---

**Last Updated**: Initial Setup
**Status**: ✅ Complete / ⏳ In Progress
