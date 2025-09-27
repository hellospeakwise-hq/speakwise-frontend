# SpeakWise Frontend

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC)](https://tailwindcss.com/)

**SpeakWise** is a comprehensive platform that connects conference attendees, speakers, and organizers through anonymous feedback, speaker portfolios, and event management tools. This repository contains the frontend application built with Next.js, React, and TypeScript.

## 🚀 Features

### For Attendees
- **Anonymous Feedback System**: Provide honest, verified feedback on speakers
- **Event Discovery**: Browse and filter events by region, country, and tags
- **Verified Attendance**: Secure verification system ensures quality feedback
- **Session Reviews**: Rate and comment on specific sessions and speakers

### For Speakers
- **Professional Portfolios**: Build public profiles showcasing speaking engagements
- **Performance Analytics**: Track feedback metrics and improvement over time
- **Visibility**: Increase opportunities for future speaking engagements
- **Detailed Insights**: Access comprehensive feedback and performance data

### For Organizers
- **Event Management**: Create and manage events with comprehensive tools
- **Attendee Management**: Upload and manage attendee lists via CSV
- **Speaker Management**: Coordinate speakers and sessions
- **Analytics Dashboard**: Monitor event performance and feedback

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI primitives with custom components
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Authentication**: JWT-based authentication with role-based access
- **State Management**: React Context API
- **Package Manager**: pnpm
- **Development**: ESLint for code quality

## 📦 Project Structure

```
speakwise-frontend/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── dashboard/         # Protected dashboard pages
│   ├── events/            # Event listing and details
│   ├── profile/           # User profile pages
│   ├── signin/            # Authentication pages
│   ├── signup/
│   └── speakers/          # Speaker directory
├── components/            # Reusable React components
│   ├── about/            # About page components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── events/           # Event-related components
│   ├── speakers/         # Speaker components
│   └── ui/               # Base UI components
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API clients
│   ├── api/             # API client modules
│   └── utils/           # Utility functions
└── public/              # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- Backend API running (default: http://127.0.0.1:8000)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hellospeakwise-hq/speakwise-frontend.git
   cd speakwise-frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

   # FOR BACKEND SERVER NGROK LINK USE : https://e28ac64ff003.ngrok-free.app/

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## 🔐 Authentication & Authorization

The application implements role-based authentication with three user types:

- **Attendees**: Can browse events and provide feedback
- **Speakers**: Can manage profiles and view performance analytics
- **Organizers**: Can create events and manage attendees/speakers

### Protected Routes

- `/dashboard/*` - Requires authentication
- `/profile/*` - Requires authentication
- Role-specific access controls within dashboard sections

## 🎨 UI Components

Built with a comprehensive design system using:

- **Radix UI**: Accessible, unstyled components
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Beautiful, customizable components
- **Lucide React**: Icon library
- **Dark Mode**: Full theme support

### Key Components

- **Navigation**: Responsive header with user authentication
- **Forms**: Validated forms with error handling
- **Data Tables**: Sortable, filterable tables for management
- **Charts**: Interactive analytics dashboards
- **Modals**: Accessible dialog systems

## 📊 Key Features Detail

### Event Management
- Create and edit events with rich metadata
- Upload event images and manage speakers
- Tag system for categorization
- Regional filtering and search

### Attendee Management
- CSV upload for bulk attendee import
- Real-time validation and error reporting
- Search and filter capabilities
- Verification status tracking

### Analytics Dashboard
- Performance metrics for speakers
- Event feedback summaries
- Charts and visualizations
- Exportable reports

## 🌐 API Integration

The frontend integrates with a Django REST API backend:

- **Authentication**: JWT tokens with refresh mechanism
- **Real-time Updates**: Optimistic UI updates
- **Error Handling**: Comprehensive error boundaries
- **Loading States**: Skeleton loaders and spinners

### API Modules

- `authApi.ts` - Authentication endpoints
- `eventsApi.ts` - Event management
- `attendeeApi.ts` - Attendee management
- `speakersApi.ts` - Speaker profiles

## 🚀 Deployment

### Production Build

```bash
pnpm build
pnpm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Configuration

For production deployment, ensure:
- Set `NEXT_PUBLIC_API_URL` to your backend URL
- Configure HTTPS for production
- Set up proper CORS headers on backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Ensure components are accessible
- Add proper error handling
- Write meaningful tests

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in `/docs`

## 🔄 Changelog

### v0.1.0 (Current)
- Initial release with core functionality
- Authentication system with role-based access
- Event management and discovery
- Speaker profiles and feedback system
- Attendee management tools
- Analytics dashboards

---

**Built with ❤️ by the SpeakWise Team**
