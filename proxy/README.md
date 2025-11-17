# CORS Proxy Setup Guide

## Problem

The Polar AccessLink API doesn't support CORS (Cross-Origin Resource Sharing) headers, which prevents browser-based applications from making direct API calls. This causes errors like:

```
Access to fetch at 'https://www.polaraccesslink.com/v3/users' from origin 'https://thony-crz.github.io' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

This project uses a proxy server to forward API requests with proper CORS headers. There are two environments:

### Development (Local)

The Vite development server includes a built-in proxy that automatically forwards requests to the Polar API. No additional setup is required - just run:

```bash
npm run dev
```

The proxy configuration is in `vite.config.ts` and forwards `/api/polar/*` requests to `https://www.polaraccesslink.com/*`.

### Production (GitHub Pages)

For production deployment on GitHub Pages, you need to set up a CORS proxy. We recommend using **Cloudflare Workers** (free tier available).

## Cloudflare Workers Setup (Recommended)

### Step 1: Create a Cloudflare Account

1. Go to [Cloudflare Workers](https://workers.cloudflare.com/)
2. Sign up for a free account
3. Verify your email

### Step 2: Create a Worker

1. Log in to your Cloudflare dashboard
2. Go to **Workers & Pages** from the sidebar
3. Click **Create Application**
4. Select **Create Worker**
5. Give your worker a name (e.g., `coachtrail-polar-proxy`)
6. Click **Deploy**

### Step 3: Configure the Worker

1. Click **Edit Code** on your worker
2. Replace the entire code with the contents of `proxy/cloudflare-worker.js` from this repository
3. Update the `ALLOWED_ORIGINS` array to include your GitHub Pages URL:
   ```javascript
   const ALLOWED_ORIGINS = [
     'https://YOUR-USERNAME.github.io',  // Update this!
     'http://localhost:5173',
     'http://localhost:4173',
   ];
   ```
4. Click **Save and Deploy**

### Step 4: Get Your Worker URL

After deployment, you'll see your worker URL in the format:
```
https://coachtrail-polar-proxy.YOUR-SUBDOMAIN.workers.dev
```

Copy this URL.

### Step 5: Configure the Application

1. Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Set the proxy URL:
   ```
   VITE_POLAR_PROXY_URL=https://your-worker.your-subdomain.workers.dev
   ```

3. Build and deploy:
   ```bash
   npm run build
   ```

### Step 6: Update GitHub Actions (Optional)

If you want to automate deployment with the proxy URL, update `.github/workflows/deploy.yml` to include the environment variable:

```yaml
- name: Build
  env:
    VITE_POLAR_PROXY_URL: ${{ secrets.VITE_POLAR_PROXY_URL }}
  run: npm run build
```

Then add the secret in your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VITE_POLAR_PROXY_URL`
4. Value: Your Cloudflare Worker URL

## Alternative: Using Other Proxy Services

### Vercel Edge Functions

If you prefer Vercel:

1. Create a Vercel account
2. Create a new Edge Function
3. Adapt the Cloudflare Worker code for Vercel
4. Deploy and use the Vercel URL

### Self-Hosted Proxy

You can also host your own proxy using:
- Node.js + Express
- Python + Flask
- Any other backend framework

Example Express.js proxy:

```javascript
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

app.use(cors({
  origin: ['https://YOUR-USERNAME.github.io', 'http://localhost:5173']
}));

app.use(express.json());

app.use('/api', async (req, res) => {
  const targetUrl = `https://www.polaraccesslink.com${req.path}`;
  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      ...req.headers,
      host: 'www.polaraccesslink.com'
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
  });
  
  const data = await response.json();
  res.json(data);
});

app.listen(3000);
```

## Security Considerations

1. **Origin Validation**: The proxy only allows requests from specified origins
2. **HTTPS Only**: Use HTTPS for all production deployments
3. **API Keys**: Never expose your Polar API credentials in client-side code
4. **Rate Limiting**: Consider adding rate limiting to your proxy

## Testing

### Test Development Proxy

```bash
npm run dev
# App should work without CORS errors on http://localhost:5173
```

### Test Production Build Locally

```bash
# Set the proxy URL in .env
echo "VITE_POLAR_PROXY_URL=https://your-worker.workers.dev" > .env

# Build
npm run build

# Preview
npm run preview
# Test on http://localhost:4173
```

## Troubleshooting

### "Proxy error: 403 Forbidden"

- Check that your GitHub Pages URL is in the `ALLOWED_ORIGINS` array in the worker code
- Redeploy the worker after making changes

### "Failed to fetch"

- Verify that `VITE_POLAR_PROXY_URL` is set correctly
- Check that the worker is deployed and accessible
- Check browser console for specific error messages

### "Invalid state parameter"

This is an OAuth flow error, not a CORS error. It usually means:
- Browser blocked third-party cookies
- OAuth session expired
- Try clearing sessionStorage and localStorage, then try again

## Cost

- **Cloudflare Workers Free Tier**: 100,000 requests/day (more than enough for personal use)
- **Vercel Free Tier**: 100GB bandwidth/month
- **Self-hosted**: Depends on your hosting provider

## Further Reading

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Polar AccessLink API](https://www.polar.com/accesslink-api/)
