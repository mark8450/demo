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
      <div className="flex items-center justify-center min-h-screen bg-background overflow-hidden relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" style={{
            backgroundImage: `
              linear-gradient(rgba(var(--primary), 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(var(--primary), 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-muted"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary border-r-transparent border-b-transparent border-l-transparent absolute top-0"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!classDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background overflow-hidden relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" style={{
            backgroundImage: `
              linear-gradient(rgba(var(--primary), 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(var(--primary), 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative z-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Class not found</h1>
            <Button onClick={() => router.back()} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 shadow-lg shadow-primary/25">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative p-6">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" style={{
          backgroundImage: `
            linear-gradient(rgba(var(--primary), 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--primary), 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 relative z-20">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-primary hover:bg-primary/10 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground animate-title-glow">{classDetail.class.name}</h1>
            <p className="text-xl text-muted-foreground">{classDetail.class.grade} • Class Code: {classDetail.class.classCode}</p>
          </div>
        </div>
      </div>

      {/* Class Info */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-20">
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground animate-title-glow">Class Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Teacher</h4>
                  <p className="text-muted-foreground">{classDetail.class.teacher.name}</p>
                  <p className="text-sm text-muted-foreground">{classDetail.class.teacher.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Class Details</h4>
                  <p className="text-muted-foreground">Grade: {classDetail.class.grade}</p>
                  <p className="text-muted-foreground">Class Code: {classDetail.class.classCode}</p>
                  <p className="text-muted-foreground">Enrolled: {new Date(classDetail.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Class Resources</CardTitle>
              <CardDescription className="text-muted-foreground">View your learning materials and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                      <BookOpen className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">Lessons</span>
                  </div>
                  <Badge variant="secondary" className="bg-gradient-to-r from-secondary/20 to-primary/20 text-secondary-foreground border border-secondary/30">
                    {classDetail.class._count.lessons}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/25">
                      <FileText className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">Homework</span>
                  </div>
                  <Badge variant="secondary" className="bg-gradient-to-r from-secondary/20 to-primary/20 text-secondary-foreground border border-secondary/30">
                    {classDetail.class._count.homework}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent/25">
                      <MessageSquare className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">Quizzes</span>
                  </div>
                  <Badge variant="secondary" className="bg-gradient-to-r from-secondary/20 to-primary/20 text-secondary-foreground border border-secondary/30">
                    {classDetail.class._count.quizzes}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/80 to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                      <Calendar className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">Announcements</span>
                  </div>
                  <Badge variant="secondary" className="bg-gradient-to-r from-secondary/20 to-primary/20 text-secondary-foreground border border-secondary/30">
                    {classDetail.class._count.announcements}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto relative z-20">
        <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground animate-title-glow">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">Access your class resources and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                onClick={() => router.push(`/student/class/${params.id}/lessons`)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                View Lessons
              </Button>
              <Button 
                className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-secondary-foreground border-0 shadow-lg shadow-secondary/25 hover:shadow-secondary/40 transition-all duration-300"
                onClick={() => router.push(`/student/class/${params.id}/homework`)}
              >
                <FileText className="w-4 h-4 mr-2" />
                View Homework
              </Button>
              <Button 
                className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground border-0 shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300"
                onClick={() => router.push(`/student/class/${params.id}/quizzes`)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Take Quizzes
              </Button>
              <Button 
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                onClick={() => router.push(`/student/class/${params.id}/announcements`)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Announcements
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes title-glow {
          0%, 100% { 
            text-shadow: 0 0 20px rgba(var(--primary), 0.5); 
          }
          50% { 
            text-shadow: 0 0 30px rgba(var(--primary), 0.8); 
          }
        }

        .animate-title-glow {
          animation: title-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}