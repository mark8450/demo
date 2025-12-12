'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, FileText, Calendar, TrendingUp, Users, AlertCircle, LogOut, Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

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
        toast({
          title: "Error",
          description: "Failed to fetch children data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching children:', error)
      toast({
        title: "Error",
        description: "Failed to fetch children data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddChild = async () => {
    if (!parentCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a parent code",
        variant: "destructive"
      })
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
        toast({
          title: "Success",
          description: data.message
        })
        setParentCode('')
        fetchChildren() // Refresh the children list
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to add child",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error adding child:', error)
      toast({
        title: "Error",
        description: "Failed to add child",
        variant: "destructive"
      })
    } finally {
      setAddingChild(false)
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Background Pattern - Subtle version of landing page */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" style={{
          backgroundImage: `
            linear-gradient(rgba(var(--primary), 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--primary), 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Subtle Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-muted-foreground">Monitor your child's academic progress and stay informed</p>
            </div>
            <Button 
              onClick={logout}
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-primary-foreground transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

          {/* Children Overview */}
        <div className="max-w-7xl mx-auto mb-8 px-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Your Children</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : children.length === 0 ? (
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No children linked yet</h3>
                <p className="text-muted-foreground mb-4">Add your first child using their unique parent code to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <Card key={child.id} className="bg-card border-border hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/25">
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
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40">
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
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 px-6">
          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shadow-lg shadow-secondary/25">
                  <TrendingUp className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Children</p>
                  <p className="text-2xl font-bold text-foreground">{children.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/25">
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

          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/80 rounded-lg flex items-center justify-center shadow-lg shadow-primary/25">
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

          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-destructive rounded-lg flex items-center justify-center shadow-lg shadow-destructive/25">
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
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Announcements</CardTitle>
                <CardDescription>Latest updates from teachers</CardDescription>
              </CardHeader>
              <CardContent>
                {children.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No announcements available. Add children to see updates from their teachers.</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No announcements at this time.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground">Homework Deadlines</CardTitle>
                <CardDescription>Track upcoming assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {children.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No homework assignments available. Add children to track their assignments.</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No homework assignments at this time.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground">Add Child</CardTitle>
                <CardDescription>Connect with your child using their unique parent code</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter parent code (e.g., PARENT-ABC123)"
                    value={parentCode}
                    onChange={(e) => setParentCode(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  />
                  <Button 
                    onClick={handleAddChild}
                    disabled={addingChild || !parentCode.trim()}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-secondary/25 hover:shadow-secondary/40"
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

            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start transition-all duration-300 hover:scale-105">
                    <FileText className="w-4 h-4 mr-2" />
                    View Progress Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start transition-all duration-300 hover:scale-105">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" className="w-full justify-start transition-all duration-300 hover:scale-105">
                    <Users className="w-4 h-4 mr-2" />
                    Contact Teachers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}