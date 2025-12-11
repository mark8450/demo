import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { generateClassCode } from '@/lib/parentCode'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  grade: z.string().min(1, 'Grade level is required')
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

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can view classes' }, { status: 403 })
    }

    const classes = await db.class.findMany({
      where: { teacherId: user.userId },
      include: {
        studentClasses: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                parentCode: true
              }
            }
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ classes })

  } catch (error) {
    console.error('Get classes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can create classes' }, { status: 403 })
    }

    const body = await request.json()
    const { name, grade } = createClassSchema.parse(body)

    // Generate unique class code
    const classCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    console.log('Generated class code:', classCode)
    console.log('Creating class for teacher:', user.userId)
    console.log('Class data:', { name, grade, classCode, teacherId: user.userId })

    const newClass = await db.class.create({
      data: {
        name,
        grade,
        classCode,
        teacherId: user.userId
      }
    })

    return NextResponse.json({
      message: 'Class created successfully',
      class: newClass
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create class error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}