import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export function getAvatarUrl(avatarPath: string | null | undefined): string {
  if (!avatarPath) return "/placeholder.svg";
  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  // Otherwise, construct the full URL with the backend base URL
  return `${API_BASE_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
}
