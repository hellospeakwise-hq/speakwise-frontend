"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Users, FileText, Download, Search, AlertCircle, CheckCircle, Clock, X } from "lucide-react"
import { toast } from "sonner"
import { type Event } from "@/lib/api/eventsApi"
import { useAttendeeManagement } from "@/hooks/use-attendee-management"
import type { AttendeeUpload } from "@/lib/api/attendeeApi"

interface AttendeeManagementProps {
  events: Event[]
}

export function AttendeeManagement({ events }: AttendeeManagementProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const activeEvents = events.filter(event => event.is_active)
  const selectedEvent = activeEvents.find(e => e.id === selectedEventId)
  
  const {
    attendees,
    uploads,
    loading,
    error,
    uploadCSV,
    refreshData
  } = useAttendeeManagement(selectedEventId)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setUploadError('Please select a CSV file')
        toast.error('Invalid file type. Please select a CSV file.')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB')
        toast.error('File size must be less than 5MB')
        return
      }
      
      setSelectedFile(file)
      setUploadError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedEventId) return
    
    setUploading(true)
    
    // Show uploading toast
    const uploadingToast = toast.loading('Uploading attendees...', {
      description: 'Please wait while we process your CSV file'
    })
    
    try {
      const result = await uploadCSV(selectedFile)
      
      // Dismiss uploading toast
      toast.dismiss(uploadingToast)
      
      // Close dialog and reset state
      setUploadDialogOpen(false)
      setSelectedFile(null)
      setUploadError(null)
      
      // Force refresh the data
      await refreshData()
      
      // Show success toast
      toast.success('Attendees uploaded successfully!', {
        description: `File processed successfully. Refreshing attendee list...`,
        duration: 4000,
      })
      
    } catch (err) {
      // Dismiss uploading toast
      toast.dismiss(uploadingToast)
      
      console.error('Error uploading file:', err)
      const errorMessage = 'Failed to upload file. Please check the format and try again.'
      setUploadError(errorMessage)
      
      toast.error('Upload failed', {
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadSampleCSV = () => {
    const csvContent = "first_name,last_name,email,organization\nJohn,Doe,john.doe@example.com,Tech Corp\nJane,Smith,jane.smith@example.com,Innovation Ltd"
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'attendees_sample.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Filter attendees based on search term
  const filteredAttendees = attendees.filter(attendee =>
    attendee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (attendee.organization || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getUploadStatusIcon = (upload: AttendeeUpload) => {
    if (!upload.processed) {
      return <Clock className="h-4 w-4 text-yellow-500" />
    } else if (upload.error_count > 0) {
      return <AlertCircle className="h-4 w-4 text-orange-500" />
    } else {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getUploadStatusText = (upload: AttendeeUpload) => {
    if (!upload.processed) return "Processing"
    if (upload.error_count > 0) return "Completed with errors"
    return "Completed successfully"
  }

  if (!activeEvents.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendee Management</CardTitle>
          <CardDescription>Upload and manage attendee lists for your events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active events found. Create an event first to manage attendees.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
          <CardDescription>Choose an event to manage its attendees</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedEventId?.toString() || ""}
            onValueChange={(value) => {
              const eventId = parseInt(value)
              setSelectedEventId(eventId || null)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {activeEvents.map((event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.title} ({event.attendees} attendees)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEvent && (
        <div className="space-y-6">
          {/* Event Info & Actions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedEvent.title}</CardTitle>
                  <CardDescription>
                    {selectedEvent.attendees} attendees • {selectedEvent.date}
                  </CardDescription>
                </div>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Attendees
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Attendee List</DialogTitle>
                      <DialogDescription>
                        Upload a CSV file with attendee information for {selectedEvent.title}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">CSV Format Required:</p>
                        <p className="text-sm text-muted-foreground">
                          first_name, last_name, email, organization (optional)
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadSampleCSV}
                          className="mt-2"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Sample CSV
                        </Button>
                      </div>
                      
                      <div>
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={handleFileSelect}
                          className="cursor-pointer"
                        />
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                          </p>
                        )}
                      </div>
                      
                      {uploadError && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{uploadError}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadDialogOpen(false)
                          setSelectedFile(null)
                          setUploadError(null)
                        }}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          {/* Tabs for Attendees and Upload History */}
          <Tabs defaultValue="attendees" className="space-y-4">
            <TabsList>
              <TabsTrigger value="attendees">
                <Users className="h-4 w-4 mr-2" />
                Attendees ({attendees.length})
              </TabsTrigger>
              <TabsTrigger value="uploads">
                <FileText className="h-4 w-4 mr-2" />
                Upload History ({uploads.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attendees">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Event Attendees</CardTitle>
                      <CardDescription>List of all registered attendees</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search attendees..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading attendees...</div>
                  ) : filteredAttendees.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Organization</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAttendees.map((attendee) => (
                          <TableRow key={attendee.id}>
                            <TableCell className="font-medium">
                              {attendee.first_name} {attendee.last_name}
                            </TableCell>
                            <TableCell>{attendee.email}</TableCell>
                            <TableCell>{attendee.organization || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={attendee.is_verified ? "default" : "secondary"}>
                                {attendee.is_verified ? "Verified" : "Unverified"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(attendee.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No attendees found matching your search.' : 'No attendees uploaded yet.'}
                      </p>
                      {!searchTerm && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setUploadDialogOpen(true)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload First Attendee List
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="uploads">
              <Card>
                <CardHeader>
                  <CardTitle>Upload History</CardTitle>
                  <CardDescription>Track all attendee list uploads for this event</CardDescription>
                </CardHeader>
                <CardContent>
                  {uploads.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Success</TableHead>
                          <TableHead>Errors</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploads.map((upload) => (
                          <TableRow key={upload.id}>
                            <TableCell>
                              {new Date(upload.uploaded_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getUploadStatusIcon(upload)}
                                <span>{getUploadStatusText(upload)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default">{upload.success_count}</Badge>
                            </TableCell>
                            <TableCell>
                              {upload.error_count > 0 && (
                                <Badge variant="destructive">{upload.error_count}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {upload.error_log && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      View Errors
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Upload Errors</DialogTitle>
                                      <DialogDescription>
                                        Errors from upload on {new Date(upload.uploaded_at).toLocaleString()}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="max-h-96 overflow-y-auto">
                                      <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap">
                                        {upload.error_log}
                                      </pre>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No uploads yet for this event.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
