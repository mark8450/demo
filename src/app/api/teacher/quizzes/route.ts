import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

const createQuizSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  title: z.string().min(1, 'Quiz title is required'),
  description: z.string().optional(),
  timeLimit: z.number().min(1).optional()
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
      return NextResponse.json({ error: 'Only teachers can create quizzes' }, { status: 403 })
    }

    const body = await request.json()
    const { classId, title, description, timeLimit } = createQuizSchema.parse(body)

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

    // Create the quiz
    const quiz = await db.quiz.create({
      data: {
        classId,
        title,
        description,
        timeLimit: timeLimit || null
      }
    })

    return NextResponse.json({
      message: 'Quiz created successfully',
      quiz
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create quiz error:', error)
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
      return NextResponse.json({ error: 'Only teachers can view quizzes' }, { status: 403 })
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

    // Get all quizzes for this class with questions and results
    const quizzes = await db.quiz.findMany({
      where: { classId: classId },
      include: {
        questions: true,
        results: {
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
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ quizzes })

  } catch (error) {
    console.error('Get teacher quizzes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}