import { db } from '@/lib/db'
import { generateUniqueParentCode } from '@/lib/parentCode'

async function generateParentCodesForExistingStudents() {
  try {
    console.log('Starting parent code generation for existing students...')
    
    // Get all students who are enrolled in classes but don't have parent codes
    const studentsWithoutParentCodes = await db.user.findMany({
      where: {
        role: 'student',
        parentCode: null
      },
      include: {
        studentClasses: {
          select: {
            classId: true
          }
        }
      }
    })
    
    console.log(`Found ${studentsWithoutParentCodes.length} students without parent codes`)
    
    let updatedCount = 0
    let errorCount = 0
    
    for (const student of studentsWithoutParentCodes) {
      try {
        // Generate unique parent code for each student
        const parentCode = await generateUniqueParentCode()
        
        // Update the student with the parent code
        await db.user.update({
          where: { id: student.id },
          data: { parentCode }
        })
        
        updatedCount++
        console.log(`Generated parent code ${parentCode} for student: ${student.name}`)
        
      } catch (error) {
        errorCount++
        console.error(`Failed to generate parent code for student ${student.name}:`, error)
      }
    }
    
    console.log(`Successfully updated ${updatedCount} students with parent codes`)
    console.log(`Failed to update ${errorCount} students`)
    
  } catch (error) {
    console.error('Error generating parent codes:', error)
  } finally {
    await db.$disconnect()
  }
}

// Run the function
generateParentCodesForExistingStudents()