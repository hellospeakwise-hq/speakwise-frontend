import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    // Build the API path from the slug array
    const apiPath = params.slug.join('/')
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    
    const apiUrl = `${API_BASE_URL}/${apiPath}/${searchParams ? `?${searchParams}` : ''}`
    
    console.log(`Proxying GET request to: ${apiUrl}`)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error proxying request to /${params.slug.join('/')}:`, error)
    return NextResponse.json(
      { error: `Failed to fetch ${params.slug.join('/')}` },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const apiPath = params.slug.join('/')
    const body = await request.json()
    
    const apiUrl = `${API_BASE_URL}/${apiPath}/`
    
    console.log(`Proxying POST request to: ${apiUrl}`)
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error proxying POST request to /${params.slug.join('/')}:`, error)
    return NextResponse.json(
      { error: `Failed to post to ${params.slug.join('/')}` },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const apiPath = params.slug.join('/')
    const body = await request.json()
    
    const apiUrl = `${API_BASE_URL}/${apiPath}/`
    
    console.log(`Proxying PUT request to: ${apiUrl}`)
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error proxying PUT request to /${params.slug.join('/')}:`, error)
    return NextResponse.json(
      { error: `Failed to update ${params.slug.join('/')}` },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const apiPath = params.slug.join('/')
    
    const apiUrl = `${API_BASE_URL}/${apiPath}/`
    
    console.log(`Proxying DELETE request to: ${apiUrl}`)
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // DELETE might return empty response
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      return new NextResponse(null, { status: 204 })
    }
  } catch (error) {
    console.error(`Error proxying DELETE request to /${params.slug.join('/')}:`, error)
    return NextResponse.json(
      { error: `Failed to delete ${params.slug.join('/')}` },
      { status: 500 }
    )
  }
}
