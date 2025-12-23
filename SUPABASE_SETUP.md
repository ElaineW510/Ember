# Supabase Setup Guide

This guide will help you set up Supabase for authentication and data persistence in Ember.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Name: `ember` (or your preferred name)
   - Database Password: Choose a strong password (save it!)
   - Region: Choose the closest region to you
4. Wait for the project to be created (takes ~2 minutes)

## 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Find the following values:
   - **Project URL** (this is your `VITE_SUPABASE_URL`)
   - **anon/public key** (this is your `VITE_SUPABASE_ANON_KEY`)

## 3. Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/001_create_journal_entries.sql`
4. Click "Run" to execute the migration
5. Verify the table was created by going to **Table Editor** → you should see `journal_entries`

## 4. Configure Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following variables:

```env
# Gemini API Key (existing)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration (new)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace:
- `your-project-id` with your actual Supabase project ID
- `your_anon_key_here` with your actual anon key from step 2

## 5. Install Dependencies

Run the following command to install the Supabase client library:

```bash
npm install
```

## 6. Test the Setup

1. Start the development server: `npm run dev`
2. You should see a login screen
3. Create a new account with an email and password
4. After signing up, you should be redirected to the home page
5. Try creating a journal entry to verify data persistence

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure your `.env.local` file exists and contains both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your development server after adding environment variables
- Make sure the variable names start with `VITE_` (required for Vite)

### Database errors
- Make sure you ran the SQL migration in the Supabase SQL Editor
- Check that Row Level Security (RLS) is enabled on the `journal_entries` table
- Verify the table structure matches the migration file

### Authentication not working
- Check that email authentication is enabled in Supabase (Settings → Authentication → Providers)
- Verify your Supabase URL and anon key are correct
- Check the browser console for detailed error messages

### Email Verification Setup
1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Under **Email Auth**, make sure:
   - **Enable email confirmations** is **ON** (required for email verification flow)
   - **Secure email change** is enabled (recommended)
3. Under **Email Templates**, customize the **Confirm signup** template:
   - Update the email subject and body to match Ember's brand
   - The verification link will automatically redirect to your app
   - Make sure the redirect URL matches your app's domain
4. The verification email will be sent automatically when users sign up
5. Users must click the verification link in their email before they can access the app

## Security Notes

- The `anon` key is safe to use in client-side code (it's public)
- Row Level Security (RLS) policies ensure users can only access their own data
- Never commit your `.env.local` file to version control

