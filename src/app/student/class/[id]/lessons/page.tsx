'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, FileText, ArrowLeft, Calendar, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Lesson {
  id: string
  title: string
  content?: string
  fileType?: 'pdf' | 'video' | 'text'
  fileUrl?: string
  createdAt: string
}

export default function StudentLessonsPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchLessons(params.id as string)
    }
  }, [params.id])

  const fetchLessons = async (classId: string) => {
    try {
      const response = await fetch(`/api/student/lessons/${classId}`)
      if (response.ok) {
        const data = await response.json()
        setLessons(data.lessons)
      }
    } catch (error) {
      toast.error('Failed to fetch lessons')
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
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Lessons</h1>
            <p className="text-gray-600">View all available lessons for your class</p>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="max-w-7xl mx-auto">
        {lessons.length === 0 ? (
          <Card className="bg-white text-center p-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">No lessons yet</h3>
            <p className="text-gray-600">Your teacher hasn't posted any lessons for this class yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="bg-white hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-[#1A1A1A]">{lesson.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        {lesson.fileType && (
                          <Badge variant="secondary" className="text-xs">
                            {lesson.fileType === 'pdf' && 'PDF'}
                            {lesson.fileType === 'video' && 'Video'}
                            {lesson.fileType === 'text' && 'Text'}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          Posted {new Date(lesson.createdAt).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {lesson.fileType === 'video' && (
                        <Badge variant="secondary" className="bg-[#FFC857] text-white">
                          <Clock className="w-3 h-3 mr-1" />
                          Video
                        </Badge>
                      )}
                      {lesson.fileType === 'pdf' && (
                        <Badge variant="secondary" className="bg-[#5DBB63] text-white">
                          <FileText className="w-3 h-3 mr-1" />
                          PDF
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {lesson.content && (
                    <div className="mb-4">
                      <h4 className="font-medium text-[#1A1A1A] mb-2">Lesson Content</h4>
                      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed">
                        {lesson.content}
                      </div>
                    </div>
                  )}
                  
                  {lesson.fileUrl && (
                    <div className="mb-4">
                      <h4 className="font-medium text-[#1A1A1A] mb-2">Resource</h4>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(lesson.fileUrl, '_blank')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Open {lesson.fileType === 'pdf' ? 'PDF' : 'Video'} in new tab
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Mark as read or other actions can be added here
                        toast.success('Lesson marked as viewed')
                      }}
                    >
                      Mark as Read
                    </Button>
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