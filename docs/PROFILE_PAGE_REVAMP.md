# Profile Page Revamp - Documentation

## Overview
Revamped the profile page to use the new unified `/api/users/me/` endpoint that returns both user and speaker data in a single response.

## Changes Made

### 1. New API Structure (`lib/api/userApi.ts`)

#### New Types
```typescript
interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    nationality: string;
    username: string;
}

interface SpeakerProfile {
    id: number;
    social_links: any[];
    skill_tag: SkillTag[];
    speaker_name: string;
    organization: string;
    short_bio: string;
    long_bio: string;
    country: string;
    avatar: string;
    user_account: string;
}

interface UserProfileResponse {
    user: User;
    speaker: SpeakerProfile;
}
```

#### New API Methods
- **GET /api/users/me/** - Fetch complete user profile (user + speaker data)
- **PUT /api/users/me/** - Update user profile with nested structure
- **PUT /api/users/me/** - Upload avatar (multipart/form-data)

#### Update Payload Structure
```json
{
  "user": {
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "nationality": "American"
  },
  "speaker": {
    "organization": "Tech Corp",
    "short_bio": "Brief description",
    "long_bio": "Detailed biography...",
    "country": "USA",
    "skill_tag": [1, 2, 3]
  }
}
```

### 2. Profile Page Restructuring (`app/profile/page.tsx`)

#### Removed Features
- ❌ User Role field (no longer displayed)
- ❌ Separate speaker profile API calls
- ❌ Complex state synchronization

#### New Features
- ✅ Single unified data fetch on mount
- ✅ Nested form data structure (user + speaker)
- ✅ Profile Picture section moved to top (when available)
- ✅ Edit Profile button moved to bottom
- ✅ Cleaner, more intuitive layout

#### Layout Order (Top to Bottom)
1. **Profile Picture** (speakers only)
2. **Personal Information** (all users)
   - First Name, Last Name
   - Email (read-only)
   - Username, Nationality
3. **Speaker Profile** (speakers only)
   - Organization, Country
   - Short Bio, Long Bio
4. **Skills & Expertise** (speakers only)
   - Current skills with remove option
   - Available skills to add
   - Create new skill
5. **Organization Management** (all users)
   - Create organization button
6. **Edit Profile Button** (bottom)
   - Save Changes / Cancel (when editing)
   - Edit Profile (when not editing)

### 3. State Management Improvements

#### Before (Multiple States)
```typescript
const [speakerProfile, setSpeakerProfile] = useState<SpeakerProfile | null>(null)
const [user, setUser] = useAuth()
// Multiple API calls to sync data
```

#### After (Single Source of Truth)
```typescript
const [profileData, setProfileData] = useState<UserProfileResponse | null>(null)
// Single API call, single state update
```

### 4. Form Fields Added
- **Username** - User's unique username
- **Nationality** - User's nationality

### 5. API Integration

#### Loading Profile
```typescript
const loadProfile = async () => {
    const data = await userApi.getUserProfile() // GET /api/users/me/
    setProfileData(data)
    // Automatically populates all form fields
}
```

#### Saving Profile
```typescript
const handleSaveProfile = async () => {
    const updateData = {
        user: { first_name, last_name, username, nationality },
        speaker: { organization, short_bio, long_bio, country, skill_tag: [...] }
    }
    const updatedProfile = await userApi.updateUserProfile(updateData) // PUT /api/users/me/
    setProfileData(updatedProfile)
}
```

#### Uploading Avatar
```typescript
const handleAvatarUpload = async (file: File) => {
    const updatedProfile = await userApi.uploadAvatar(file) // PUT /api/users/me/ (multipart)
    setProfileData(updatedProfile)
}
```

### 6. Backend Endpoint Details

**Endpoint**: `GET /api/users/me/`
**Auth**: Bearer Token Required
**Response**:
```json
{
  "user": {
    "id": "uuid",
    "first_name": "Julius",
    "last_name": "Boakye",
    "email": "email@example.com",
    "nationality": "Ghanian",
    "username": "username"
  },
  "speaker": {
    "id": 1,
    "social_links": [],
    "skill_tag": [
      {
        "id": 1,
        "name": "Software Engineer",
        "description": "Flutter",
        "duration": 3
      }
    ],
    "speaker_name": "Julius Boakye",
    "organization": "Talent Coop",
    "short_bio": "Brief bio...",
    "long_bio": "Detailed bio...",
    "country": "Ghana",
    "avatar": "/media/speakers/avatars/image.jpg",
    "user_account": "uuid"
  }
}
```

**Endpoint**: `PUT /api/users/me/`
**Auth**: Bearer Token Required
**Accepts**: application/json OR multipart/form-data (for avatar)

## Benefits of This Approach

1. **Single Source of Truth** - One API call provides all data
2. **Atomic Updates** - User and speaker data updated together
3. **Better UX** - Fewer loading states, faster page load
4. **Cleaner Code** - Reduced state management complexity
5. **Improved Layout** - Edit button at bottom, profile picture at top
6. **Type Safety** - Proper TypeScript interfaces for all data

## Testing

### Manual Testing Steps
1. **Load Profile**
   - Navigate to /profile
   - Verify all fields populated correctly
   - Check avatar displays (if available)

2. **Edit Profile**
   - Click "Edit Profile" button
   - Modify fields
   - Click "Save Changes"
   - Verify success toast
   - Verify fields remain updated

3. **Upload Avatar**
   - Click "Upload Picture" / "Change Picture"
   - Select image file
   - Verify upload success
   - Verify new image displays

4. **Manage Skills**
   - Click "Edit Profile"
   - Add/remove skills
   - Create new skill
   - Save changes
   - Verify skills persist

## Migration Notes

### For Backend Team
- Endpoint `/api/users/me/` must return both user and speaker objects
- PUT endpoint must accept nested `user` and `speaker` objects
- Avatar upload should work with same endpoint using multipart/form-data

### For Frontend Team
- Old `speakerApi.getProfile()` calls replaced with `userApi.getUserProfile()`
- Old separate update calls replaced with single `userApi.updateUserProfile()`
- Profile state now uses `UserProfileResponse` type

## Known Issues / Future Improvements

1. Consider using Next.js `<Image>` component instead of `<img>` for optimization
2. Add organization status display (pending/approved)
3. Add change password functionality
4. Add social links management UI
5. Consider adding profile completion percentage

## Files Modified

- ✅ `/lib/api/userApi.ts` - Complete rewrite with new endpoint integration
- ✅ `/app/profile/page.tsx` - Complete restructure with new API
- ✅ Layout improved, user role field removed, edit button moved to bottom
