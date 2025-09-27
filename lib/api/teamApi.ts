export interface SocialLink {
  name: string
  link: string
}

export interface TeamMember {
  id: number
  name: string
  role: string
  short_bio: string
  avatar_url: string
  avatar: string
  social_links: SocialLink[]
  display_order: number
}

/**
 * Fetch all team members from the API (via Next.js API proxy route to avoid CORS)
 */
export async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    console.log('Fetching team members from Next.js API proxy route: /api/proxy/teams');
    const response = await fetch(`/api/proxy/teams`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Team members fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
}

/**
 * Fetch a single team member by ID (via Next.js API proxy route to avoid CORS)
 */
export async function fetchTeamMemberById(id: number): Promise<TeamMember> {
  try {
    console.log('Fetching team member by ID:', id);
    const response = await fetch(`/api/proxy/teams/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Team member fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching team member:', error);
    throw error;
  }
}

// Legacy export for backward compatibility
export const teamApi = {
  getTeamMembers: fetchTeamMembers,
  getTeamMemberById: fetchTeamMemberById,
}
