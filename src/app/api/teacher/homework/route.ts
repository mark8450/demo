import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

const createHomeworkSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  title: z.string().min(1, 'Homework title is required'),
  description: z.string().min(1, 'Homework description is required'),
  deadline: z.string().min(1, 'Deadline is required')
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
      return NextResponse.json({ error: 'Only teachers can create homework' }, { status: 403 })
    }

    const body = await request.json()
    const { classId, title, description, deadline } = createHomeworkSchema.parse(body)

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

    // Create the homework
    const homework = await db.homework.create({
      data: {
        classId,
        title,
        description,
        deadline: new Date(deadline)
      }
    })

    return NextResponse.json({
      message: 'Homework created successfully',
      homework
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create homework error:', error)
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
      return NextResponse.json({ error: 'Only teachers can view homework' }, { status: 403 })
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

    // Get all homework for this class with submissions
    const homework = await db.homework.findMany({
      where: { classId: classId },
      include: {
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { deadline: 'asc' }
    })

    return NextResponse.json({ homework })

  } catch (error) {
    console.error('Get teacher homework error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}