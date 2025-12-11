// Utility functions for generating and managing parent codes

/**
 * Generates a unique parent code for a student
 * Format: PARENT-XXXXXX (6 random alphanumeric characters)
 */
export function generateParentCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'PARENT-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Generates a unique parent code, ensuring it doesn't exist in the database
 */
export async function generateUniqueParentCode(): Promise<string> {
  const { db } = await import('@/lib/db')
  
  let code: string
  let attempts = 0
  const maxAttempts = 10
  
  do {
    code = generateParentCode()
    const existing = await db.user.findUnique({
      where: { parentCode: code },
      select: { id: true }
    })
    
    if (!existing) {
      return code
    }
    
    attempts++
  } while (attempts < maxAttempts)
  
  // Fallback to timestamp-based code if random generation fails
  return `PARENT-${Date.now().toString(36).toUpperCase()}`
}

/**
 * Generates a unique class code for a class
 * Format: CLASS-XXXXXX (6 random alphanumeric characters)
 */
export function generateClassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'CLASS-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Generates a unique class code, ensuring it doesn't exist in database
 */
export async function generateUniqueClassCode(): Promise<string> {
  const { db } = await import('@/lib/db')
  
  let code: string
  let attempts = 0
  const maxAttempts = 10
  
  do {
    code = generateClassCode()
    const existing = await db.class.findUnique({
      where: { classCode: code },
      select: { id: true }
    })
    
    if (!existing) {
      return code
    }
    
    attempts++
  } while (attempts < maxAttempts)
  
  // Fallback to timestamp-based code if random generation fails
  return `CLASS-${Date.now().toString(36).toUpperCase()}`
}