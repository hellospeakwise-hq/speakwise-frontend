import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * Generate a unique default avatar URL using DiceBear
 * Uses modern, cool avatar styles
 * @param seed - Unique identifier (user ID, email, or name)
 * @param style - Avatar style: 'lorelei' | 'notionists' | 'micah' | 'adventurer' | 'personas'
 */
export function getDefaultAvatar(seed: string, style: 'lorelei' | 'notionists' | 'micah' | 'adventurer' | 'personas' = 'notionists'): string {
  // Clean the seed for URL
  const cleanSeed = encodeURIComponent(seed.toLowerCase().trim())
  // DiceBear API - generates unique SVG avatars with modern styles
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${cleanSeed}&backgroundColor=f97316,fb923c,fdba74,fed7aa&backgroundType=gradientLinear&backgroundRotation=0,360`
}

export function getAvatarUrl(avatarPath: string | null | undefined, fallbackSeed?: string): string {
  if (!avatarPath) {
    if (fallbackSeed) return getDefaultAvatar(fallbackSeed)
    return getDefaultAvatar('default-user')
  }
  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath
  }
  // Otherwise, construct the full URL with the backend base URL
  return `${API_BASE_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`
}
