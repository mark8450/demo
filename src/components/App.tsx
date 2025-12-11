'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import TeacherDashboard from '@/components/TeacherDashboard'
import StudentDashboard from '@/components/StudentDashboard'
import ParentDashboard from '@/components/ParentDashboard'

export default function App() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing')

  useEffect(() => {
    if (user && !loading) {
      setCurrentView('dashboard')
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F9FC]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#3A6EA5]"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will show landing page from page.tsx
  }

  // Render dashboard based on user role
  switch (user.role) {
    case 'teacher':
      return <TeacherDashboard />
    case 'student':
      return <StudentDashboard />
    case 'parent':
      return <ParentDashboard />
    default:
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#F7F9FC]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Invalid Role</h1>
            <p className="text-gray-600">Please contact support for assistance.</p>
          </div>
        </div>
      )
  }
}