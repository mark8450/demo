'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface CreateLessonModalProps {
  isOpen: boolean
  onClose: () => void
  classId: string
  onSuccess: () => void
}

export default function CreateLessonModal({ isOpen, onClose, classId, onSuccess }: CreateLessonModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    fileType: 'text' as 'pdf' | 'video' | 'text',
    fileUrl: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a lesson title')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          title: formData.title.trim(),
          content: formData.content.trim() || undefined,
          fileType: formData.fileType,
          fileUrl: formData.fileUrl.trim() || undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Lesson created successfully!')
        setFormData({ title: '', content: '', fileType: 'text', fileUrl: '' })
        onClose()
        onSuccess()
      } else {
        toast.error(data.error || 'Failed to create lesson')
      }
    } catch (error) {
      toast.error('Failed to create lesson')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Lesson</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Lesson Title</Label>
            <Input
              id="title"
              placeholder="e.g., Introduction to Algebra"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentType">Content Type</Label>
            <Select value={formData.fileType} onValueChange={(value: 'pdf' | 'video' | 'text') => setFormData({ ...formData, fileType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Lesson</SelectItem>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="video">Video Lesson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.fileType === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="content">Lesson Content</Label>
              <Textarea
                id="content"
                placeholder="Enter your lesson content here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
              />
            </div>
          )}

          {(formData.fileType === 'pdf' || formData.fileType === 'video') && (
            <div className="space-y-2">
              <Label htmlFor="fileUrl">File URL</Label>
              <Input
                id="fileUrl"
                type="url"
                placeholder="https://example.com/file.pdf"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Lesson'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}