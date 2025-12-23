-- Migration: Add user_integrations table
-- Run this SQL in your Supabase SQL Editor if you have an existing database

-- Create user_integrations table for OAuth tokens and settings
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_calendar', 'telegram')),
  access_token TEXT,  -- Encrypted at application level (AES-256-GCM)
  refresh_token TEXT, -- Encrypted at application level (AES-256-GCM)
  expires_at TIMESTAMPTZ,
  connected BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure one integration per provider per user
  UNIQUE(user_id, provider)
);

-- Create indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_provider ON user_integrations(provider);

-- Add trigger for updated_at (uses existing function from schema)
DROP TRIGGER IF EXISTS update_user_integrations_updated_at ON user_integrations;
CREATE TRIGGER update_user_integrations_updated_at BEFORE UPDATE ON user_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own integrations" ON user_integrations;
DROP POLICY IF EXISTS "Users can insert their own integrations" ON user_integrations;
DROP POLICY IF EXISTS "Users can update their own integrations" ON user_integrations;
DROP POLICY IF EXISTS "Users can delete their own integrations" ON user_integrations;

-- RLS policies - users can only access their own integrations
CREATE POLICY "Users can view their own integrations" ON user_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations" ON user_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" ON user_integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" ON user_integrations
  FOR DELETE USING (auth.uid() = user_id);
