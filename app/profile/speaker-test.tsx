"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { speakerApi } from "@/lib/api/speakerApi"

export default function SpeakerTestPage() {
    const { user } = useAuth()
    const [speakerData, setSpeakerData] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (user?.userType === 'speaker') {
            const testSpeakerAPI = async () => {
                try {
                    console.log("Testing speaker API...")
                    const profile = await speakerApi.getProfile()
                    console.log("Speaker profile:", profile)
                    setSpeakerData(profile)
                } catch (err) {
                    console.error("Speaker API error:", err)
                    setError(err.message)
                }
            }
            testSpeakerAPI()
        }
    }, [user])

    return (
        <div className="container py-10">
            <h1>Speaker Test Page</h1>
            <div>
                <h2>User Data:</h2>
                <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>
            <div>
                <h2>Speaker Profile Data:</h2>
                {error ? (
                    <p>Error: {error}</p>
                ) : (
                    <pre>{JSON.stringify(speakerData, null, 2)}</pre>
                )}
            </div>
        </div>
    )
}
