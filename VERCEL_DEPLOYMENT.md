# Vercel Deployment Guide

This guide will help you deploy CoachTrail to Vercel with full backend support for Polar API integration.

## Overview

CoachTrail uses Vercel serverless functions to handle Polar API authentication and requests, solving CORS issues and keeping sensitive credentials secure.

**Architecture:**
- Frontend: Static Svelte app hosted on Vercel
- Backend: Vercel serverless functions (`/api/*` endpoints)
- Data Flow: Frontend → Vercel Backend → Polar API

## Prerequisites

- GitHub account
- Vercel account (free tier is sufficient) - [Sign up here](https://vercel.com/signup)
- Polar AccessLink OAuth2 credentials - [Get them here](https://admin.polaraccesslink.com/)

## Step 1: Connect GitHub Repository to Vercel

1. **Log in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" or "Log In"
   - Choose "Continue with GitHub"

2. **Import Your Repository**
   - From the Vercel dashboard, click "Add New..." → "Project"
   - Select your GitHub repository `Thony-Crz/CoachTrail`
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset:** Other (or leave as detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
   
4. **Deploy**
   - Click "Deploy"
   - Wait for the deployment to complete (usually 1-2 minutes)
   - You'll get a URL like: `https://coach-trail.vercel.app`

## Step 2: Configure Polar OAuth2 Client

1. **Create OAuth2 Client**
   - Go to [Polar AccessLink Admin](https://admin.polaraccesslink.com/)
   - Log in with your Polar account
   - Click "New Client"

2. **Fill in Client Details**
   - **Name:** CoachTrail (or any name you prefer)
   - **Redirect URI:** `https://your-project.vercel.app/`
     - ⚠️ **Important:** Replace `your-project` with your actual Vercel project URL
     - Include the trailing slash `/`
     - Example: `https://coach-trail.vercel.app/`
   - **Scope:** Select `accesslink.read_all`

3. **Save Credentials**
   - Click "Create"
   - Copy your **Client ID** and **Client Secret**
   - ⚠️ Keep these secure - you'll need them to use the app

## Step 3: Test Your Deployment

1. **Open Your App**
   - Navigate to your Vercel URL: `https://your-project.vercel.app`

2. **Configure Polar Credentials**
   - Expand the "⚡ Polar Flow Integration" section
   - Enter your **Client ID** and **Client Secret**
   - Click "Save Credentials"

3. **Connect to Polar**
   - Click "🔗 Connect with Polar"
   - You'll be redirected to Polar to authorize
   - Log in to your Polar account
   - Grant permission to the app
   - You'll be redirected back to your app

4. **Sync Activities**
   - Click "🔄 Sync Activities"
   - Your trail running activities should be imported! 🎉

## Step 4: Set Up Custom Domain (Optional)

If you want to use a custom domain:

1. **In Vercel Dashboard**
   - Go to your project → Settings → Domains
   - Add your domain (e.g., `coachtrail.yourdomain.com`)
   - Follow Vercel's instructions to configure DNS

2. **Update Polar OAuth2 Client**
   - Go back to [Polar AccessLink Admin](https://admin.polaraccesslink.com/)
   - Edit your OAuth2 client
   - Update the **Redirect URI** to your custom domain
   - Example: `https://coachtrail.yourdomain.com/`

## Step 5: Enable Automatic Deployments

Vercel automatically deploys when you push to your main branch:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Automatic Deployment**
   - Vercel detects the push
   - Builds and deploys automatically
   - You'll receive a notification when complete
   - Each deployment gets a unique preview URL

## Local Development

### Option 1: Using Vite Dev Server (Recommended for frontend work)

```bash
npm install
npm run dev
```

- Frontend runs on `http://localhost:5173`
- Note: API routes won't work - you'll need Option 2 for full functionality

### Option 2: Using Vercel CLI (Full local testing with API routes)

```bash
# Install dependencies
npm install

# Install Vercel CLI globally (one-time)
npm install -g vercel

# Run Vercel development server
vercel dev
```

- Full app with API routes runs on `http://localhost:3000`
- Simulates the production Vercel environment locally
- Hot reloading for both frontend and backend

### Update Polar OAuth2 Client for Local Development

Add a second redirect URI for local testing:

1. Go to [Polar AccessLink Admin](https://admin.polaraccesslink.com/)
2. Edit your OAuth2 client
3. Add redirect URI: `http://localhost:3000/`
4. Now you can test OAuth flow locally

## Environment Variables

The app doesn't require any environment variables for basic Vercel deployment. All environment detection is automatic:

- In development: Uses Vite dev server or Vercel CLI
- In production: Uses Vercel deployment URL automatically

### Optional: Custom Backend URL

If you want to use a separate backend URL (advanced):

1. In Vercel Dashboard → Settings → Environment Variables
2. Add variable: `VITE_BACKEND_URL`
3. Value: Your backend URL (e.g., `https://api.yourdomain.com`)
4. Redeploy the project

## Troubleshooting

### OAuth Redirect Mismatch

**Symptom:** "redirect_uri_mismatch" error from Polar

**Solution:**
1. Check that the redirect URI in Polar OAuth2 client matches exactly:
   - Production: `https://your-project.vercel.app/`
   - Local: `http://localhost:3000/`
2. Include or exclude the trailing slash consistently
3. Use HTTPS for production, HTTP for local

### Build Fails on Vercel

**Symptom:** Deployment fails during build

**Solution:**
1. Check the build logs in Vercel dashboard
2. Ensure `package.json` has correct dependencies
3. Try running `npm run build` locally to reproduce
4. Check that all TypeScript types are correct

### API Routes Return 404

**Symptom:** Cannot access `/api/token`, `/api/register`, or `/api/activities`

**Solution:**
1. Verify the `api/` directory exists in your repository
2. Check that TypeScript files have `.ts` extension
3. Ensure `vercel.json` is present in the root directory
4. Redeploy the project

### "Failed to fetch" Error

**Symptom:** Frontend can't connect to API routes

**Solution:**
1. Check browser console for specific errors
2. Verify CORS headers are set correctly in `vercel.json`
3. Test API routes directly in browser:
   - `https://your-project.vercel.app/api/token` (should return Method Not Allowed)
4. Check Network tab in browser DevTools

### Token Exchange Fails

**Symptom:** "Token exchange failed: 401"

**Solution:**
1. Verify Client ID and Client Secret are correct
2. Make sure you copied them exactly from Polar AccessLink Admin
3. Try regenerating credentials in Polar Admin if needed

## Security Best Practices

1. **Never Commit Secrets**
   - Don't commit `.env` files
   - Don't hardcode API credentials in code
   - Client credentials are stored in browser localStorage (user's device)

2. **HTTPS Only in Production**
   - Vercel provides HTTPS automatically
   - Never use HTTP for production deployments

3. **Keep Dependencies Updated**
   - Regularly run `npm update`
   - Check for security vulnerabilities: `npm audit`
   - Apply fixes: `npm audit fix`

4. **Monitor Usage**
   - Check Vercel dashboard for unusual activity
   - Monitor function invocations
   - Vercel free tier includes generous limits

## Cost

- **Vercel Free Tier:**
  - 100GB bandwidth/month
  - 100GB-hours serverless function execution
  - Automatic HTTPS
  - More than enough for personal use

- **Polar AccessLink API:** Free

**Total cost: $0/month for personal use! 🎉**

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Check Vercel function logs (Dashboard → Functions tab)
3. Verify all URLs and credentials are correct
4. Test API routes directly
5. Check the [Vercel Documentation](https://vercel.com/docs)

## Next Steps

- ✅ Your app is deployed and working!
- 🏃 Start logging your trail runs
- 📊 Track your weekly progress
- ⚡ Sync activities from Polar Flow

Enjoy your trail running journey! 🏔️
