import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export async function GET(request: NextRequest) {
  try {
    // Get the token from cookies
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
        { error: 'Only parents can access children data' },
        { status: 403 }
      )
    }

    // Fetch parent links with student details
    const parentLinks = await db.parentLink.findMany({
      where: { 
        parentId: decoded.userId,
        approved: true 
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            studentClasses: {
              include: {
                class: {
                  select: {
                    id: true,
                    name: true,
                    grade: true,
                    teacher: {
                      select: {
                        name: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    // Transform the data to include additional information
    const children = parentLinks.map(link => ({
      id: link.student.id,
      name: link.student.name,
      email: link.student.email,
      grade: link.student.studentClasses[0]?.class?.grade || 'Not assigned',
      classes: link.student.studentClasses.map(sc => ({
        id: sc.class.id,
        name: sc.class.name,
        grade: sc.class.grade,
        teacher: sc.class.teacher.name
      })),
      linkedAt: link.createdAt
    }))

    return NextResponse.json({
      children,
      parent: {
        id: parent.id,
        name: parent.name,
        email: parent.email
      }
    })

  } catch (error) {
    console.error('Error fetching children data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}