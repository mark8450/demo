'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowLeft, FileText, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Announcement {
  id: string
  message: string
  fileUrl?: string
  createdAt: string
}

export default function StudentAnnouncementsPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchAnnouncements(params.id as string)
    }
  }, [params.id])

  const fetchAnnouncements = async (classId: string) => {
    try {
      const response = await fetch(`/api/student/announcements/${classId}`)
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.announcements)
      }
    } catch (error) {
      toast.error('Failed to fetch announcements')
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
            Back to Class
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground animate-title-glow">Announcements</h1>
            <p className="text-xl text-muted-foreground">Stay updated with class news and updates</p>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="max-w-7xl mx-auto relative z-20">
        {announcements.length === 0 ? (
          <Card className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-2xl shadow-primary/20 text-center p-12">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No announcements yet</h3>
            <p className="text-muted-foreground">Your teacher hasn't posted any announcements for this class yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="bg-gradient-to-br from-background to-background/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02]">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground">Class Announcement</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Posted {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg backdrop-blur-sm">
                      <p className="text-foreground leading-relaxed">
                        {announcement.message}
                      </p>
                    </div>
                    {announcement.fileUrl && (
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-foreground mb-2">Attachment</h4>
                        <Button
                          variant="outline"
                          className="w-full border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300"
                          onClick={() => window.open(announcement.fileUrl, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Open Attachment
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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