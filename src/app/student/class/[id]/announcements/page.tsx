'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowLeft, FileText, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Announcement {
  id: string
  message: string
  fileUrl?: string
  createdAt: string
}

export default function StudentAnnouncementsPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchAnnouncements(params.id as string)
    }
  }, [params.id])

  const fetchAnnouncements = async (classId: string) => {
    try {
      const response = await fetch(`/api/student/announcements/${classId}`)
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.announcements)
      }
    } catch (error) {
      toast.error('Failed to fetch announcements')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#3A6EA5]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-[#3A6EA5]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Class
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Announcements</h1>
            <p className="text-gray-600">Stay updated with class news and updates</p>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="max-w-7xl mx-auto">
        {announcements.length === 0 ? (
          <Card className="bg-white text-center p-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">No announcements yet</h3>
            <p className="text-gray-600">Your teacher hasn't posted any announcements for this class yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="bg-white hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-[#1A1A1A]">Class Announcement</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Posted {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">
                        {announcement.message}
                      </p>
                    </div>

                    {announcement.fileUrl && (
                      <div>
                        <h4 className="font-medium text-[#1A1A1A] mb-2">Attachment</h4>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(announcement.fileUrl, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Open Attachment
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}