"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function FeedbackTrends() {
  const [period, setPeriod] = useState("6months")

  // Sample data - in a real app, this would come from an API
  const trendData = {
    "3months": {
      labels: ["Jan", "Feb", "Mar"],
      overall: [4.5, 4.7, 4.8],
      content: [4.6, 4.8, 4.9],
      delivery: [4.4, 4.6, 4.7],
      engagement: [4.5, 4.7, 4.8],
    },
    "6months": {
      labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
      overall: [4.3, 4.4, 4.5, 4.5, 4.7, 4.8],
      content: [4.4, 4.5, 4.5, 4.6, 4.8, 4.9],
      delivery: [4.2, 4.3, 4.4, 4.4, 4.6, 4.7],
      engagement: [4.3, 4.4, 4.6, 4.5, 4.7, 4.8],
    },
    "1year": {
      labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
      overall: [4.0, 4.1, 4.2, 4.2, 4.3, 4.3, 4.3, 4.4, 4.5, 4.5, 4.7, 4.8],
      content: [4.1, 4.2, 4.3, 4.3, 4.4, 4.4, 4.4, 4.5, 4.5, 4.6, 4.8, 4.9],
      delivery: [3.9, 4.0, 4.1, 4.1, 4.2, 4.2, 4.2, 4.3, 4.4, 4.4, 4.6, 4.7],
      engagement: [4.0, 4.1, 4.2, 4.2, 4.3, 4.3, 4.3, 4.4, 4.6, 4.5, 4.7, 4.8],
    },
  }

  const currentData = trendData[period as keyof typeof trendData]
  const maxValue = 5
  const chartHeight = 200

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Feedback Trends</CardTitle>
          <CardDescription>Track your performance over time</CardDescription>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 months</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overall">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="pt-4">
            <div className="relative h-[200px]">
              <div className="absolute inset-0">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-muted-foreground">
                  <div>5.0</div>
                  <div>4.5</div>
                  <div>4.0</div>
                  <div>3.5</div>
                  <div>3.0</div>
                </div>

                {/* Chart area */}
                <div className="absolute left-10 right-0 top-0 bottom-0">
                  {/* Horizontal grid lines */}
                  <div className="absolute left-0 right-0 top-0 h-px bg-border"></div>
                  <div className="absolute left-0 right-0 top-1/4 h-px bg-border"></div>
                  <div className="absolute left-0 right-0 top-2/4 h-px bg-border"></div>
                  <div className="absolute left-0 right-0 top-3/4 h-px bg-border"></div>
                  <div className="absolute left-0 right-0 bottom-0 h-px bg-border"></div>

                  {/* Line chart */}
                  <svg
                    className="absolute inset-0"
                    viewBox={`0 0 ${currentData.labels.length * 50} ${chartHeight}`}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(249, 115, 22)" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Area under the line */}
                    <path
                      d={`
                        M 0 ${chartHeight - (currentData.overall[0] / maxValue) * chartHeight}
                        ${currentData.overall
                          .map((value, index) => `L ${index * 50} ${chartHeight - (value / maxValue) * chartHeight}`)
                          .join(" ")}
                        L ${(currentData.labels.length - 1) * 50} ${chartHeight}
                        L 0 ${chartHeight}
                        Z
                      `}
                      fill="url(#gradient)"
                    />

                    {/* Line */}
                    <path
                      d={`
                        M 0 ${chartHeight - (currentData.overall[0] / maxValue) * chartHeight}
                        ${currentData.overall
                          .map((value, index) => `L ${index * 50} ${chartHeight - (value / maxValue) * chartHeight}`)
                          .join(" ")}
                      `}
                      fill="none"
                      stroke="rgb(249, 115, 22)"
                      strokeWidth="2"
                    />

                    {/* Data points */}
                    {currentData.overall.map((value, index) => (
                      <circle
                        key={index}
                        cx={index * 50}
                        cy={chartHeight - (value / maxValue) * chartHeight}
                        r="4"
                        fill="white"
                        stroke="rgb(249, 115, 22)"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>

                  {/* X-axis labels */}
                  <div className="absolute left-0 right-0 bottom-[-25px] flex justify-between text-xs text-muted-foreground">
                    {currentData.labels.map((label, index) => (
                      <div
                        key={index}
                        style={{
                          position: "absolute",
                          left: `${(index / (currentData.labels.length - 1)) * 100}%`,
                          transform: "translateX(-50%)",
                        }}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {currentData.overall[currentData.overall.length - 1]}
                </div>
                <div className="text-xs text-muted-foreground">Current Rating</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +{(currentData.overall[currentData.overall.length - 1] - currentData.overall[0]).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Improvement</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">
                  {currentData.overall.reduce((sum, value) => sum + value, 0) / currentData.overall.length}
                </div>
                <div className="text-xs text-muted-foreground">Average</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">{Math.min(...currentData.overall)}</div>
                <div className="text-xs text-muted-foreground">Lowest</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">{Math.max(...currentData.overall)}</div>
                <div className="text-xs text-muted-foreground">Highest</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="pt-4">
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">Content rating trends chart would appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="pt-4">
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">Delivery rating trends chart would appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="pt-4">
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">Engagement rating trends chart would appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
