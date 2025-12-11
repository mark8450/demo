import { db } from '@/lib/db'

async function clearParentChildRelationships() {
  try {
    console.log('Clearing all parent-child relationships...')
    
    // Delete all ParentLink records
    const result = await db.parentLink.deleteMany({})
    
    console.log(`Successfully deleted ${result.count} parent-child relationships`)
    console.log('Parent accounts will now show no children')
    
  } catch (error) {
    console.error('Error clearing parent-child relationships:', error)
  } finally {
    await db.$disconnect()
  }
}

// Run the function
clearParentChildRelationships()