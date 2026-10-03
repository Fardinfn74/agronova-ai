# AgroNova 🌱 — AI Farming Companion

AgroNova is an intelligent agricultural decision-support companion designed to help farmers adapt their crop fields using NASA Earth observation datasets and simple, actionable guidance.

## Features

- **Interactive Field Map**: View and manage field locations with OpenStreetMap and Leaflet.
- **NASA Earth Data Integration**: Historical and real-time precipitation, solar radiation, and soil moisture indicators via NASA POWER APIs.
- **Rotation Lab & Evidence Engine**: Test rotation scenarios, crop suitability indices, and yield potential.
- **Deterministic What-If Scenarios**: Compare season shifts, water requirements, and soil restoration.
- **Bilingual Support**: Accessible in both English and Bengali.

## Tech Stack

- **Framework**: TanStack Start & React 19
- **Routing**: TanStack Router (file-based routing)
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **Database & Auth**: Supabase & Drizzle ORM
- **Bundler & Tooling**: Vite & TypeScript

## Getting Started

### Prerequisites

- Node.js (>= 20)
- npm

### Installation

```bash
npm install
```

### Environment Configuration

Configure your `.env` file with your credentials:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

### Running Locally

```bash
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080) to explore the application.
