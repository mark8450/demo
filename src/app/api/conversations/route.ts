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

    // Get unique conversations with last message
    const conversations = await db.$queryRaw`
      WITH RankedMessages AS (
        SELECT 
          m.*,
          u_sender.name as sender_name,
          u_sender.role as sender_role,
          u_receiver.name as receiver_name,
          u_receiver.role as receiver_role,
          ROW_NUMBER() OVER (
            PARTITION BY 
              CASE 
                WHEN m.senderId = ${user.userId} THEN m.receiverId 
                ELSE m.senderId 
              END
            ORDER BY m.createdAt DESC
          ) as rn
        FROM Message m
        LEFT JOIN User u_sender ON m.senderId = u_sender.id
        LEFT JOIN User u_receiver ON m.receiverId = u_receiver.id
        WHERE m.senderId = ${user.userId} OR m.receiverId = ${user.userId}
      )
      SELECT 
        id,
        senderId,
        receiverId,
        content,
        fileUrl,
        read,
        createdAt,
        sender_name,
        sender_role,
        receiver_name,
        receiver_role
      FROM RankedMessages 
      WHERE rn = 1
      ORDER BY createdAt DESC
    ` as Array<{
      id: string
      senderId: string
      receiverId: string
      content: string
      fileUrl: string | null
      read: boolean
      createdAt: string
      sender_name: string
      sender_role: string
      receiver_name: string
      receiver_role: string
    }>

    // Format conversations
    const formattedConversations = conversations.map(conv => {
      const otherUser = conv.senderId === user.userId 
        ? { id: conv.receiverId, name: conv.receiver_name, role: conv.receiver_role }
        : { id: conv.senderId, name: conv.sender_name, role: conv.sender_role }

      return {
        id: conv.id,
        otherUser,
        lastMessage: conv.content,
        fileUrl: conv.fileUrl,
        timestamp: conv.createdAt,
        unread: conv.receiverId === user.userId && !conv.read
      }
    })

    return NextResponse.json({ conversations: formattedConversations })

  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}