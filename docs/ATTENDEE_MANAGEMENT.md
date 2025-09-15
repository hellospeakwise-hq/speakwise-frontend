# Attendee Management System

## Overview

The attendee management system allows organizers to upload and manage attendees for their events through a user-friendly interface. This system is integrated into the organizer dashboard and provides comprehensive functionality for attendee management.

## Features

### 1. CSV Upload
- **Format**: CSV files with columns: `first_name`, `last_name`, `email`, `organization` (optional)
- **Validation**: File type, size (max 5MB), and data format validation
- **Processing**: Automatic processing with success/error tracking
- **Sample Download**: Download a sample CSV template

### 2. Attendee List Display
- **Search**: Real-time search across name, email, and organization
- **Status Tracking**: Verified/Unverified status for each attendee
- **Sorting**: Sort by name, email, organization, or join date
- **Export**: Export attendee lists (future feature)

### 3. Upload History
- **Track Uploads**: Complete history of all CSV uploads
- **Status Monitoring**: Processing status with success/error counts
- **Error Logs**: Detailed error messages for failed uploads
- **Retry Functionality**: Re-process failed uploads (future feature)

## Usage

### For Organizers

1. **Navigate to Dashboard**: Go to the organizer dashboard
2. **Select Attendees Tab**: Click on the "Attendees" tab
3. **Choose Event**: Select an event from the dropdown
4. **Upload CSV**: Click "Upload Attendees" and select your CSV file
5. **Monitor Progress**: Track upload and processing status
6. **Review Results**: Check attendee list and any upload errors

### CSV Format Requirements

```csv
first_name,last_name,email,organization
John,Doe,john.doe@example.com,Tech Corp
Jane,Smith,jane.smith@example.com,Innovation Ltd
```

**Required Fields:**
- `first_name`: Attendee's first name
- `last_name`: Attendee's last name  
- `email`: Valid email address (must be unique)

**Optional Fields:**
- `organization`: Company or organization name

## API Endpoints

The frontend communicates with the following backend endpoints:

- `GET /api/events/{id}/attendees/` - Get attendees for an event
- `POST /api/events/{id}/attendees/upload/` - Upload CSV file
- `GET /api/events/{id}/attendees/uploads/` - Get upload history
- `GET /api/attendee-uploads/{id}/status/` - Get upload status
- `GET /api/attendees/by-email/{email}/` - Get attendee by email

## Components

### AttendeeManagement
Main component that provides the complete attendee management interface.

**Props:**
- `events: Event[]` - Array of organizer's events

**Features:**
- Event selection dropdown
- CSV upload dialog
- Attendee list with search
- Upload history tracking

### useAttendeeManagement Hook
Custom hook for managing attendee state and API calls.

**Parameters:**
- `eventId: number | null` - Selected event ID

**Returns:**
- `attendees` - Array of attendees
- `uploads` - Array of upload records
- `loading` - Loading state
- `error` - Error message
- `uploadCSV` - Function to upload CSV
- `refreshData` - Function to refresh data

## Error Handling

### Upload Errors
- Invalid file format
- File size too large
- Duplicate email addresses
- Missing required fields
- Server processing errors

### Display Errors
- Network connectivity issues
- Authentication failures
- Authorization errors
- Data loading failures

## Future Enhancements

1. **Bulk Actions**: Select multiple attendees for bulk operations
2. **Email Integration**: Send invitations or notifications to attendees
3. **QR Code Generation**: Generate unique QR codes for attendees
4. **Check-in System**: Track attendee check-ins at events
5. **Analytics**: Attendee statistics and reports
6. **Import from Other Sources**: Integration with external platforms
7. **Advanced Search**: Filter by verification status, organization, etc.
8. **Export Options**: Export to various formats (PDF, Excel, etc.)

## Security Considerations

- File upload validation and sanitization
- Email uniqueness enforcement
- Access control (organizers can only manage their own events)
- Rate limiting on uploads
- Secure file storage and processing

## Testing

### Manual Testing
1. Upload various CSV formats (valid and invalid)
2. Test with large files and many attendees
3. Verify search functionality
4. Check error handling and user feedback
5. Test upload history and error logs

### Automated Testing
- Unit tests for API functions
- Integration tests for upload flow
- E2E tests for user workflows
- Performance tests for large uploads
