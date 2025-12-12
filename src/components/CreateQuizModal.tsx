'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface QuizQuestion {
  question: string
  type: 'multiple_choice' | 'true_false' | 'short_answer'
  options: string
  correctAnswer: string
  points: number
}

interface CreateQuizModalProps {
  isOpen: boolean
  onClose: () => void
  classId: string
  onSuccess: () => void
}

export default function CreateQuizModal({ isOpen, onClose, classId, onSuccess }: CreateQuizModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    questions: [createEmptyQuestion()]
  })

  function createEmptyQuestion(): QuizQuestion {
    return {
      question: '',
      type: 'multiple_choice',
      options: '',
      correctAnswer: '',
      points: 1
    }
  }

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, createEmptyQuestion()]
    })
  }

  const removeQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      questions: newQuestions
    })
  }

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const newQuestions = [...formData.questions]
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    }
    setFormData({
      ...formData,
      questions: newQuestions
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a quiz title')
      return
    }

    const validQuestions = formData.questions.filter(q => q.question.trim() && q.correctAnswer.trim())
    if (validQuestions.length === 0) {
      toast.error('Please add at least one question with answer')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          title: formData.title.trim(),
          questions: validQuestions
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Quiz created successfully!')
        setFormData({ title: '', questions: [createEmptyQuestion()] })
        onClose()
        onSuccess()
      } else {
        toast.error(data.error || 'Failed to create quiz')
      }
    } catch (error) {
      toast.error('Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              placeholder="e.g., Chapter 5 Quiz"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">Questions</Label>
              <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {formData.questions.map((question, index) => (
              <Card key={index} className="bg-gray-50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    {formData.questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Textarea
                      placeholder="Enter your question..."
                      value={question.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                      rows={2}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value: 'multiple_choice' | 'true_false' | 'short_answer') => 
                          updateQuestion(index, 'type', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="true_false">True/False</SelectItem>
                          <SelectItem value="short_answer">Short Answer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min="1"
                        value={question.points}
                        onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  {question.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      <Label>Options (one per line)</Label>
                      <Textarea
                        placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                        value={question.options}
                        onChange={(e) => updateQuestion(index, 'options', e.target.value)}
                        rows={4}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    {question.type === 'true_false' ? (
                      <Select
                        value={question.correctAnswer}
                        onValueChange={(value) => updateQuestion(index, 'correctAnswer', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Enter correct answer"
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                        required
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {loading ? 'Creating...' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}