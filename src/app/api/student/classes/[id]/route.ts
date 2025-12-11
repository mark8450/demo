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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can view class details' }, { status: 403 })
    }

    const classId = params.id

    // Get student's class enrollment with full details
    const classDetail = await db.studentClass.findFirst({
      where: {
        studentId: user.userId,
        classId: classId
      },
      include: {
        class: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                lessons: true,
                homework: true,
                quizzes: true,
                announcements: true
              }
            }
          }
        }
      }
    })

    if (!classDetail) {
      return NextResponse.json({ error: 'Class enrollment not found' }, { status: 404 })
    }

    return NextResponse.json({ classDetail })

  } catch (error) {
    console.error('Get student class detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}