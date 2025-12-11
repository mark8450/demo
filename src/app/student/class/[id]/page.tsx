'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, FileText, MessageSquare, Calendar, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface StudentClassDetail {
  id: string
  classId: string
  createdAt: string
  class: {
    id: string
    name: string
    grade: string
    classCode: string
    teacher: {
      id: string
      name: string
      email: string
    }
    _count: {
      lessons: number
      homework: number
      quizzes: number
      announcements: number
    }
  }
}

export default function StudentClassDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [classDetail, setClassDetail] = useState<StudentClassDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchClassDetail(params.id as string)
    }
  }, [params.id])

  const fetchClassDetail = async (classId: string) => {
    try {
      const response = await fetch(`/api/student/classes/${classId}`)
      if (response.ok) {
        const data = await response.json()
        setClassDetail(data.classDetail)
      }
    } catch (error) {
      toast.error('Failed to fetch class details')
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

  if (!classDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Class not found</h1>
          <Button onClick={() => router.back()} className="bg-[#3A6EA5] hover:bg-[#2E5A8A]">
            Go Back
          </Button>
        </div>
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
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">{classDetail.class.name}</h1>
            <p className="text-gray-600">{classDetail.class.grade} • Class Code: {classDetail.class.classCode}</p>
          </div>
        </div>
      </div>

      {/* Class Info */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A]">Class Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">Teacher</h4>
                  <p className="text-gray-600">{classDetail.class.teacher.name}</p>
                  <p className="text-sm text-gray-500">{classDetail.class.teacher.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">Class Details</h4>
                  <p className="text-gray-600">Grade: {classDetail.class.grade}</p>
                  <p className="text-gray-600">Class Code: {classDetail.class.classCode}</p>
                  <p className="text-gray-600">Enrolled: {new Date(classDetail.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A]">Class Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-[#3A6EA5]" />
                    <span className="text-sm text-gray-600">Lessons</span>
                  </div>
                  <Badge variant="secondary">{classDetail.class._count.lessons}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-[#5DBB63]" />
                    <span className="text-sm text-gray-600">Homework</span>
                  </div>
                  <Badge variant="secondary">{classDetail.class._count.homework}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-[#FFC857]" />
                    <span className="text-sm text-gray-600">Quizzes</span>
                  </div>
                  <Badge variant="secondary">{classDetail.class._count.quizzes}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="text-sm text-gray-600">Announcements</span>
                  </div>
                  <Badge variant="secondary">{classDetail.class._count.announcements}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-[#1A1A1A]">Quick Actions</CardTitle>
            <CardDescription>Access your class resources and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="bg-[#3A6EA5] hover:bg-[#2E5A8A]">
                <BookOpen className="w-4 h-4 mr-2" />
                View Lessons
              </Button>
              <Button className="bg-[#5DBB63] hover:bg-[#4FA052]">
                <FileText className="w-4 h-4 mr-2" />
                View Homework
              </Button>
              <Button className="bg-[#FFC857] hover:bg-[#E6B547]">
                <MessageSquare className="w-4 h-4 mr-2" />
                Take Quizzes
              </Button>
              <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
                <Calendar className="w-4 h-4 mr-2" />
                View Announcements
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}