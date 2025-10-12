"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { feedbackAPI, type Feedback } from "@/lib/api/feedbackApi"

interface TrendData {
  labels: string[]
  overall: number[]
  content: number[]
  clarity: number[]
  engagement: number[]
  knowledge: number[]
  practical: number[]
}

export function FeedbackTrends() {
  const [period, setPeriod] = useState("6months")
  const [trendData, setTrendData] = useState<Record<string, TrendData>>({
    "3months": { labels: [], overall: [], content: [], clarity: [], engagement: [], knowledge: [], practical: [] },
    "6months": { labels: [], overall: [], content: [], clarity: [], engagement: [], knowledge: [], practical: [] },
    "1year": { labels: [], overall: [], content: [], clarity: [], engagement: [], knowledge: [], practical: [] },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        const feedbackData = await feedbackAPI.getCurrentSpeakerFeedback()
        
        console.log('Fetched feedback data:', feedbackData)
        
        if (feedbackData.length === 0) {
          setLoading(false)
          return
        }

        // Process data for different time periods
        const processedData = processFeedbackByPeriod(feedbackData)
        
        console.log('Processed data for 6 months:', processedData["6months"])
        
        // If we have feedback but no trend data (missing dates), create a snapshot view
        if (processedData["6months"].labels.length === 0 && feedbackData.length > 0) {
          console.log('Creating snapshot view from current feedback')
          console.log('Raw feedback items:', feedbackData.map(f => ({
            overall: f.overall_rating,
            content: f.content_depth,
            clarity: f.clarity,
            engagement: f.engagement,
            knowledge: f.speaker_knowledge,
            practical: f.practical_relevance
          })))
          
          const avgRatings = {
            overall: feedbackData.reduce((sum, item) => sum + item.overall_rating, 0) / feedbackData.length,
            content: feedbackData.reduce((sum, item) => sum + item.content_depth, 0) / feedbackData.length,
            clarity: feedbackData.reduce((sum, item) => sum + item.clarity, 0) / feedbackData.length,
            engagement: feedbackData.reduce((sum, item) => sum + item.engagement, 0) / feedbackData.length,
            knowledge: feedbackData.reduce((sum, item) => sum + item.speaker_knowledge, 0) / feedbackData.length,
            practical: feedbackData.reduce((sum, item) => sum + item.practical_relevance, 0) / feedbackData.length,
          }
          
          console.log('Calculated averages:', avgRatings)
          
          // Create a simple current month view
          const now = new Date()
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          const currentMonth = monthNames[now.getMonth()]
          
          setTrendData({
            "3months": {
              labels: [currentMonth],
              overall: [avgRatings.overall],
              content: [avgRatings.content],
              clarity: [avgRatings.clarity],
              engagement: [avgRatings.engagement],
              knowledge: [avgRatings.knowledge],
              practical: [avgRatings.practical],
            },
            "6months": {
              labels: [currentMonth],
              overall: [avgRatings.overall],
              content: [avgRatings.content],
              clarity: [avgRatings.clarity],
              engagement: [avgRatings.engagement],
              knowledge: [avgRatings.knowledge],
              practical: [avgRatings.practical],
            },
            "1year": {
              labels: [currentMonth],
              overall: [avgRatings.overall],
              content: [avgRatings.content],
              clarity: [avgRatings.clarity],
              engagement: [avgRatings.engagement],
              knowledge: [avgRatings.knowledge],
              practical: [avgRatings.practical],
            },
          })
        } else {
          setTrendData(processedData)
        }
      } catch (error) {
        console.error('Error fetching trend data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendData()
  }, [])

  const processFeedbackByPeriod = (feedback: Feedback[]): Record<string, TrendData> => {
    const now = new Date()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    console.log('Processing feedback for trends:', feedback) // Debug log
    
    const groupByMonth = (months: number) => {
      const monthlyData: Record<string, Feedback[]> = {}
      
      feedback.forEach(item => {
        // Handle potentially missing or invalid created_at
        if (!item.created_at) {
          console.warn('Feedback item missing created_at:', item)
          // Use current date as fallback
          const monthKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = []
          }
          monthlyData[monthKey].push(item)
          return
        }
        
        const date = new Date(item.created_at)
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid date for feedback:', item.created_at)
          // Use current date as fallback
          const monthKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = []
          }
          monthlyData[monthKey].push(item)
          return
        }
        
        const monthsAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30))
        
        console.log(`Feedback date: ${date.toISOString()}, Months ago: ${monthsAgo}, Period: ${months}`) // Debug
        
        // Include feedback within the period OR if it's recent (within last year always show something)
        if (monthsAgo < months || months >= 12) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = []
          }
          monthlyData[monthKey].push(item)
        }
      })
      
      console.log('Monthly data grouped:', monthlyData) // Debug
      
      // Sort by date and create arrays
      const sortedKeys = Object.keys(monthlyData).sort()
      const labels: string[] = []
      const overall: number[] = []
      const content: number[] = []
      const clarity: number[] = []
      const engagement: number[] = []
      const knowledge: number[] = []
      const practical: number[] = []
      
      sortedKeys.forEach(key => {
        const [year, month] = key.split('-')
        labels.push(monthNames[parseInt(month)])
        
        const items = monthlyData[key]
        overall.push(items.reduce((sum, item) => sum + item.overall_rating, 0) / items.length)
        content.push(items.reduce((sum, item) => sum + item.content_depth, 0) / items.length)
        clarity.push(items.reduce((sum, item) => sum + item.clarity, 0) / items.length)
        engagement.push(items.reduce((sum, item) => sum + item.engagement, 0) / items.length)
        knowledge.push(items.reduce((sum, item) => sum + item.speaker_knowledge, 0) / items.length)
        practical.push(items.reduce((sum, item) => sum + item.practical_relevance, 0) / items.length)
      })
      
      console.log('Final trend data:', { labels, overall, content, clarity, engagement }) // Debug
      
      return { labels, overall, content, clarity, engagement, knowledge, practical }
    }
    
    return {
      "3months": groupByMonth(3),
      "6months": groupByMonth(6),
      "1year": groupByMonth(12),
    }
  }

  const currentData = trendData[period as keyof typeof trendData]
  const maxValue = 10  // Changed from 5 to 10 for the new scale
  const chartHeight = 200

  const renderChart = (data: number[], labels: string[], title: string) => {
    if (data.length === 0) {
      return (
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">No {title.toLowerCase()} data available yet</p>
        </div>
      )
    }

    // Not enough points for a trend: show a clean snapshot instead of a stretched line
    if (data.length < 2) {
      const value = data[0]
      const percent = Math.max(0, Math.min(100, (value / maxValue) * 100))
      return (
        <div className="space-y-6">
          <div className="rounded-lg border border-orange-900/20 bg-gradient-to-b from-orange-500/5 to-transparent p-6">
            <div className="mb-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{value.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">/ {maxValue}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Not enough data to display a trend for {title.toLowerCase()} yet. Collect more feedback to unlock insights.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{value.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">+0.0</div>
              <div className="text-xs text-muted-foreground">Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{value.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Average</div>
            </div>
          </div>
        </div>
      )
    }

    // For 2+ points, render full line chart
    const displayData = data
    const displayLabels = labels
    const chartWidth = Math.max(displayLabels.length * 50, 300) // Minimum width

    return (
      <>
        <div className="relative h-[200px]">
          <div className="absolute inset-0">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-muted-foreground">
              <div>10</div>
              <div>8</div>
              <div>6</div>
              <div>4</div>
              <div>2</div>
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
                className="absolute inset-0 w-full h-full"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(249, 115, 22)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Area under the line */}
                <path
                  d={`
                    M 0 ${chartHeight - (displayData[0] / maxValue) * chartHeight}
                    ${displayData.map((value, index) => {
                      const x = data.length === 1 
                        ? (index * (chartWidth / 2)) // Spread across full width for single point
                        : (index * (chartWidth / (displayData.length - 1)))
                      const y = chartHeight - (value / maxValue) * chartHeight
                      return `L ${x} ${y}`
                    }).join(" ")}
                    L ${chartWidth} ${chartHeight}
                    L 0 ${chartHeight}
                    Z
                  `}
                  fill={`url(#gradient-${title})`}
                />

                {/* Line */}
                <path
                  d={`
                    M 0 ${chartHeight - (displayData[0] / maxValue) * chartHeight}
                    ${displayData.map((value, index) => {
                      const x = data.length === 1 
                        ? (index * (chartWidth / 2))
                        : (index * (chartWidth / (displayData.length - 1)))
                      const y = chartHeight - (value / maxValue) * chartHeight
                      return `L ${x} ${y}`
                    }).join(" ")}
                  `}
                  fill="none"
                  stroke="rgb(249, 115, 22)"
                  strokeWidth="3"
                />

                {/* Data points */}
                {displayData.map((value, index) => {
                  const x = data.length === 1 
                    ? (index * (chartWidth / 2))
                    : (index * (chartWidth / (displayData.length - 1)))
                  const y = chartHeight - (value / maxValue) * chartHeight
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="6"
                      fill="white"
                      stroke="rgb(249, 115, 22)"
                      strokeWidth="3"
                    />
                  )
                })}
              </svg>

              {/* X-axis labels */}
              <div className="absolute left-0 right-0 bottom-[-25px] flex justify-between text-xs text-muted-foreground">
                {displayLabels.map((label, index) => {
                  if (!label) return null // Skip empty labels
                  const position = data.length === 1 
                    ? 50 // Center for single data point
                    : (index / (displayLabels.length - 1)) * 100
                  
                  return (
                    <div
                      key={index}
                      style={{
                        position: "absolute",
                        left: `${position}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      {label}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {data[data.length - 1].toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Current Rating</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data[data.length - 1] - data[0] >= 0 ? '+' : ''}{(data[data.length - 1] - data[0]).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Improvement</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold">
              {(data.reduce((sum, value) => sum + value, 0) / data.length).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Average</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold">{Math.min(...data).toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Lowest</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold">{Math.max(...data).toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Highest</div>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Trends</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading trend data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (currentData.labels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Trends</CardTitle>
          <CardDescription>Track your performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">No feedback data available yet. Start speaking at events to see your trends!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

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
            {renderChart(currentData.overall, currentData.labels, "Overall")}
          </TabsContent>

          <TabsContent value="content" className="pt-4">
            {renderChart(currentData.content, currentData.labels, "Content")}
          </TabsContent>

          <TabsContent value="delivery" className="pt-4">
            {renderChart(currentData.clarity, currentData.labels, "Clarity")}
          </TabsContent>

          <TabsContent value="engagement" className="pt-4">
            {renderChart(currentData.engagement, currentData.labels, "Engagement")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
