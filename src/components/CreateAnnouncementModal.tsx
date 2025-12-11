'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface CreateAnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
  classId: string
  onSuccess: () => void
}

export default function CreateAnnouncementModal({ isOpen, onClose, classId, onSuccess }: CreateAnnouncementModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    message: '',
    fileUrl: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.message.trim()) {
      toast.error('Please enter an announcement message')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          message: formData.message.trim(),
          fileUrl: formData.fileUrl.trim() || undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Announcement posted successfully!')
        setFormData({ message: '', fileUrl: '' })
        onClose()
        onSuccess()
      } else {
        toast.error(data.error || 'Failed to post announcement')
      }
    } catch (error) {
      toast.error('Failed to post announcement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Announcement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Announcement Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your announcement message..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">File URL (Optional)</Label>
            <Input
              id="fileUrl"
              type="url"
              placeholder="https://example.com/document.pdf"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Announcement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}