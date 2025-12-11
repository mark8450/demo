import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

const joinClassSchema = z.object({
  classCode: z.string().min(1, 'Class code is required')
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

    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can join classes' }, { status: 403 })
    }

    const body = await request.json()
    const { classCode } = joinClassSchema.parse(body)

    // Find class with the given code
    const classToJoin = await db.class.findUnique({
      where: { classCode: classCode.toUpperCase() }
    })

    if (!classToJoin) {
      return NextResponse.json({ error: 'Invalid class code' }, { status: 404 })
    }

    // Check if student is already enrolled
    const existingEnrollment = await db.studentClass.findFirst({
      where: {
        studentId: user.userId,
        classId: classToJoin.id
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled in this class' }, { status: 400 })
    }

    // Enroll student in class
    const enrollment = await db.studentClass.create({
      data: {
        studentId: user.userId,
        classId: classToJoin.id
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
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Successfully joined class',
      enrollment
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Join class error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}