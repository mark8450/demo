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
      return NextResponse.json({ error: 'Only students can view homework' }, { status: 403 })
    }

    const classId = params.id

    // Verify student is enrolled in the class
    const enrollment = await db.studentClass.findFirst({
      where: {
        studentId: user.userId,
        classId: classId
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this class' }, { status: 403 })
    }

    // Get all homework for this class with submissions
    const homework = await db.homework.findMany({
      where: { classId: classId },
      include: {
        submissions: {
          where: { studentId: user.userId },
          orderBy: { submittedAt: 'desc' }
        }
      },
      orderBy: { deadline: 'asc' }
    })

    return NextResponse.json({ homework })

  } catch (error) {
    console.error('Get student homework error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}