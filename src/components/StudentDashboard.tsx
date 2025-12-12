'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookOpen, FileText, Calendar, Trophy, Plus, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface StudentClass {
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

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const [studentClasses, setStudentClasses] = useState<StudentClass[]>([])
  const [loading, setLoading] = useState(true)
  const [classCode, setClassCode] = useState('')
  const [joiningClass, setJoiningClass] = useState(false)

  useEffect(() => {
    fetchStudentClasses()
  }, [])

  const fetchStudentClasses = async () => {
    try {
      const response = await fetch('/api/student/classes')
      if (response.ok) {
        const data = await response.json()
        setStudentClasses(data.classes)
      } else if (response.status === 401) {
        // 401 is expected if not authenticated, don't show error toast
        console.log('Not authenticated for student classes fetch')
      } else {
        toast.error('Failed to fetch classes')
      }
    } catch (error) {
      toast.error('Failed to fetch classes')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!classCode.trim()) {
      toast.error('Please enter a class code')
      return
    }

    setJoiningClass(true)
    
    try {
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classCode: classCode.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Successfully joined class!')
        setClassCode('')
        fetchStudentClasses()
      } else {
        toast.error(data.error || 'Failed to join class')
      }
    } catch (error) {
      toast.error('Failed to join class')
    } finally {
      setJoiningClass(false)
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
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-muted-foreground">Track your assignments and stay updated with your classes</p>
          </div>
          <Button 
            onClick={logout}
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-primary-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">My Classes</p>
                <p className="text-2xl font-bold text-foreground">{studentClasses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Homework</p>
                <p className="text-2xl font-bold text-foreground">
                  {studentClasses.reduce((acc, cls) => acc + cls.class._count.homework, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Quizzes</p>
                <p className="text-2xl font-bold text-foreground">
                  {studentClasses.reduce((acc, cls) => acc + cls.class._count.quizzes, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/80 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Grade</p>
                <p className="text-2xl font-bold text-foreground">--%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">My Classes</CardTitle>
              <CardDescription>Classes you're enrolled in</CardDescription>
            </CardHeader>
            <CardContent>
              {studentClasses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No classes yet</h3>
                  <p className="text-muted-foreground">Join a class to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentClasses.map((studentClass) => (
                    <div key={studentClass.id} className="p-4 bg-secondary/20 rounded-lg border border-secondary/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-foreground">{studentClass.class.name}</h4>
                          <p className="text-sm text-muted-foreground">{studentClass.class.grade}</p>
                          <p className="text-xs text-muted-foreground">Teacher: {studentClass.class.teacher.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-2">Joined {new Date(studentClass.createdAt).toLocaleDateString()}</p>
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => window.location.href = `/student/class/${studentClass.classId}`}
                          >
                            View Class
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Join a Class</CardTitle>
              <CardDescription>Enter a class code to join</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinClass} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter class code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  className="w-full"
                />
                <Button 
                  type="submit" 
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  disabled={joiningClass}
                >
                  {joiningClass ? 'Joining...' : 'Join Class'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View Homework
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Upcoming Tests
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Lessons
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}