const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export interface TeamMember {
  id: number
  name: string
  role: string
  short_bio: string
  avatar_url?: string
  twitter_url?: string
  linkedin_url?: string
  github_url?: string
  instagram_url?: string
  is_active: boolean
  display_order: number
}

export const teamApi = {
  async getTeamMembers(): Promise<TeamMember[]> {
    const response = await fetch(`${API_BASE_URL}/api/teams/`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch team members: ${response.status}`)
    }
    
    return response.json()
  }
}
