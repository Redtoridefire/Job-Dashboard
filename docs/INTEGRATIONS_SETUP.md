# Integrations Setup Guide

This guide walks you through setting up Google Calendar and Telegram integrations for the Job Dashboard. Once configured, your users can connect their accounts with just a few clicks.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Google Calendar Setup](#google-calendar-setup)
4. [Telegram Bot Setup](#telegram-bot-setup)
5. [Environment Variables](#environment-variables)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A Supabase project (for database and authentication)
- A Google Cloud account (free)
- A Telegram account (free)
- Your app deployed (or running locally for testing)

---

## Database Setup

### Option A: New Database
If setting up a fresh database, the `user_integrations` table is already included in `supabase/schema.sql`.

### Option B: Existing Database
Run the migration to add the integrations table:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_add_user_integrations.sql`
4. Click **Run**

This creates the `user_integrations` table with:
- Encrypted token storage
- Row Level Security (users can only access their own data)
- Automatic `updated_at` timestamps

---

## Google Calendar Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top → **New Project**
3. Name it (e.g., "Job Dashboard") → **Create**
4. Make sure your new project is selected

### Step 2: Enable the Calendar API

1. Go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click on it → **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** → **Create**
3. Fill in the required fields:
   - **App name**: Job Dashboard
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **Save and Continue**

5. **Scopes** page:
   - Click **Add or Remove Scopes**
   - Search for `calendar.events`
   - Check `https://www.googleapis.com/auth/calendar.events`
   - Click **Update** → **Save and Continue**

6. **Test users** page:
   - Add your email and any testers
   - Click **Save and Continue**

7. **Summary** → **Back to Dashboard**

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name it (e.g., "Job Dashboard Web")
5. Add **Authorized redirect URIs**:
   - For production: `https://your-domain.com/api/auth/google/callback`
   - For local dev: `http://localhost:3000/api/auth/google/callback`
6. Click **Create**
7. **Copy the Client ID and Client Secret** - you'll need these!

### Step 5: Publish Your App (For Production)

While in "Testing" mode, only test users can connect. To allow anyone:

1. Go to **OAuth consent screen**
2. Click **Publish App**
3. Complete verification if required (Google may review your app)

> **Note**: For testing with friends, you can add them as test users instead of publishing.

---

## Telegram Bot Setup

### Step 1: Create Your Bot

1. Open Telegram and search for `@BotFather`
2. Start a chat and send: `/newbot`
3. Follow the prompts:
   - **Name**: Job Dashboard Notifications
   - **Username**: Must end in `bot` (e.g., `YourJobDashboardBot`)
4. BotFather will give you a **token** like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
5. **Save this token** - this is your `TELEGRAM_BOT_TOKEN`

### Step 2: Configure Your Bot

Send these commands to `@BotFather`:

```
/setdescription
```
Then send:
```
Get notifications about your job applications, interviews, and deadlines from Job Dashboard.
```

```
/setabouttext
```
Then send:
```
I'll send you reminders for interviews and application deadlines. Connect me to your Job Dashboard account to get started!
```

### Step 3: Set Up Bot Commands (Optional but Nice)

Send to `@BotFather`:
```
/setcommands
```
Then send:
```
start - Get your Chat ID to connect to Job Dashboard
help - Get help with the bot
```

### Step 4: Create a Welcome Message Handler (Optional)

For a better user experience, you can set up a simple webhook or use a service like Cloudflare Workers to respond to `/start` with the user's Chat ID. For now, users can:

1. Message your bot
2. Go to `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
3. Find their `chat.id` in the response

Or use a bot like `@userinfobot` to get their Chat ID.

---

## Environment Variables

Add these to your deployment platform (Vercel, Netlify, etc.) or `.env.local` for development:

```bash
# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL (for OAuth redirects)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Encryption (generate a random 32+ character string)
ENCRYPTION_SECRET=your-super-secret-encryption-key-min-32-chars

# Google Calendar
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Generating ENCRYPTION_SECRET

Use this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or in Node.js:
```javascript
require('crypto').randomBytes(32).toString('base64')
```

---

## Testing

### Test Google Calendar Integration

1. Go to your app's Integrations panel
2. Click "Connect Google Calendar"
3. You should be redirected to Google's consent screen
4. Sign in and allow access
5. You should be redirected back with a success message
6. Create an interview - it should appear in your Google Calendar!

### Test Telegram Integration

1. Message your bot on Telegram
2. Get your Chat ID (send `/start` or check getUpdates)
3. Go to your app's Integrations panel
4. Enter your Chat ID and click "Connect"
5. You should receive a confirmation message in Telegram
6. Test by clicking "Send Test" in the settings

---

## Troubleshooting

### Google Calendar Issues

**"Access Denied" or "App not verified"**
- Add yourself as a test user in Google Cloud Console
- Or publish your app through the OAuth consent screen

**"Redirect URI mismatch"**
- Make sure your redirect URI in Google Cloud matches exactly:
  - `https://your-domain.com/api/auth/google/callback`
- Check for trailing slashes and http vs https

**"Invalid state" error**
- Make sure `ENCRYPTION_SECRET` is set
- The OAuth link may have expired (15 min timeout) - try again

### Telegram Issues

**"Chat not found"**
- User needs to message the bot first before connecting
- Make sure they sent at least one message to your bot

**"Bot was blocked"**
- User blocked the bot on Telegram
- They need to unblock and try again

**Invalid Chat ID**
- Chat ID should be a number (can be negative for groups)
- Make sure there are no spaces or extra characters

### General Issues

**"Service temporarily unavailable"**
- Check that all environment variables are set correctly
- Restart your deployment after adding env vars

**Tokens not saving**
- Run the database migration if you haven't already
- Check Supabase logs for any RLS policy issues

---

## User Experience

Once everything is set up, here's what your users see:

### Connecting Google Calendar
1. Click "Connect Google Calendar" in Integrations
2. Sign in to their Google account
3. Click "Allow" on the consent screen
4. Done! Interviews sync automatically

### Connecting Telegram
1. Open Telegram, search for your bot
2. Send `/start` to get their Chat ID
3. Paste Chat ID in the app
4. Click "Connect" - they receive a confirmation message
5. Done! They'll get notifications for interviews and deadlines

---

## Security Notes

- OAuth tokens are encrypted with AES-256-GCM before storage
- CSRF protection on all OAuth flows
- Rate limiting on Telegram verification (5 attempts/15 min)
- Users can only access their own integration data (RLS)
- Tokens are never logged or exposed to the client
