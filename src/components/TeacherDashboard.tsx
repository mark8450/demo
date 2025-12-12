'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, FileText, MessageSquare, Plus, Copy, Check, LogOut, Trash2, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import MessagingSystem from './MessagingSystem'

interface Class {
  id: string
  name: string
  grade: string
  classCode: string
  createdAt: string
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

export default function TeacherDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [createClassOpen, setCreateClassOpen] = useState(false)
  const [newClass, setNewClass] = useState({ name: '', grade: '' })
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showMessages, setShowMessages] = useState(false)
  const [classToDelete, setClassToDelete] = useState<Class | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes)
      } else if (response.status === 401) {
        // 401 is expected if not authenticated, don't show error toast
        console.log('Not authenticated for classes fetch')
      } else {
        toast.error('Failed to fetch classes')
      }
    } catch (error) {
      toast.error('Failed to fetch classes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClass),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Class created successfully!')
        setCreateClassOpen(false)
        setNewClass({ name: '', grade: '' })
        fetchClasses()
      } else {
        toast.error(data.error || 'Failed to create class')
      }
    } catch (error) {
      toast.error('Failed to create class')
    }
  }

  const copyClassCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success('Class code copied to clipboard!')
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast.error('Failed to copy class code')
    }
  }

  const handleDeleteClass = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Class deleted successfully!')
        setDeleteDialogOpen(false)
        setClassToDelete(null)
        fetchClasses()
      } else {
        toast.error(data.error || 'Failed to delete class')
      }
    } catch (error) {
      toast.error('Failed to delete class')
    }
  }

  const confirmDeleteClass = (classItem: Class) => {
    setClassToDelete(classItem)
    setDeleteDialogOpen(true)
  }

  if (showMessages) {
    return (
      <div className="min-h-screen bg-background overflow-hidden relative">
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
          <div className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-primary/20 p-4 shadow-lg shadow-primary/10">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowMessages(false)}
                  className="text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  ← Back to Dashboard
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={logout}
                className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          <MessagingSystem />
        </div>
      </div>
    )
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
            <p className="text-xl text-muted-foreground">Manage your classes and track student progress</p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowMessages(true)}
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/10 hover:text-primary backdrop-blur-sm transition-all duration-300 shadow-lg shadow-primary/10"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Button>
            
            <Button 
              onClick={logout}
              variant="outline"
              className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive-foreground backdrop-blur-sm transition-all duration-300 shadow-lg shadow-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            
            <Dialog open={createClassOpen} onOpenChange={setCreateClassOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 rounded-full px-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] backdrop-blur-sm bg-background/95 border border-primary/20 shadow-2xl shadow-primary/20">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Create New Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="className" className="text-sm font-medium">Class Name</Label>
                    <Input
                      id="className"
                      placeholder="e.g., Mathematics 101"
                      value={newClass.name}
                      onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                      required
                      className="border-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-sm font-medium">Grade Level</Label>
                    <Input
                      id="grade"
                      placeholder="e.g., 10th Grade"
                      value={newClass.grade}
                      onChange={(e) => setNewClass({ ...newClass, grade: e.target.value })}
                      required
                      className="border-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                    Create Class
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative z-20">
        <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold text-foreground">{classes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-secondary/20 shadow-lg shadow-secondary/10 hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/25">
                <BookOpen className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">
                  {classes.reduce((acc, cls) => acc + cls.studentClasses.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-accent/20 shadow-lg shadow-accent/10 hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent/25">
                <FileText className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
                <p className="text-2xl font-bold text-foreground">
                  {classes.reduce((acc, cls) => acc + cls._count.lessons, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/80 to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <MessageSquare className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Announcements</p>
                <p className="text-2xl font-bold text-foreground">
                  {classes.reduce((acc, cls) => acc + cls._count.announcements, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      <div className="max-w-7xl mx-auto relative z-20">
        <h2 className="text-3xl font-bold text-foreground mb-6 animate-title-glow">Your Classes</h2>
        
        {classes.length === 0 ? (
          <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-2xl shadow-primary/20 text-center p-12">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No classes yet</h3>
            <p className="text-muted-foreground mb-6">Create your first class to get started</p>
            <Button 
              onClick={() => setCreateClassOpen(true)}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 rounded-full px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Class
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-foreground">{classItem.name}</CardTitle>
                      <CardDescription>{classItem.grade}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-gradient-to-r from-secondary/20 to-primary/20 text-secondary-foreground border border-secondary/30">
                      {classItem.studentClasses.length} students
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Class Code:</span>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gradient-to-r from-muted/50 to-primary/10 px-3 py-1 rounded-lg text-sm font-mono border border-primary/20">
                          {classItem.classCode}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyClassCode(classItem.classCode)}
                          className="h-6 w-6 p-0 hover:bg-primary/10 transition-colors"
                        >
                          {copiedCode === classItem.classCode ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span>{classItem._count.lessons} lessons</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-secondary" />
                        <span>{classItem._count.homework} homework</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-accent" />
                        <span>{classItem._count.quizzes} quizzes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{classItem._count.announcements} announcements</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex gap-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                        onClick={() => router.push(`/class/${classItem.id}`)}
                      >
                        Manage Class
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDeleteClass(classItem)}
                        className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive-foreground backdrop-blur-sm transition-all duration-300 shadow-lg shadow-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="backdrop-blur-sm bg-background/95 border border-destructive/20 shadow-2xl shadow-destructive/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">Delete Class</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{classToDelete?.name}"? This action cannot be undone and will remove all associated lessons, homework, quizzes, and announcements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-primary/20 hover:bg-primary/10 transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => classToDelete && handleDeleteClass(classToDelete.id)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0 shadow-lg shadow-destructive/25 transition-all duration-300"
            >
              Delete Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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