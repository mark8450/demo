import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { z } from 'zod'
import { generateUniqueParentCode } from '@/lib/parentCode'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['teacher', 'student', 'parent'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate parent code for all new students
    let parentCode = null
    if (role === 'student') {
      parentCode = await generateUniqueParentCode()
    }

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        parentCode
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        parentCode: true,
        createdAt: true
      }
    })

    // For parents, ensure they start with a clean slate (no mock data)
    if (role === 'parent') {
      // No additional setup needed since we're now using real data
      // The parent dashboard will show "No children linked yet" initially
      console.log(`New parent registered: ${user.email} - Starting with clean dashboard`)
    }

    return NextResponse.json({
      message: 'User created successfully',
      user,
      ...(role === 'student' && {
        message: 'Student account created successfully. Share this parent code with their parent: ' + parentCode
      }),
      ...(role === 'parent' && {
        message: 'Parent account created successfully. You can now add children using their parent codes.'
      })
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}