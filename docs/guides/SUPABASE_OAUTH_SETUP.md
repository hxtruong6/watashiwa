# Supabase Google OAuth Setup Guide

## Required Configuration Steps

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure OAuth consent screen (if not already done):
   - User Type: External (for public apps)
   - App name: WatashiWa
   - Support email: <your-email@example.com>
   - Authorized domains: your-domain.com
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: WatashiWa Web Client
   - Authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
7. Copy the **Client ID** and **Client Secret**

### 2. Supabase Dashboard Configuration

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** in the list and click to enable
4. Enter the **Client ID** and **Client Secret** from Google Cloud Console
5. Save the configuration

### 3. Environment Variables

No additional environment variables are needed in your Next.js app. Supabase handles OAuth credentials internally.

### 4. Verify Redirect URIs

Ensure these redirect URIs are configured:

- Production: `https://yourdomain.com/auth/callback`
- Development: `http://localhost:3000/auth/callback`

The Supabase callback URL format is: `https://[project-ref].supabase.co/auth/v1/callback`

### 5. Test OAuth Flow

1. Start your development server
2. Navigate to `/login`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. Verify user is created/updated in your database with provider info

## Troubleshooting

- **"redirect_uri_mismatch"**: Check that redirect URIs in Google Console match Supabase callback URL
- **"invalid_client"**: Verify Client ID and Secret are correct in Supabase dashboard
- **Account linking issues**: Supabase automatically links accounts with the same email address
