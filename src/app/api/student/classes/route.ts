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

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can view their classes' }, { status: 403 })
    }

    const studentClasses = await db.studentClass.findMany({
      where: { studentId: user.userId },
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ classes: studentClasses })

  } catch (error) {
    console.error('Get student classes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}