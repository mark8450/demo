import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

const addChildSchema = z.object({
  parentCode: z.string().min(1, 'Parent code is required')
})

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      role: string
    }

    // Fetch the parent user to verify their role
    const parent = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!parent || parent.role !== 'parent') {
      return NextResponse.json(
        { error: 'Only parents can add children' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { parentCode } = addChildSchema.parse(body)

    // Find the student by their parent code
    const student = await db.user.findFirst({
      where: {
        parentCode: parentCode,
        role: 'student'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Invalid parent code' },
        { status: 404 }
      )
    }

    // Check if the parent link already exists
    const existingLink = await db.parentLink.findUnique({
      where: {
        parentId_studentId: {
          parentId: decoded.userId,
          studentId: student.id
        }
      }
    })

    if (existingLink) {
      return NextResponse.json(
        { error: 'Child already linked to your account' },
        { status: 400 }
      )
    }

    // Create the parent link (auto-approved for now)
    const parentLink = await db.parentLink.create({
      data: {
        parentId: decoded.userId,
        studentId: student.id,
        approved: true
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Child added successfully',
      child: parentLink.student
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error adding child:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}