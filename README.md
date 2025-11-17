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

## Architecture

This project follows **Clean Architecture** principles:

```
src/
├── domain/
│   ├── entities/       # Business entities (TrailRun)
│   ├── repositories/   # Repository interfaces
│   └── use-cases/      # Application business rules
├── adapters/
│   └── repositories/   # Implementation (localStorage)
└── ui/
    └── components/     # Svelte UI components
```

### Layers:
- **Domain**: Core business logic, independent of frameworks
- **Use Cases**: Application-specific business rules
- **Adapters**: Interface adapters (localStorage implementation)
- **UI**: Svelte components for presentation

## Tech Stack

- **Svelte 5** - Modern reactive UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **localStorage** - Client-side data persistence
- **GitHub Pages** - Static site hosting

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

The app is automatically deployed to GitHub Pages via GitHub Actions when pushing to the `main` branch.

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

All trail run data is stored in browser localStorage under the key `coach-trail-runs`. Data persists across sessions but is local to each browser/device.

## License

MIT

