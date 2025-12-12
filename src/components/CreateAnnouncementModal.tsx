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
      <DialogContent className="sm:max-w-[500px] backdrop-blur-sm bg-background/95 border border-primary/20 shadow-2xl shadow-primary/20 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground animate-title-glow">Create New Announcement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">Announcement Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your announcement message..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              required
              className="border-primary/20 focus:border-primary transition-colors resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fileUrl" className="text-sm font-medium">File URL (Optional)</Label>
            <Input
              id="fileUrl"
              type="url"
              placeholder="https://example.com/document.pdf"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              className="border-primary/20 focus:border-primary transition-colors"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
            >
              {loading ? 'Posting...' : 'Post Announcement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}