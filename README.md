# SpeakWise Frontend

[![Next.js CI/CD](https://github.com/Darkbeast-glitch/speakwise-frontend-new/actions/workflows/nextjs-ci-cd.yml/badge.svg)](https://github.com/Darkbeast-glitch/speakwise-frontend-new/actions/workflows/nextjs-ci-cd.yml)

## Project Overview

SpeakWise is a comprehensive platform that connects conference attendees, speakers, and organizers through anonymous feedback, speaker portfolios, and event management tools.

## Technology Stack

- **Frontend**: Next.js 15.x, React 19, TypeScript 5
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation
- **Authentication**: JWT-based auth with role-based access control

## Features

- Anonymous feedback system for speakers
- Speaker portfolios and analytics
- Event management and discovery
- Attendee management with CSV upload
- Role-based access (Attendees, Speakers, Organizers)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- Backend API running (default: http://127.0.0.1:8000)

### Installation

```bash
# Clone the repository
git clone https://github.com/Darkbeast-glitch/speakwise-frontend-new.git
cd speakwise-frontend-new

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## CI/CD Setup

This project uses GitHub Actions for CI/CD. The workflow includes:

### Continuous Integration

- **Linting**: Checks code quality with ESLint
- **Building**: Ensures the application builds successfully
- **Testing**: (Uncomment in workflow file when tests are added)

### Continuous Deployment

The workflow is configured to deploy to Vercel when code is pushed to the main branch.

### Setting Up CI/CD

1. **Set up GitHub repository secrets**:
   - For Vercel deployment:
     - `VERCEL_TOKEN`: Your Vercel API token
     - `VERCEL_ORG_ID`: Your Vercel organization ID
     - `VERCEL_PROJECT_ID`: Your Vercel project ID

2. **Environment variables**:
   - `NEXT_PUBLIC_API_URL`: URL to your backend API

### CI/CD Workflow

- Push to `frontend-setup` or `main` branch triggers build and lint
- Merge to `main` triggers deployment to production
- Pull requests against `main` verify build integrity

## Project Structure

```
speakwise-frontend/
├── .github/workflows/    # CI/CD configuration
├── app/                  # Next.js App Router pages
├── components/           # React components
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API clients
├── public/               # Static assets
```
