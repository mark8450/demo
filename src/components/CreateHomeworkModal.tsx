'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface CreateHomeworkModalProps {
  isOpen: boolean
  onClose: () => void
  classId: string
  onSuccess: () => void
}

export default function CreateHomeworkModal({ isOpen, onClose, classId, onSuccess }: CreateHomeworkModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    deadline: '',
    fileUrl: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a homework title')
      return
    }
    
    if (!formData.instructions.trim()) {
      toast.error('Please enter homework instructions')
      return
    }
    
    if (!formData.deadline) {
      toast.error('Please select a deadline')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          title: formData.title.trim(),
          instructions: formData.instructions.trim(),
          deadline: formData.deadline,
          fileUrl: formData.fileUrl.trim() || undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Homework created successfully!')
        setFormData({ title: '', instructions: '', deadline: '', fileUrl: '' })
        onClose()
        onSuccess()
      } else {
        toast.error(data.error || 'Failed to create homework')
      }
    } catch (error) {
      toast.error('Failed to create homework')
    } finally {
      setLoading(false)
    }
  }

  // Get tomorrow's date as minimum deadline
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDeadline = tomorrow.toISOString().split('T')[0]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Homework</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Homework Title</Label>
            <Input
              id="title"
              placeholder="e.g., Math Chapter 5 Exercises"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Enter detailed instructions for the homework..."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              min={minDeadline}
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">File URL (Optional)</Label>
            <Input
              id="fileUrl"
              type="url"
              placeholder="https://example.com/handout.pdf"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Homework'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}