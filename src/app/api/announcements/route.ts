import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

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
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { classId, message, fileUrl } = body

    if (!classId || !message?.trim()) {
      return NextResponse.json({ error: 'Class ID and message are required' }, { status: 400 })
    }

    // Verify user owns this class
    const classRecord = await db.class.findFirst({
      where: {
        id: classId,
        teacherId: user.userId
      }
    })

    if (!classRecord) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 403 })
    }

    // Create announcement
    const announcement = await db.announcement.create({
      data: {
        classId,
        teacherId: user.userId,
        message: message.trim(),
        fileUrl: fileUrl?.trim() || null
      }
    })

    return NextResponse.json({ 
      success: true, 
      announcement: {
        id: announcement.id,
        message: announcement.message,
        fileUrl: announcement.fileUrl,
        createdAt: announcement.createdAt
      }
    })
  } catch (error) {
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

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    // Verify user has access to this class (teacher or enrolled student)
    const hasAccess = await db.studentClass.findFirst({
      where: {
        studentId: user.userId,
        classId: classId
      }
    }) || await db.class.findFirst({
      where: {
        id: classId,
        teacherId: user.userId
      }
    })

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get announcements for this class
    const announcements = await db.announcement.findMany({
      where: { classId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ announcements })

  } catch (error) {
    console.error('Get announcements error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}