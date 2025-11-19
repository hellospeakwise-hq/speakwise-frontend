# Backend Fix Required: Speaker Data Not Filtered by Authenticated User

## Problem

When speakers log in to their dashboard, they see data belonging to OTHER speakers instead of their own data. This is a **critical security and privacy issue**.

### What's Happening

1. User A (speaker) logs in and gets a JWT token
2. Frontend calls `/api/feedbacks/` with the Bearer token
3. Backend returns ALL feedback or feedback for a different speaker
4. User A sees User B's feedback data

## Root Cause

The backend endpoint `/api/feedbacks/` is not filtering results based on the authenticated user in the JWT token.

## Required Backend Fixes

### 1. Feedback Endpoint (`/api/feedbacks/`)

**Current behavior:** Returns all feedback or wrong speaker's feedback  
**Required behavior:** Return ONLY feedback for the authenticated speaker

```python
# Django/DRF example fix
class FeedbackViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        # Get the authenticated user from the request
        user = self.request.user
        
        # Filter feedback to only show feedback for this user's sessions/talks
        # Assuming feedback is linked to sessions, and sessions are linked to speakers
        return Feedback.objects.filter(
            session__speaker__user_account=user
        )
```

### 2. Speaker Profile Endpoint (`/api/speakers/profile/`)

**Current behavior:** May return wrong speaker's profile  
**Required behavior:** Return ONLY the authenticated speaker's profile

```python
# Django/DRF example fix
class SpeakerProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get speaker profile for the authenticated user
            speaker_profile = SpeakerProfile.objects.get(
                speaker_user=request.user
            )
            serializer = SpeakerProfileSerializer(speaker_profile)
            return Response(serializer.data)
        except SpeakerProfile.DoesNotExist:
            return Response(
                {"error": "Speaker profile not found"},
                status=404
            )
```

### 3. Speaker Events/Sessions Endpoint

**Current behavior:** May show all events or wrong speaker's events  
**Required behavior:** Return ONLY events/sessions for the authenticated speaker

```python
# Django/DRF example fix
class SpeakerSessionsViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        return Session.objects.filter(speaker__user_account=user)
```

## Authentication Pattern

All protected endpoints should follow this pattern:

1. ✅ Extract user from JWT token: `user = request.user`
2. ✅ Filter queryset by that user: `.filter(speaker__user_account=user)` or similar
3. ✅ Never return data from other users
4. ✅ Return 404 if no data found for that user (not all data)

## Frontend API Calls (Already Correct)

The frontend is already correctly sending the Bearer token:

```typescript
// Example from feedbackApi.ts
async getCurrentSpeakerFeedback(): Promise<Feedback[]> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/feedbacks/`, {
        headers: {
            'Authorization': `Bearer ${token}`,  // ✅ Token is sent
            'Content-Type': 'application/json',
        },
    });
    return await response.json();
}
```

## Testing After Fix

1. Create two test speaker accounts: SpeakerA and SpeakerB
2. Create feedback for SpeakerA's sessions
3. Create feedback for SpeakerB's sessions
4. Log in as SpeakerA
5. Verify dashboard shows ONLY SpeakerA's data
6. Log in as SpeakerB
7. Verify dashboard shows ONLY SpeakerB's data
8. Each speaker should see DIFFERENT data

## Affected Endpoints (Need Filtering)

- ✅ `/api/feedbacks/` - Must filter by authenticated speaker
- ✅ `/api/speakers/profile/` - Must return only authenticated speaker's profile  
- ✅ `/api/sessions/` or `/api/events/` (if used) - Must filter by authenticated speaker
- ✅ Any stats/analytics endpoints - Must calculate only for authenticated speaker

## Security Note

This is a **data leak vulnerability**. Every speaker can currently see other speakers' private data including:
- Feedback ratings and comments
- Performance statistics  
- Event information
- Personal profile data

Please prioritize this fix immediately.

---

**Frontend Team:** The frontend code is correct and properly sending authentication tokens.  
**Backend Team:** Please filter ALL speaker-related endpoints by the authenticated user from the JWT token.
