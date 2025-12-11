import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

const createAnnouncementSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  title: z.string().min(1, 'Announcement title is required'),
  content: z.string().min(1, 'Announcement content is required')
})

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      role: string
    }
    return decoded
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can create announcements' }, { status: 403 })
    }

    const body = await request.json()
    const { classId, title, content } = createAnnouncementSchema.parse(body)

    // Verify teacher owns the class
    const classExists = await db.class.findFirst({
      where: {
        id: classId,
        teacherId: user.userId
      }
    })

    if (!classExists) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 })
    }

    // Create the announcement
    const announcement = await db.announcement.create({
      data: {
        classId,
        title,
        content
      }
    })

    return NextResponse.json({
      message: 'Announcement created successfully',
      announcement
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create announcement error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can view announcements' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    // Verify teacher owns the class
    const classExists = await db.class.findFirst({
      where: {
        id: classId,
        teacherId: user.userId
      }
    })

    if (!classExists) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 })
    }

    // Get all announcements for this class
    const announcements = await db.announcement.findMany({
      where: { classId: classId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ announcements })

  } catch (error) {
    console.error('Get teacher announcements error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}