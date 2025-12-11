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
    <div className="min-h-screen bg-[#F7F9FC] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">Monitor your child's academic progress and stay informed</p>
          </div>
          <Button 
            onClick={logout}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Children Overview */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Your Children</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A6EA5]"></div>
          </div>
        ) : children.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No children linked yet</h3>
              <p className="text-gray-600 mb-4">Add your first child using their unique parent code to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <Card key={child.id} className="bg-white hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#3A6EA5] rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[#1A1A1A]">{child.name}</CardTitle>
                      <CardDescription>{child.grade}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Classes</span>
                      <span className="font-semibold text-blue-600">{child.classes.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Linked</span>
                      <span className="font-semibold text-green-600">
                        {new Date(child.linkedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {child.classes.length > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Active in: </span>
                        <span className="font-medium text-[#1A1A1A]">
                          {child.classes.map(c => c.name).join(', ')}
                        </span>
                      </div>
                    )}
                    <Button className="w-full bg-[#3A6EA5] hover:bg-[#2E5A8A] mt-4">
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
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#5DBB63] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Children</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{children.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#FFC857] rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">
                  {children.reduce((sum, child) => sum + child.classes.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Today</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">
                  {children.filter(child => child.classes.length > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#EF4444] rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Need Attention</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A]">Recent Announcements</CardTitle>
              <CardDescription>Latest updates from teachers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-[#1A1A1A]">Parent-Teacher Meeting</h4>
                      <span className="text-xs text-gray-500">2 days ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Scheduled for next Friday at 3:00 PM. Please confirm your attendance.
                    </p>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A]">Homework Deadlines</CardTitle>
              <CardDescription>Track upcoming assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-[#1A1A1A]">Math Project</h4>
                      <p className="text-sm text-gray-600">Due in 3 days • Student 1</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Pending
                      </span>
                      <Button size="sm" variant="outline">
                        Remind
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A]">Add Child</CardTitle>
              <CardDescription>Connect with your child using their unique parent code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter parent code (e.g., PARENT-ABC123)"
                  value={parentCode}
                  onChange={(e) => setParentCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]"
                />
                <Button 
                  onClick={handleAddChild}
                  disabled={addingChild || !parentCode.trim()}
                  className="w-full bg-[#5DBB63] hover:bg-[#4FA052] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingChild ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View Progress Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Contact Teachers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}