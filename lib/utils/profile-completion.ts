export interface ProfileCompletionField {
    id: string
    label: string
    isComplete: boolean
    priority: 'required' | 'recommended' | 'optional'
}

export interface ProfileCompletionInput {
    user?: {
        first_name?: string
        last_name?: string
        username?: string
    }
    speaker?: {
        organization?: string
        short_bio?: string
        long_bio?: string
        country?: string
        avatar?: string
        skill_tags?: any[]
        experiences?: any[]
    } | null
}

/**
 * Single source of truth for profile completion fields.
 * Used by both the profile completion tracker (on the profile page)
 * and the dashboard completion banner so the percentage shown matches
 * across the app.
 */
export function getProfileCompletionFields({ user, speaker }: ProfileCompletionInput): ProfileCompletionField[] {
    return [
        {
            id: 'avatar',
            label: 'Profile Picture',
            isComplete: !!speaker?.avatar && !speaker.avatar.includes('default'),
            priority: 'recommended',
        },
        {
            id: 'name',
            label: 'Full Name',
            isComplete: !!user?.first_name?.trim() && !!user?.last_name?.trim(),
            priority: 'required',
        },
        {
            id: 'username',
            label: 'Username',
            isComplete: !!user?.username?.trim(),
            priority: 'required',
        },
        {
            id: 'organization',
            label: 'Organization',
            isComplete: !!speaker?.organization?.trim(),
            priority: 'recommended',
        },
        {
            id: 'short_bio',
            label: 'Short Bio',
            isComplete: !!speaker?.short_bio?.trim(),
            priority: 'recommended',
        },
        {
            id: 'long_bio',
            label: 'Biography',
            isComplete: !!speaker?.long_bio?.trim(),
            priority: 'recommended',
        },
        {
            id: 'country',
            label: 'Country',
            isComplete: !!speaker?.country?.trim(),
            priority: 'recommended',
        },
        {
            id: 'skill_tags',
            label: 'Skills',
            isComplete: (speaker?.skill_tags?.length || 0) > 0,
            priority: 'recommended',
        },
        {
            id: 'experiences',
            label: 'Experience',
            isComplete: (speaker?.experiences?.length || 0) > 0,
            priority: 'optional',
        },
    ]
}

export function calculateProfileCompletion(input: ProfileCompletionInput) {
    const fields = getProfileCompletionFields(input)
    const completedCount = fields.filter(field => field.isComplete).length
    const totalCount = fields.length
    const percentage = Math.round((completedCount / totalCount) * 100)
    const missingFields = fields.filter(field => !field.isComplete)

    return { fields, completedCount, totalCount, percentage, missingFields }
}
