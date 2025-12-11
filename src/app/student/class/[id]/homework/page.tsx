'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, Clock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Homework {
  id: string
  title: string
  instructions: string
  deadline: string
  fileUrl?: string
  createdAt: string
  submission?: {
    id: string
    submittedAt: string
    teacherFeedback?: string
    grade?: number
  }
}

export default function StudentHomeworkPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [homework, setHomework] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchHomework(params.id as string)
    }
  }, [params.id])

  const fetchHomework = async (classId: string) => {
    try {
      const response = await fetch(`/api/student/homework/${classId}`)
      if (response.ok) {
        const data = await response.json()
        setHomework(data.homework)
      }
    } catch (error) {
      toast.error('Failed to fetch homework')
    } finally {
      setLoading(false)
    }
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const getStatusBadge = (homeworkItem: Homework) => {
    if (homeworkItem.submission) {
      return homeworkItem.submission.grade ? (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Grade: {homeworkItem.submission.grade}
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Submitted
        </Badge>
      )
    } else if (isOverdue(homeworkItem.deadline)) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary">
          <Calendar className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      )
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
    <div className="min-h-screen bg-[#F7F9FC] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-[#3A6EA5]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Class
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Homework</h1>
            <p className="text-gray-600">View and submit your assignments</p>
          </div>
        </div>
      </div>

      {/* Homework List */}
      <div className="max-w-7xl mx-auto">
        {homework.length === 0 ? (
          <Card className="bg-white text-center p-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">No homework yet</h3>
            <p className="text-gray-600">Your teacher hasn't posted any homework for this class yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {homework.map((homeworkItem) => (
              <Card key={homeworkItem.id} className="bg-white hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-[#1A1A1A]">{homeworkItem.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Posted {new Date(homeworkItem.createdAt).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(homeworkItem)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-[#1A1A1A] mb-2">Instructions</h4>
                      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed">
                        {homeworkItem.instructions}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {new Date(homeworkItem.deadline).toLocaleDateString()}</span>
                    </div>

                    {homeworkItem.fileUrl && (
                      <div>
                        <h4 className="font-medium text-[#1A1A1A] mb-2">Resources</h4>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(homeworkItem.fileUrl, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Open Attachment
                        </Button>
                      </div>
                    )}

                    {homeworkItem.submission && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-[#1A1A1A] mb-2">Your Submission</h4>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700 mb-2">
                            Submitted: {new Date(homeworkItem.submission.submittedAt).toLocaleString()}
                          </p>
                          {homeworkItem.submission.teacherFeedback && (
                            <div className="p-3 bg-yellow-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>Teacher Feedback:</strong> {homeworkItem.submission.teacherFeedback}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-4">
                      {!homeworkItem.submission ? (
                        <Button
                          className="bg-[#3A6EA5] hover:bg-[#2E5A8A]"
                          onClick={() => {
                            // Navigate to submission page
                            toast.info('Submission feature coming soon!')
                          }}
                        >
                          Submit Homework
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                        >
                          Already Submitted
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}