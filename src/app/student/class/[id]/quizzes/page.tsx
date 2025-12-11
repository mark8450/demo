'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, ArrowLeft, Clock, CheckCircle, AlertCircle, Play } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Quiz {
  id: string
  title: string
  createdAt: string
  result?: {
    id: string
    score: number
    total: number
    completedAt: string
  }
}

export default function StudentQuizzesPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchQuizzes(params.id as string)
    }
  }, [params.id])

  const fetchQuizzes = async (classId: string) => {
    try {
      const response = await fetch(`/api/student/quizzes/${classId}`)
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data.quizzes)
      }
    } catch (error) {
      toast.error('Failed to fetch quizzes')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (quiz: Quiz) => {
    if (quiz.result) {
      const percentage = Math.round((quiz.result.score / quiz.result.total) * 100)
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Score: {quiz.result.score}/{quiz.result.total} ({percentage}%)
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary">
          <MessageSquare className="w-3 h-3 mr-1" />
          Not Taken
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
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Quizzes</h1>
            <p className="text-gray-600">Take quizzes and view your results</p>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="max-w-7xl mx-auto">
        {quizzes.length === 0 ? (
          <Card className="bg-white text-center p-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">No quizzes yet</h3>
            <p className="text-gray-600">Your teacher hasn't posted any quizzes for this class yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="bg-white hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-[#1A1A1A]">{quiz.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Posted {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(quiz)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        Time Limit: Usually 30 minutes
                      </div>
                      <div className="text-sm text-gray-600">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Multiple choice questions
                      </div>
                    </div>

                    {quiz.result ? (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-[#1A1A1A] mb-2">Your Results</h4>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-semibold text-[#1A1A1A]">
                              {quiz.result.score} / {quiz.result.total}
                            </span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
                              {Math.round((quiz.result.score / quiz.result.total) * 100)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Completed: {new Date(quiz.result.completedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center pt-4">
                        <Button
                          className="bg-[#3A6EA5] hover:bg-[#2E5A8A]"
                          onClick={() => {
                            // Navigate to quiz taking page
                            toast.info('Quiz taking feature coming soon!')
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Quiz
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
    </div>
  )
}