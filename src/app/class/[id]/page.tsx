'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { BookOpen, Users, FileText, MessageSquare, Plus, ArrowLeft, Copy, Check, Trash2, AlertTriangle, Settings, BarChart3, Download, Eye } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import CreateLessonModal from '@/components/CreateLessonModal'
import CreateHomeworkModal from '@/components/CreateHomeworkModal'
import CreateQuizModal from '@/components/CreateQuizModal'
import CreateAnnouncementModal from '@/components/CreateAnnouncementModal'

interface ClassDetails {
  id: string
  name: string
  grade: string
  classCode: string
  createdAt: string
  teacher: {
    id: string
    name: string
    email: string
  }
  studentClasses: Array<{
    student: {
      id: string
      name: string
      email: string
      parentCode?: string
    }
  }>
  _count: {
    lessons: number
    homework: number
    quizzes: number
    announcements: number
  }
}

export default function ClassDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateLesson, setShowCreateLesson] = useState(false)
  const [showCreateHomework, setShowCreateHomework] = useState(false)
  const [showCreateQuiz, setShowCreateQuiz] = useState(false)
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false)
  const [copiedParentCode, setCopiedParentCode] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchClassDetails(params.id as string)
    }
  }, [params.id])

  const fetchClassDetails = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}`)
      if (response.ok) {
        const data = await response.json()
        setClassDetails(data.class)
      } else {
        toast.error('Class not found or access denied')
      }
    } catch (error) {
      toast.error('Failed to fetch class details')
    } finally {
      setLoading(false)
    }
  }

  const refreshClassDetails = () => {
    if (params.id) {
      fetchClassDetails(params.id as string)
    }
  }

  const copyParentCode = async (parentCode: string) => {
    try {
      await navigator.clipboard.writeText(parentCode)
      setCopiedParentCode(parentCode)
      toast.success('Parent code copied to clipboard!')
      setTimeout(() => setCopiedParentCode(null), 2000)
    } catch (error) {
      toast.error('Failed to copy parent code')
    }
  }

  const handleDeleteClass = async () => {
    if (!classDetails) return
    
    try {
      const response = await fetch(`/api/classes/${classDetails.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Class deleted successfully!')
        setDeleteDialogOpen(false)
        router.push('/') // Go back to dashboard
      } else {
        toast.error(data.error || 'Failed to delete class')
      }
    } catch (error) {
      toast.error('Failed to delete class')
    }
  }

  const handleExportData = async () => {
    if (!classDetails) return
    
    try {
      // Export class data as JSON
      const exportData = {
        class: {
          name: classDetails.name,
          grade: classDetails.grade,
          classCode: classDetails.classCode,
          createdAt: classDetails.createdAt
        },
        students: classDetails.studentClasses.map(sc => ({
          name: sc.student.name,
          email: sc.student.email,
          parentCode: sc.student.parentCode
        })),
        statistics: {
          totalStudents: classDetails.studentClasses.length,
          totalLessons: classDetails._count.lessons,
          totalHomework: classDetails._count.homework,
          totalQuizzes: classDetails._count.quizzes,
          totalAnnouncements: classDetails._count.announcements
        }
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${classDetails.name.replace(/\s+/g, '_')}_data.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Class data exported successfully!')
    } catch (error) {
      toast.error('Failed to export class data')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#3A6EA5]"></div>
      </div>
    )
  }

  if (!classDetails) {
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
            <h1 className="text-3xl font-bold text-[#1A1A1A]">{classDetails.name}</h1>
            <p className="text-gray-600">{classDetails.grade} • Class Code: {classDetails.classCode}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">Teacher</h4>
                  <p className="text-gray-600">{classDetails.teacher.name}</p>
                  <p className="text-sm text-gray-500">{classDetails.teacher.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">Class Details</h4>
                  <p className="text-gray-600">Grade: {classDetails.grade}</p>
                  <p className="text-gray-600">Class Code: {classDetails.classCode}</p>
                  <p className="text-gray-600">Created: {new Date(classDetails.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A]">Student Roster</CardTitle>
              <CardDescription>Click on parent codes to copy them for sharing with parents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classDetails.studentClasses.map((studentClass) => (
                  <div key={studentClass.student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#3A6EA5] rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {studentClass.student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">{studentClass.student.name}</p>
                        <p className="text-sm text-gray-500">{studentClass.student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Parent Code:</p>
                        <div className="flex items-center space-x-1">
                          <code className="bg-white px-2 py-1 rounded text-sm font-mono border border-gray-200">
                            {studentClass.student.parentCode || 'Not assigned'}
                          </code>
                          {studentClass.student.parentCode && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyParentCode(studentClass.student.parentCode!)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedParentCode === studentClass.student.parentCode ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#3A6EA5] rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lessons</p>
                <p className="text-2xl font-bold text-[#1A1A1A1A]">{classDetails._count.lessons}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#5DBB63] rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Homework</p>
                <p className="text-2xl font-bold text-[#1A1A1A1A]">{classDetails._count.homework}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#FFC857] rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quizzes</p>
                <p className="text-2xl font-bold text-[#1A1A1A1A]">{classDetails._count.quizzes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Announcements</p>
                <p className="text-2xl font-bold text-[#1A1A1A1A]">{classDetails._count.announcements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-[#1A1A1A]">Class Management</CardTitle>
            <CardDescription>Tools and options for managing your class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Button 
                className="bg-[#3A6EA5] hover:bg-[#2E5A8A]"
                onClick={() => setShowCreateLesson(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Lesson
              </Button>
              <Button 
                className="bg-[#5DBB63] hover:bg-[#4FA052]"
                onClick={() => setShowCreateHomework(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Homework
              </Button>
              <Button 
                className="bg-[#FFC857] hover:bg-[#E6B547]"
                onClick={() => setShowCreateQuiz(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
              <Button 
                className="bg-[#8B5CF6] hover:bg-[#7C3AED]"
                onClick={() => setShowCreateAnnouncement(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Announcement
              </Button>
              <Button 
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                onClick={() => setShowAnalytics(true)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button 
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button 
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Class
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-[#1A1A1A]">Recent Activity</CardTitle>
            <CardDescription>Latest content and activity in your class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">Recent activity will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateLessonModal
        isOpen={showCreateLesson}
        onClose={() => setShowCreateLesson(false)}
        classId={params.id as string}
        onSuccess={refreshClassDetails}
      />

      <CreateHomeworkModal
        isOpen={showCreateHomework}
        onClose={() => setShowCreateHomework(false)}
        classId={params.id as string}
        onSuccess={refreshClassDetails}
      />

      <CreateQuizModal
        isOpen={showCreateQuiz}
        onClose={() => setShowCreateQuiz(false)}
        classId={params.id as string}
        onSuccess={refreshClassDetails}
      />

      <CreateAnnouncementModal
        isOpen={showCreateAnnouncement}
        onClose={() => setShowCreateAnnouncement(false)}
        classId={params.id as string}
        onSuccess={refreshClassDetails}
      />

      {/* Analytics Modal */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Class Analytics - {classDetails?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-blue-600">{classDetails?.studentClasses.length || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Lessons</p>
                    <p className="text-2xl font-bold text-green-600">{classDetails?._count.lessons || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Homework</p>
                    <p className="text-2xl font-bold text-yellow-600">{classDetails?._count.homework || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Quizzes</p>
                    <p className="text-2xl font-bold text-purple-600">{classDetails?._count.quizzes || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Announcements</p>
                    <p className="text-2xl font-bold text-red-600">{classDetails?._count.announcements || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Performance */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Student Performance</h3>
              <div className="space-y-3">
                {classDetails?.studentClasses.map((studentClass) => (
                  <div key={studentClass.student.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-sm font-medium">
                            {studentClass.student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[#1A1A1A]">{studentClass.student.name}</p>
                          <p className="text-sm text-gray-500">{studentClass.student.email}</p>
                          {studentClass.student.parentCode && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">Parent Code: {studentClass.student.parentCode}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete Class
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the class "<strong>{classDetails?.name}</strong>"? 
              This action cannot be undone and will permanently delete:
              <ul className="mt-2 ml-4 list-disc text-sm text-gray-600">
                <li>All lessons and materials</li>
                <li>All homework assignments</li>
                <li>All quizzes and student results</li>
                <li>All announcements</li>
                <li>Student enrollments will be removed</li>
                <li>Parent connections to this class will be affected</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClass}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}