# CoachTrail

🏔️ A clean-architecture trail running tracker built with Svelte 5 and TypeScript, deployable on GitHub Pages.

## Features

### Feature 1: Trail Run Entry Form
- Enter trail run data:
  - Date (ISO format date picker)
  - Distance in kilometers
  - Elevation gain in meters
- Automatic scoring: **1 km = 1 point, 100m elevation gain = 1 point**
- Data persisted in browser localStorage

### Feature 2: Weekly Statistics View
- Displays total points per week (ISO week format)
- Shows run count per week
- Automatically groups runs by week
- Most recent weeks displayed first

### Feature 3: Polar Flow Integration ⚡
- Connect your Polar Flow account to automatically import trail running activities
- **OAuth 2.0 authorization flow** - secure authentication without manually managing tokens
- **Vercel serverless backend** - handles OAuth token exchange and API requests securely
- Automatic user registration with Polar AccessLink API
- One-click synchronization of running activities
- Automatic filtering of trail running activities (running, trail running, mountain running, etc.)
- Avoids duplicate imports by checking existing run dates
- **How to use:**
  1. Deploy to Vercel (recommended) - see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
  2. Visit [Polar AccessLink Admin](https://admin.polaraccesslink.com/)
  3. Create a new OAuth2 client application
  4. Set the redirect URL to your Vercel app URL (e.g., `https://your-app.vercel.app/`)
  5. Copy your Client ID and Client Secret
  6. Enter credentials in the app and click "Save Credentials"
  7. Click "🔗 Connect with Polar" to authorize the app
  8. You'll be redirected to Polar to log in and grant permission
  9. After authorization, you'll be redirected back and can sync your activities

## Architecture

This project follows **Clean Architecture** principles with a serverless backend:

```
Repository Structure:
├── src/                 # Frontend (Svelte app)
│   ├── domain/
│   │   ├── entities/       # Business entities (TrailRun, PolarCredentials, PolarActivity)
│   │   ├── repositories/   # Repository interfaces
│   │   ├── services/       # Domain services (OAuth, etc.)
│   │   └── use-cases/      # Application business rules
│   ├── adapters/
│   │   ├── repositories/   # Implementation (localStorage)
│   │   └── api/            # API service adapters
│   └── ui/
│       └── components/     # Svelte UI components
└── api/                 # Backend (Vercel serverless functions)
    ├── token.ts            # OAuth token exchange
    ├── register.ts         # User registration
    └── activities.ts       # Activity synchronization
```

### Layers:
- **Frontend (src/)**
  - **Domain**: Core business logic, independent of frameworks
  - **Use Cases**: Application-specific business rules
  - **Adapters**: Interface adapters (localStorage, API clients)
  - **UI**: Svelte components for presentation
  
- **Backend (api/)**
  - **Serverless Functions**: Vercel functions that handle Polar API requests
  - **CORS Handling**: Properly configured CORS headers
  - **Security**: Client secret kept server-side, never exposed to browser

### Data Flow:
```
User → Frontend (Svelte) → Backend (Vercel Functions) → Polar API
                    ↓
              localStorage (TrailRuns)
```

## Tech Stack

### Frontend
- **Svelte 5** - Modern reactive UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **localStorage** - Client-side data persistence

### Backend
- **Vercel Serverless Functions** - Node.js serverless backend
- **TypeScript** - Type-safe API development

### Deployment
- **Vercel** - Static hosting + serverless functions (recommended)
- **GitHub Pages** - Alternative static hosting (requires separate CORS proxy)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npm run check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Recommended: Vercel (with Backend Support)

The recommended way to deploy CoachTrail is using Vercel, which provides both static hosting and serverless functions for the backend API. This approach properly handles Polar API authentication and CORS without needing a separate proxy.

**See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for complete deployment instructions.**

Quick steps:
1. Connect your GitHub repository to Vercel
2. Deploy automatically
3. Configure Polar OAuth2 credentials in the app
4. Start syncing your activities!

### Alternative: GitHub Pages (with CORS Proxy)

You can also deploy to GitHub Pages with a separate CORS proxy (Cloudflare Workers). This approach is more complex and requires managing two separate services.

**See [DEPLOYMENT.md](DEPLOYMENT.md) for GitHub Pages deployment instructions.**

**Note:** The Vercel approach is recommended as it's simpler, more secure (client secret stays server-side), and provides better integration.

### Manual Deployment
```bash
npm run deploy
```

## Responsive Design

- Desktop: Side-by-side layout (form | stats)
- Mobile: Stacked layout with full-width components
- Accessible form inputs with proper labels
- Touch-friendly button sizes

## Data Persistence

All trail run data is stored in browser localStorage under the key `coach-trail-runs`. Polar Flow credentials are stored under `coach-trail-polar-credentials`. Data persists across sessions but is local to each browser/device.

**Note:** Your Polar credentials (Client ID and Secret) are stored securely in your browser's localStorage. When you authenticate with Polar, the credentials are sent to the Vercel backend (which you control) to securely exchange authorization codes for access tokens. Your credentials are never sent to any third-party servers.

## License

MIT

