# Deployment Guide for GitHub Pages with CORS Proxy

> **⚠️ RECOMMENDED APPROACH:** We now recommend using Vercel for deployment, which provides both static hosting and serverless backend functions. This is simpler, more secure, and doesn't require a separate CORS proxy. See **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** for instructions.

This guide walks you through the **alternative approach** of deploying CoachTrail to GitHub Pages with a separate Cloudflare Workers CORS proxy. Use this if you specifically want to use GitHub Pages for hosting.

## Prerequisites

- GitHub account
- Cloudflare account (free tier is sufficient)
- Polar AccessLink OAuth2 client credentials

## Step-by-Step Deployment

### 1. Set Up the CORS Proxy

#### Option A: Cloudflare Workers (Recommended - Free)

1. **Create a Cloudflare Account**
   - Go to https://workers.cloudflare.com/
   - Sign up for a free account
   - Verify your email

2. **Create a New Worker**
   - Log in to Cloudflare Dashboard
   - Navigate to **Workers & Pages** → **Overview**
   - Click **Create Application**
   - Select **Create Worker**
   - Give it a name like `coachtrail-polar-proxy`
   - Click **Deploy**

3. **Configure the Worker Code**
   - Click **Edit Code** on your worker page
   - Delete all existing code
   - Copy the entire content from `proxy/cloudflare-worker.js`
   - Paste it into the worker editor
   - **IMPORTANT**: Update the `ALLOWED_ORIGINS` array:
     ```javascript
     const ALLOWED_ORIGINS = [
       'https://YOUR-GITHUB-USERNAME.github.io',  // ← Update this!
       'http://localhost:5173',
       'http://localhost:4173',
     ];
     ```
   - Click **Save and Deploy**

4. **Get Your Worker URL**
   - After deployment, you'll see a URL like:
     ```
     https://coachtrail-polar-proxy.YOUR-SUBDOMAIN.workers.dev
     ```
   - Copy this URL - you'll need it in the next step

#### Option B: Alternative Proxy Solutions

See [proxy/README.md](../proxy/README.md) for other options like:
- Vercel Edge Functions
- Self-hosted Express.js proxy
- Other serverless platforms

### 2. Configure GitHub Repository Secrets

1. **Go to Your Repository Settings**
   - Navigate to your GitHub repository
   - Click **Settings** → **Secrets and variables** → **Actions**

2. **Add the Proxy URL Secret**
   - Click **New repository secret**
   - Name: `VITE_POLAR_PROXY_URL`
   - Value: Your Cloudflare Worker URL (from Step 1.4)
   - Click **Add secret**

### 3. Deploy to GitHub Pages

The deployment happens automatically via GitHub Actions when you push to the `main` branch.

1. **Verify the Workflow**
   - Go to **Actions** tab in your repository
   - Check that the "Deploy to GitHub Pages" workflow exists
   - If there's no workflow run yet, make a small commit to trigger it

2. **Enable GitHub Pages** (if not already enabled)
   - Go to **Settings** → **Pages**
   - Source: **GitHub Actions**
   - The site should be available at: `https://YOUR-USERNAME.github.io/CoachTrail/`

3. **Wait for Deployment**
   - The workflow will:
     - Install dependencies
     - Build the app with the proxy URL
     - Deploy to GitHub Pages
   - This usually takes 2-3 minutes

### 4. Configure Polar OAuth2 Client

1. **Create Polar OAuth2 Client**
   - Go to https://admin.polaraccesslink.com/
   - Log in with your Polar account
   - Click **New Client**
   - Fill in the details:
     - **Name**: CoachTrail (or any name you prefer)
     - **Redirect URI**: `https://YOUR-USERNAME.github.io/CoachTrail/`
       - ⚠️ This must match exactly (including trailing slash)
     - **Scope**: Select `accesslink.read_all`
   - Click **Create**
   - **Save your Client ID and Client Secret** - you'll need these

### 5. Test the Application

1. **Open Your Deployed App**
   - Navigate to `https://YOUR-USERNAME.github.io/CoachTrail/`

2. **Configure Polar Credentials**
   - Expand the "⚡ Polar Flow Integration" section
   - Enter your **Client ID** and **Client Secret**
   - Click **Save Credentials**

3. **Connect to Polar**
   - Click **🔗 Connect with Polar**
   - You'll be redirected to Polar to authorize
   - Log in to your Polar account
   - Grant permission to the app
   - You'll be redirected back to your app

4. **Sync Activities**
   - Click **🔄 Sync Activities**
   - Your trail running activities should be imported!

## Troubleshooting

### CORS Error Still Occurring

**Symptom**: Browser console shows CORS error

**Solutions**:
1. Verify `VITE_POLAR_PROXY_URL` secret is set in GitHub repository
2. Check that the Cloudflare Worker is deployed and accessible
3. Verify the `ALLOWED_ORIGINS` in the worker includes your exact GitHub Pages URL
4. Try redeploying the worker
5. Clear browser cache and try again

### OAuth Redirect Mismatch

**Symptom**: "redirect_uri_mismatch" error from Polar

**Solutions**:
1. Ensure the redirect URI in Polar OAuth2 client matches exactly:
   ```
   https://YOUR-USERNAME.github.io/CoachTrail/
   ```
2. Include or exclude the trailing slash consistently
3. Make sure it's HTTPS, not HTTP

### Worker Returns 403 Forbidden

**Symptom**: Network requests to worker return 403

**Solutions**:
1. Check that your GitHub Pages URL is in the `ALLOWED_ORIGINS` array
2. Make sure you've saved and deployed the worker after updating the code
3. Try accessing the worker URL directly in a browser to verify it's deployed

### GitHub Actions Build Fails

**Symptom**: Deployment workflow fails

**Solutions**:
1. Check the Actions tab for error details
2. Verify that `VITE_POLAR_PROXY_URL` secret is set
3. Check that the secret value doesn't have extra spaces or quotes
4. Re-run the workflow

## Local Development

For local development, you don't need the proxy - Vite's built-in proxy handles it:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173/CoachTrail/
```

The Vite proxy automatically forwards `/api/polar/*` requests to the Polar API.

## Updating the Proxy

If you need to update the proxy (e.g., add more origins):

1. Edit `proxy/cloudflare-worker.js` locally
2. Copy the updated code
3. Go to your Cloudflare Worker
4. Click **Edit Code**
5. Paste the updated code
6. Click **Save and Deploy**

No need to redeploy the GitHub Pages app - the proxy is independent.

## Security Notes

1. **Never commit `.env` files** - they're in `.gitignore`
2. **Keep your Polar Client Secret secure** - it's stored in browser localStorage
3. **Use HTTPS only** for production
4. **Regularly update dependencies** for security patches
5. **Monitor your Cloudflare Worker usage** - free tier should be sufficient for personal use

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Review the Cloudflare Worker logs (in Cloudflare Dashboard)
3. Verify all URLs and secrets are correct
4. See [proxy/README.md](../proxy/README.md) for detailed proxy documentation

## Cost

- **GitHub Pages**: Free
- **Cloudflare Workers**: Free tier (100,000 requests/day)
- **Polar AccessLink API**: Free

Total cost: **$0/month** for personal use!
