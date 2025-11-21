import { TourStep } from './onboarding-tour';

export const profileOnboardingSteps: TourStep[] = [
    {
        element: 'body',
        popover: {
            title: 'Welcome to Your Profile! 👋',
            description: 'Let&apos;s take a quick tour to help you get started. You can exit this tour anytime by clicking the close button.',
            side: 'bottom',
            align: 'center',
        },
    },
    {
        element: '[data-tour="profile-picture"]',
        popover: {
            title: 'Profile Picture',
            description: 'Upload your profile picture here to personalize your account and make it recognizable to others.',
            side: 'bottom',
        },
    },
    {
        element: '[data-tour="personal-info"]',
        popover: {
            title: 'Personal Information',
            description: 'Keep your personal details up to date. This helps us provide you with better service.',
            side: 'top',
        },
    },
    {
        element: '[data-tour="speaker-profile"]',
        popover: {
            title: 'Speaker Profile',
            description: 'Fill out your speaker information including organization, bio, and country to build your professional presence.',
            side: 'top',
        },
    },
    {
        element: '[data-tour="skills"]',
        popover: {
            title: 'Skills & Expertise',
            description: 'Add your skills and areas of expertise to showcase what you&apos;re good at!',
            side: 'top',
        },
    },
    {
        element: '[data-tour="organizations"]',
        popover: {
            title: 'Organizations',
            description: 'Create or manage your organizations here. Organizations allow you to host events!',
            side: 'top',
        },
    },
    {
        element: '[data-tour="create-org-button"]',
        popover: {
            title: 'Create Your Organization 🏢',
            description: 'Click here to create a new organization. Once created, it will be reviewed by our admin team. ⏱️ Note: Approval typically takes up to 72 hours.',
            side: 'left',
        },
    },
    {
        element: '[data-tour="view-orgs"]',
        popover: {
            title: 'View All Organizations',
            description: 'After creating an organization, you can view and manage all your organizations from the organizations page. 💡 Once approved, you&apos;ll be able to access your organization dashboard!',
            side: 'left',
        },
    },
];

export const organizationsOnboardingSteps: TourStep[] = [
    {
        element: 'body',
        popover: {
            title: 'Welcome to Organizations! 🏢',
            description: 'This is where you manage all your organizations. Let&apos;s show you around!',
            side: 'bottom',
            align: 'center',
        },
    },
    {
        element: '[data-tour="create-organization"]',
        popover: {
            title: 'Create New Organization',
            description: 'Click here to create a new organization. Fill in the details and submit for admin approval.',
            side: 'left',
        },
    },
    {
        element: '[data-tour="approved-orgs"]',
        popover: {
            title: 'Active Organizations ✅',
            description: 'These are your approved organizations. You can access their dashboards to manage events and attendees.',
            side: 'bottom',
        },
    },
    {
        element: '[data-tour="org-dashboard-button"]',
        popover: {
            title: 'Organization Dashboard',
            description: 'Click this button to access your organization&apos;s dashboard where you can create events, manage speakers, and track attendees.',
            side: 'top',
        },
    },
    {
        element: '[data-tour="pending-orgs"]',
        popover: {
            title: 'Pending Approval ⏳',
            description: 'Organizations awaiting admin approval appear here. Approval usually takes up to 72 hours. You&apos;ll receive an email notification once approved!',
            side: 'bottom',
        },
    },
];

export const organizerDashboardSteps: TourStep[] = [
    {
        element: 'body',
        popover: {
            title: 'Welcome to Your Organizer Dashboard! 🎉',
            description: 'This is your command center for managing events, speakers, and attendees. Let&apos;s explore!',
            side: 'bottom',
            align: 'center',
        },
    },
    {
        element: '[data-tour="stats-total-events"]',
        popover: {
            title: 'Total Events',
            description: 'Track the total number of events you&apos;ve organized.',
            side: 'bottom',
        },
    },
    {
        element: '[data-tour="stats-attendees"]',
        popover: {
            title: 'Total Attendees',
            description: 'See how many people have attended your events across all your organized activities.',
            side: 'bottom',
        },
    },
    {
        element: '[data-tour="stats-feedback"]',
        popover: {
            title: 'Feedback Rate',
            description: 'Monitor the percentage of attendees who provide feedback for your events.',
            side: 'bottom',
        },
    },
    {
        element: '[data-tour="stats-rating"]',
        popover: {
            title: 'Average Speaker Rating',
            description: 'View the average rating speakers receive at your events.',
            side: 'bottom',
        },
    },
    {
        element: '[data-tour="refresh-stats"]',
        popover: {
            title: 'Refresh Stats',
            description: 'Click here to refresh and get the latest statistics for your events.',
            side: 'bottom',
        },
    },
    {
        element: '[data-tour="manage-events-tab"]',
        popover: {
            title: 'Manage Events',
            description: 'This is where you view and manage all your events.',
            side: 'bottom',
        },
    },
    {
        element: '[data-tour="create-event-button"]',
        popover: {
            title: 'Create New Event 🎪',
            description: 'Click here to create a new event. Fill in details like title, description, dates, location, and more!',
            side: 'left',
        },
    },
    {
        element: '[data-tour="event-table"]',
        popover: {
            title: 'Event Management Table',
            description: 'View all your events in this table. You can edit, delete, or publish/unpublish events from here.',
            side: 'top',
        },
    },
    {
        element: '[data-tour="attendees-tab"]',
        popover: {
            title: 'Attendees Tab',
            description: 'Switch to this tab to manage attendees across all your events.',
            side: 'bottom',
        },
    },
    {
        element: '[data-tour="upload-attendees"]',
        popover: {
            title: 'Upload Attendees 📤',
            description: 'Upload attendees in bulk using a CSV file. This makes it easy to add multiple attendees at once! 💡 Tip: Download the sample CSV to see the required format.',
            side: 'bottom',
        },
    },
    {
        element: 'body',
        popover: {
            title: 'You&apos;re All Set! 🚀',
            description: 'You now know how to manage your events and attendees. Start creating amazing events! You can always restart this tour from your profile settings.',
            side: 'bottom',
            align: 'center',
        },
    },
];
