import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

const sendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1, 'Message content is required'),
  fileUrl: z.string().optional()
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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let messages

    if (userId) {
      // Get conversation with specific user
      messages = await db.message.findMany({
        where: {
          OR: [
            { senderId: user.userId, receiverId: userId },
            { senderId: userId, receiverId: user.userId }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      })
    } else {
      // Get all conversations for the user
      messages = await db.message.findMany({
        where: {
          OR: [
            { senderId: user.userId },
            { receiverId: user.userId }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ messages })

  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { receiverId, content, fileUrl } = sendMessageSchema.parse(body)

    // Create message
    const message = await db.message.create({
      data: {
        senderId: user.userId,
        receiverId,
        content,
        fileUrl
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Message sent successfully',
      data: message
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}