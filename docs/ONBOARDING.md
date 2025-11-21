# Onboarding Feature

This application includes an interactive onboarding system to help users learn how to use different features.

## Features

- **Profile Onboarding**: Guides users through profile creation, adding organizations, and understanding the workflow
- **Organizations Onboarding**: Shows users how to manage organizations and access organization dashboards
- **Organizer Dashboard Onboarding**: Comprehensive tour of event management, attendee upload, and dashboard features

## How It Works

The onboarding uses `driver.js` (React 19 compatible) to create step-by-step tours with:
- ✅ Skip option on every step
- ✅ Progress indicator
- ✅ Next/Back navigation
- ✅ Automatic scroll to highlighted elements
- ✅ Persistent completion state (won't show again after completion)

## User Flow

1. **Profile Page** → Create organization → Wait for approval (72 hours)
2. **Organizations Page** → View approved organizations → Access dashboard
3. **Organizer Dashboard** → Create events → Upload attendees → Manage everything

## Key Information Highlighted

- Organization approval process (72 hours)
- How to create and manage organizations
- Event creation and management
- Bulk attendee upload via CSV
- Dashboard statistics and features

## For Developers

### Adding New Tour Steps

Edit `/components/onboarding/onboarding-steps.tsx` to add or modify tour steps.

### Adding Tour to New Pages

1. Import the onboarding components:
```tsx
import { OnboardingTour } from "@/components/onboarding/onboarding-tour"
import { yourOnboardingSteps } from "@/components/onboarding/onboarding-steps"
import { useOnboarding } from "@/hooks/use-onboarding"
```

2. Use the onboarding hook:
```tsx
const { shouldShowOnboarding, completeOnboarding } = useOnboarding('YOUR_KEY')
```

3. Add data-tour attributes to elements:
```tsx
<Button data-tour="your-element-id">...</Button>
```

4. Render the tour:
```tsx
<OnboardingTour
  steps={yourOnboardingSteps}
  run={shouldShowOnboarding && !isLoading}
  onComplete={completeOnboarding}
/>
```

### Resetting Onboarding

Users can reset onboarding by clearing localStorage or you can add a reset button:
```tsx
const { resetOnboarding } = useOnboarding('PROFILE')
<Button onClick={resetOnboarding}>Restart Tour</Button>
```

## Storage Keys

Onboarding completion is stored in localStorage:
- `onboarding_profile_completed`
- `onboarding_organizations_completed`
- `onboarding_organizer_dashboard_completed`
