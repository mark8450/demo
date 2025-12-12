'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, FileText, Calendar, TrendingUp, Users, AlertCircle, LogOut, Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Child {
  id: string
  name: string
  email: string
  grade: string
  classes: Array<{
    id: string
    name: string
    grade: string
    teacher: string
  }>
  linkedAt: string
}

export default function ParentDashboard() {
  const { user, logout } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [parentCode, setParentCode] = useState('')
  const [addingChild, setAddingChild] = useState(false)

  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/parent/children')

      if (response.ok) {
        const data = await response.json()
        setChildren(data.children || [])
      } else if (response.status === 401) {
        // 401 is expected if not authenticated, don't show error toast
        console.log('Not authenticated for children fetch')
      } else {
        toast.error('Failed to fetch children data')
      }
    } catch (error) {
      console.error('Error fetching children:', error)
      toast.error('Failed to fetch children data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddChild = async () => {
    if (!parentCode.trim()) {
      toast.error('Please enter a parent code')
      return
    }

    setAddingChild(true)
    try {
      const response = await fetch('/api/parent/add-child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ parentCode })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        setParentCode('')
        fetchChildren() // Refresh children list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to add child")
      }
    } catch (error) {
      console.error('Error adding child:', error)
      toast.error('Failed to add child')
    } finally {
      setAddingChild(false)
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
            <p className="text-xl text-muted-foreground">Monitor your child's academic progress and stay informed</p>
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

      {/* Children Overview */}
      <div className="max-w-7xl mx-auto mb-8 relative z-20">
        <h2 className="text-3xl font-bold text-foreground mb-6 animate-title-glow">Your Children</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : children.length === 0 ? (
          <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-2xl shadow-primary/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No children linked yet</h3>
              <p className="text-muted-foreground mb-4">Add your first child using their unique parent code to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <Card key={child.id} className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg shadow-primary/25">
                      <Users className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{child.name}</CardTitle>
                      <CardDescription>{child.grade}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Classes</span>
                      <span className="font-semibold text-primary">{child.classes.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Linked</span>
                      <span className="font-semibold text-secondary">
                        {new Date(child.linkedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {child.classes.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Active in: </span>
                        <span className="font-medium text-foreground">
                          {child.classes.map(c => c.name).join(', ')}
                        </span>
                      </div>
                    )}
                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 mt-4">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative z-20">
        <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-secondary/20 shadow-lg shadow-secondary/10 hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/25">
                <TrendingUp className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Children</p>
                <p className="text-2xl font-bold text-foreground">{children.length}</p>
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
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold text-foreground">
                  {children.reduce((sum, child) => sum + child.classes.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/80 to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold text-foreground">
                  {children.filter(child => child.classes.length > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-destructive/20 shadow-lg shadow-destructive/10 hover:shadow-xl hover:shadow-destructive/20 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-destructive/80 to-destructive rounded-xl flex items-center justify-center shadow-lg shadow-destructive/25">
                <AlertCircle className="w-6 h-6 text-destructive-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Need Attention</p>
                <p className="text-2xl font-bold text-foreground">
                  {children.length === 0 ? 0 : 0}
                </p>
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
              <CardTitle className="text-xl font-semibold text-foreground animate-title-glow">Recent Announcements</CardTitle>
              <CardDescription className="text-muted-foreground">Latest updates from teachers</CardDescription>
            </CardHeader>
            <CardContent>
              {children.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">No announcements available. Add children to see updates from their teachers.</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">No announcements at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Homework Deadlines</CardTitle>
              <CardDescription className="text-muted-foreground">Track upcoming assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {children.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">No homework assignments available. Add children to track their assignments.</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">No homework assignments at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Add Child</CardTitle>
              <CardDescription className="text-muted-foreground">Connect with your child using their unique parent code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter parent code (e.g., PARENT-ABC123)"
                  value={parentCode}
                  onChange={(e) => setParentCode(e.target.value)}
                  className="w-full px-3 py-2 border border-primary/20 bg-background/50 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                />
                <Button 
                  onClick={handleAddChild}
                  disabled={addingChild || !parentCode.trim()}
                  className="w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed border-0 shadow-lg shadow-secondary/25 hover:shadow-secondary/40 transition-all duration-300"
                >
                  {addingChild ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary-foreground mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
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
                  View Progress Reports
                </Button>
                <Button variant="outline" className="w-full justify-start border-primary/20 hover:bg-primary/10 transition-all duration-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  Academic Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start border-primary/20 hover:bg-primary/10 transition-all duration-300">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Contact Teachers
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