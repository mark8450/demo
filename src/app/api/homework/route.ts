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

    // Get homework for this class
    const homework = await db.homework.findMany({
      where: { classId },
      include: {
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { deadline: 'asc' }
    })

    return NextResponse.json({ homework })

  } catch (error) {
    console.error('Get homework error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}