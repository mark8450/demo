import { db } from '@/lib/db'

async function checkUserSchema() {
  try {
    // Check if parentCode field exists in User model
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        parentCode: true
      },
      take: 1
    })
    
    console.log('User schema check:', users[0])
    console.log('Has parentCode:', 'parentCode' in users[0])
    
  } catch (error) {
    console.error('Schema check error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkUserSchema()