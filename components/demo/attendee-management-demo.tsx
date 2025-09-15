"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, Users, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react"

export function AttendeeManagementDemo() {
  const [demoStep, setDemoStep] = useState(0)
  
  const demoSteps = [
    {
      title: "Select Event",
      description: "Choose an event to manage attendees",
      content: (
        <div className="space-y-4">
          <p>Organizers can select from their active events to manage attendees.</p>
          <div className="bg-muted p-4 rounded-lg">
            <select className="w-full p-2 border rounded">
              <option>TechConf 2025 (45 attendees)</option>
              <option>Innovation Summit (23 attendees)</option>
              <option>Developer Meetup (67 attendees)</option>
            </select>
          </div>
        </div>
      )
    },
    {
      title: "Download Sample CSV",
      description: "Get the correct format for attendee data",
      content: (
        <div className="space-y-4">
          <p>Before uploading, download a sample CSV to see the required format:</p>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <div>first_name,last_name,email,organization</div>
            <div>John,Doe,john.doe@example.com,Tech Corp</div>
            <div>Jane,Smith,jane.smith@example.com,Innovation Ltd</div>
          </div>
          <Button onClick={() => {}}>
            <Download className="h-4 w-4 mr-2" />
            Download Sample CSV
          </Button>
        </div>
      )
    },
    {
      title: "Upload Attendee List",
      description: "Upload your CSV file with attendee data",
      content: (
        <div className="space-y-4">
          <p>Select and upload your CSV file with attendee information:</p>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag and drop your CSV file here, or click to browse
            </p>
            <Button variant="outline" className="mt-2">
              Select File
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "Processing Status",
      description: "Track upload and processing progress",
      content: (
        <div className="space-y-4">
          <p>Monitor the processing of your uploaded attendee list:</p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">File uploaded successfully</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Processing attendees...</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">45 attendees processed successfully</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm">2 entries had errors (duplicate emails)</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Manage Attendees",
      description: "View and manage your attendee list",
      content: (
        <div className="space-y-4">
          <p>Search, filter, and manage your event attendees:</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <div className="font-medium">John Doe</div>
                <div className="text-sm text-muted-foreground">john.doe@example.com</div>
              </div>
              <Badge variant="default">Verified</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <div className="font-medium">Jane Smith</div>
                <div className="text-sm text-muted-foreground">jane.smith@example.com</div>
              </div>
              <Badge variant="secondary">Unverified</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <div className="font-medium">Mike Johnson</div>
                <div className="text-sm text-muted-foreground">mike.j@company.com</div>
              </div>
              <Badge variant="default">Verified</Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Upload History",
      description: "Track all upload attempts and their results",
      content: (
        <div className="space-y-4">
          <p>View history of all attendee uploads for this event:</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <div className="font-medium">Today, 2:30 PM</div>
                <div className="text-sm text-muted-foreground">attendees_batch_2.csv</div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Completed</span>
                </div>
                <div className="text-xs text-muted-foreground">45 success, 2 errors</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <div className="font-medium">Yesterday, 4:15 PM</div>
                <div className="text-sm text-muted-foreground">initial_attendees.csv</div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Completed</span>
                </div>
                <div className="text-xs text-muted-foreground">23 success, 0 errors</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const currentStep = demoSteps[demoStep]

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Attendee Management Demo</span>
            </CardTitle>
            <CardDescription>
              Step {demoStep + 1} of {demoSteps.length}: {currentStep.title}
            </CardDescription>
          </div>
          <Badge variant="outline">Demo Mode</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex space-x-2">
          {demoSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded ${
                index <= demoStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div>
          <h3 className="font-semibold mb-2">{currentStep.description}</h3>
          {currentStep.content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setDemoStep(Math.max(0, demoStep - 1))}
            disabled={demoStep === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setDemoStep(Math.min(demoSteps.length - 1, demoStep + 1))}
            disabled={demoStep === demoSteps.length - 1}
          >
            {demoStep === demoSteps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>

        {/* Feature Highlights */}
        {demoStep === demoSteps.length - 1 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Complete!</strong> The attendee management system provides comprehensive 
              tools for uploading, processing, and managing event attendees with detailed tracking 
              and error handling.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
