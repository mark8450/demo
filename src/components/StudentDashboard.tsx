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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 animate-title-glow">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xl text-muted-foreground">Track your assignments and stay updated with your classes</p>
          </div>
          <Button 
            onClick={logout}
            variant="outline"
            className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive-foreground backdrop-blur-sm transition-all duration-300 shadow-lg shadow-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative z-20">
        <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">My Classes</p>
                <p className="text-2xl font-bold text-foreground">{studentClasses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-secondary/20 shadow-lg shadow-secondary/10 hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/25">
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

        <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-accent/20 shadow-lg shadow-accent/10 hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent/25">
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

        <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/80 to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
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
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-20">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground animate-title-glow">My Classes</CardTitle>
              <CardDescription className="text-muted-foreground">Classes you're enrolled in</CardDescription>
            </CardHeader>
            <CardContent>
              {studentClasses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No classes yet</h3>
                  <p className="text-muted-foreground">Join a class to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentClasses.map((studentClass) => (
                    <div key={studentClass.id} className="p-4 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-lg border border-secondary/30 backdrop-blur-sm hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300">
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
                            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
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
          <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Join a Class</CardTitle>
              <CardDescription className="text-muted-foreground">Enter a class code to join</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinClass} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter class code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  className="w-full border-primary/20 focus:border-primary transition-colors"
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-secondary-foreground border-0 shadow-lg shadow-secondary/25 hover:shadow-secondary/40 transition-all duration-300"
                  disabled={joiningClass}
                >
                  {joiningClass ? 'Joining...' : 'Join Class'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-primary/20 hover:bg-primary/10 transition-all duration-300">
                  <FileText className="w-4 h-4 mr-2" />
                  View Homework
                </Button>
                <Button variant="outline" className="w-full justify-start border-primary/20 hover:bg-primary/10 transition-all duration-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  Upcoming Tests
                </Button>
                <Button variant="outline" className="w-full justify-start border-primary/20 hover:bg-primary/10 transition-all duration-300">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Lessons
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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