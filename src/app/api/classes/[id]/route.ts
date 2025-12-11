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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can delete classes' }, { status: 403 })
    }

    const { id: classId } = await params

    // First check if the class belongs to this teacher
    const classToDelete = await db.class.findFirst({
      where: {
        id: classId,
        teacherId: user.userId
      }
    })

    if (!classToDelete) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 })
    }

    // Delete the class (this will cascade delete related records due to foreign key constraints)
    await db.class.delete({
      where: {
        id: classId
      }
    })

    return NextResponse.json({ message: 'Class deleted successfully' })

  } catch (error) {
    console.error('Delete class error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      console.log('Class detail API: No token provided')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: classId } = await params
    console.log('Class detail API: Fetching class', classId, 'for user', user.userId, 'with role', user.role)

    // Get class details with teacher info and student count
    const classDetails = await db.class.findFirst({
      where: {
        id: classId,
        OR: [
          { teacherId: user.userId }, // Teacher viewing their own class
          { 
            studentClasses: {
              some: { studentId: user.userId }
            }
          } // Student viewing enrolled class
        ]
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
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
      }
    })

    console.log('Class detail API: Found class', classDetails ? 'YES' : 'NO')

    if (!classDetails) {
      console.log('Class detail API: Class not found or access denied')
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json({ class: classDetails })

  } catch (error) {
    console.error('Get class details error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}