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
      <div>
        <div className="bg-card border-border p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => setShowMessages(false)}
                className="text-primary"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              className="text-destructive hover:text-destructive-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        <MessagingSystem />
      </div>
    )
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
            <p className="text-muted-foreground">Manage your classes and track student progress</p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowMessages(true)}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Button>
            
            <Button 
              onClick={logout}
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-primary-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            
            <Dialog open={createClassOpen} onOpenChange={setCreateClassOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
                      placeholder="e.g., Mathematics 101"
                      value={newClass.name}
                      onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade Level</Label>
                    <Input
                      id="grade"
                      placeholder="e.g., 10th Grade"
                      value={newClass.grade}
                      onChange={(e) => setNewClass({ ...newClass, grade: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Create Class
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold text-foreground">{classes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
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

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
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

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/80 rounded-lg flex items-center justify-center">
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
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Your Classes</h2>
        
        {classes.length === 0 ? (
          <Card className="bg-white text-center p-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">No classes yet</h3>
            <p className="text-gray-600 mb-6">Create your first class to get started</p>
            <Button 
              onClick={() => setCreateClassOpen(true)}
              className="bg-[#3A6EA5] hover:bg-[#2E5A8A]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Class
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="bg-white hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-[#1A1A1A]">{classItem.name}</CardTitle>
                      <CardDescription>{classItem.grade}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-[#E8EEF4] text-[#3A6EA5]">
                      {classItem.studentClasses.length} students
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Class Code:</span>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {classItem.classCode}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyClassCode(classItem.classCode)}
                          className="h-6 w-6 p-0"
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
                        <BookOpen className="w-4 h-4 text-[#3A6EA5]" />
                        <span>{classItem._count.lessons} lessons</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-[#5DBB63]" />
                        <span>{classItem._count.homework} homework</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-[#FFC857]" />
                        <span>{classItem._count.quizzes} quizzes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-[#8B5CF6]" />
                        <span>{classItem._count.announcements} announcements</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex gap-2">
                      <Button 
                        className="flex-1 bg-[#3A6EA5] hover:bg-[#2E5A8A]"
                        onClick={() => router.push(`/class/${classItem.id}`)}
                      >
                        Manage Class
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDeleteClass(classItem)}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete Class
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the class "<strong>{classToDelete?.name}</strong>"? 
              This action cannot be undone and will permanently delete:
              <ul className="mt-2 ml-4 list-disc text-sm text-gray-600">
                <li>All lessons and materials</li>
                <li>All homework assignments</li>
                <li>All quizzes and results</li>
                <li>All announcements</li>
                <li>Student enrollments will be removed</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => classToDelete && handleDeleteClass(classToDelete.id)}
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