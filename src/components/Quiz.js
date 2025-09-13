"use client"
import { useState, useCallback, useMemo } from "react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { toast } from "react-hot-toast"
import { Loader2, CheckCircle, XCircle, RefreshCw, Play, Trophy, Clock, AlertCircle } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

const initializeGemini = () => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable")
  }
  return new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
}

// Configuration constants
const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy", color: "bg-green-500", description: "Basic recall and understanding" },
  { value: "medium", label: "Medium", color: "bg-yellow-500", description: "Application and analysis" },
  { value: "hard", label: "Hard", color: "bg-red-500", description: "Critical thinking and synthesis" }
]

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice", description: "4 options with one correct answer" },
  { value: "true-false", label: "True / False", description: "Binary choice questions" }
]

const INITIAL_CONFIG = {
  numQuestions: "5",
  difficulty: "medium",
  questionType: "mcq"
}

class GeminiQuizGenerator {
  constructor() {
    this.genAI = initializeGemini()
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
  }

  createPrompt(config, summary) {
    const { numQuestions, difficulty, questionType } = config
    
    const difficultyInstructions = {
      easy: "Focus on basic facts, definitions, and simple recall. Questions should test fundamental understanding.",
      medium: "Include application, comparison, and analysis questions. Test deeper comprehension and connections.",
      hard: "Create challenging questions requiring critical thinking, synthesis, and complex reasoning."
    }

    const typeInstructions = {
      mcq: `Create multiple choice questions with exactly 4 options each. Ensure:
        - Only one option is clearly correct
        - Distractors are plausible but incorrect
        - Options are roughly equal in length
        - Avoid "all of the above" or "none of the above"`,
      "true-false": `Create true/false questions that:
        - Test specific facts or concepts
        - Avoid ambiguous statements
        - Include both true and false correct answers
        - Choices should be exactly ["True", "False"]`
    }

    return `You are an expert educational assessment creator. Generate a high-quality quiz based STRICTLY on the provided content.

CONTENT TO USE:
---
${summary}
---

REQUIREMENTS:
- Generate exactly ${numQuestions} questions
- Difficulty level: ${difficulty} - ${difficultyInstructions[difficulty]}
- Question type: ${questionType}
- ${typeInstructions[questionType]}

QUALITY STANDARDS:
- Questions must be directly answerable from the provided content
- Avoid questions requiring external knowledge
- Each question should test a different concept/fact
- Provide clear, educational explanations for correct answers
- Use varied question stems and formats

OUTPUT FORMAT (JSON only, no markdown):
{
  "questions": [
    {
      "id": "unique_id_string",
      "question": "Clear, specific question text",
      "choices": ["Option A", "Option B", "Option C", "Option D"],
      "correct": "Exact text of correct option",
      "explanation": "Clear explanation of why this answer is correct and others are wrong",
      "difficulty": "${difficulty}",
      "concept": "Main concept being tested"
    }
  ]
}

Generate the quiz now:`
  }

  async generateQuiz(config, summary) {
    try {
      const prompt = this.createPrompt(config, summary)
      const result = await this.model.generateContent(prompt)
      const responseText = result.response.text()

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response")
      }

      const cleanJson = jsonMatch[0]
      const data = JSON.parse(cleanJson)

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid response format: missing questions array")
      }

      data.questions.forEach((q, index) => {
        if (!q.id || !q.question || !q.choices || !q.correct || !q.explanation) {
          throw new Error(`Invalid question format at index ${index}`)
        }
        if (!Array.isArray(q.choices) || q.choices.length === 0) {
          throw new Error(`Invalid choices format at index ${index}`)
        }
        if (!q.choices.includes(q.correct)) {
          throw new Error(`Correct answer not found in choices at index ${index}`)
        }
      })

      return data
    } catch (error) {
      console.error("Gemini API Error:", error)
      throw new Error(`Quiz generation failed: ${error.message}`)
    }
  }
}

export default function PerfectQuizPlatform({ summarization }) {

  const [config, setConfig] = useState(INITIAL_CONFIG)
  const [quiz, setQuiz] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentStep, setCurrentStep] = useState("setup") 
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [error, setError] = useState(null)


  const quizGenerator = useMemo(() => {
    try {
      return new GeminiQuizGenerator()
    } catch (error) {
      setError("Failed to initialize Gemini AI. Please check your API key.")
      return null
    }
  }, [])

  const progress = useMemo(() => {
    if (quiz.length === 0) return 0
    return (Object.keys(answers).length / quiz.length) * 100
  }, [answers, quiz.length])

  const results = useMemo(() => {
    if (currentStep !== "results") return null
    
    const correctAnswers = quiz.filter((q, index) => answers[index] === q.correct)
    const score = correctAnswers.length
    const percentage = Math.round((score / quiz.length) * 100)
    const timeTaken = endTime && startTime ? Math.round((endTime - startTime) / 1000) : 0
    
    let grade = "F"
    let gradeColor = "text-red-600"
    if (percentage >= 90) { grade = "A+"; gradeColor = "text-green-600" }
    else if (percentage >= 80) { grade = "A"; gradeColor = "text-green-600" }
    else if (percentage >= 70) { grade = "B"; gradeColor = "text-blue-600" }
    else if (percentage >= 60) { grade = "C"; gradeColor = "text-yellow-600" }
    else if (percentage >= 50) { grade = "D"; gradeColor = "text-orange-600" }

    return { score, total: quiz.length, percentage, grade, gradeColor, timeTaken, correctAnswers }
  }, [currentStep, quiz, answers, endTime, startTime])

  const handleConfigChange = useCallback((key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setError(null) 
  }, [])

  const generateQuiz = useCallback(async () => {
    if (!summarization?.summary) {
      setError("No summary content available for quiz generation")
      return
    }

    if (!quizGenerator) {
      setError("Quiz generator not initialized. Please check your Gemini API key.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await quizGenerator.generateQuiz(config, summarization.summary)
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions were generated")
      }

      const requestedCount = parseInt(config.numQuestions)
      if (data.questions.length !== requestedCount) {
        console.warn(`Generated ${data.questions.length} questions instead of ${requestedCount}`)
      }

      setQuiz(data.questions)
      setCurrentStep("quiz")
      setStartTime(Date.now())
      setAnswers({})
      toast.success(`Generated ${data.questions.length} ${config.difficulty} questions!`)
    } catch (error) {
      console.error("Quiz generation error:", error)
      setError(error.message || "Failed to generate quiz. Please try again.")
      toast.error("Quiz generation failed")
    } finally {
      setLoading(false)
    }
  }, [config, summarization, quizGenerator])

  const handleAnswer = useCallback((questionIndex, choice) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: choice }))
  }, [])

  const submitQuiz = useCallback(() => {
    const unansweredCount = quiz.length - Object.keys(answers).length
    if (unansweredCount > 0) {
      toast.error(`Please answer all questions. ${unansweredCount} remaining.`)
      return
    }
    
    setEndTime(Date.now())
    setCurrentStep("results")
    toast.success("Quiz submitted successfully!")
  }, [answers, quiz.length])

  const resetQuiz = useCallback(() => {
    setConfig(INITIAL_CONFIG)
    setQuiz([])
    setAnswers({})
    setCurrentStep("setup")
    setStartTime(null)
    setEndTime(null)
    setError(null)
  }, [])

  const retakeQuiz = useCallback(() => {
    setAnswers({})
    setCurrentStep("quiz")
    setStartTime(Date.now())
    setEndTime(null)
  }, [])

  if (error && currentStep === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-red-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-700 flex items-center justify-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Configuration Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => setError(null)} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === "setup") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              AI Quiz Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="numQuestions" className="text-sm font-medium">
                Number of Questions
              </Label>
              <Input
                id="numQuestions"
                type="number"
                min={3}
                max={15}
                value={config.numQuestions}
                onChange={(e) => handleConfigChange("numQuestions", e.target.value)}
                className="mt-1"
                placeholder="3-15 questions"
              />
              <p className="text-xs text-gray-500 mt-1">Choose between 3-15 questions</p>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Difficulty Level</Label>
              <Select value={config.difficulty} onValueChange={(value) => handleConfigChange("difficulty", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        <div className="m-3">
                          <div className="font-medium">{option.label}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Question Type</Label>
              <Select value={config.questionType} onValueChange={(value) => handleConfigChange("questionType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={generateQuiz}
              disabled={loading || !summarization?.summary || !quizGenerator}
              className="w-full h-11"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Quiz with AI...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Quiz
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === "results") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Quiz Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className={`text-6xl font-bold ${results.gradeColor}`}>
                {results.percentage}%
              </div>
              <Badge variant="secondary" className={`text-lg px-4 py-2 ${results.gradeColor}`}>
                Grade: {results.grade}
              </Badge>
              <div className="flex justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {results.score}/{results.total} Correct
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  {Math.floor(results.timeTaken / 60)}m {results.timeTaken % 60}s
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  {config.difficulty} Level
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-center">Question Review</h3>
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {quiz.map((question, index) => {
                  const userAnswer = answers[index]
                  const isCorrect = userAnswer === question.correct
                  
                  return (
                    <Card key={question.id || index} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 mb-2">
                              {index + 1}. {question.question}
                            </p>
                            <div className="space-y-2 text-sm">
                              <div className="flex flex-wrap gap-2">
                                <span className="text-gray-600">Your answer:</span>
                                <Badge variant={isCorrect ? "default" : "destructive"}>
                                  {userAnswer || "Not answered"}
                                </Badge>
                              </div>
                              {!isCorrect && (
                                <div className="flex flex-wrap gap-2">
                                  <span className="text-gray-600">Correct answer:</span>
                                  <Badge variant="default" className="bg-green-500">
                                    {question.correct}
                                  </Badge>
                                </div>
                              )}
                              {question.explanation && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    <strong>Explanation:</strong> {question.explanation}
                                  </p>
                                </div>
                              )}
                              {question.concept && (
                                <div className="flex gap-2 items-center">
                                  <span className="text-gray-500 text-xs">Concept:</span>
                                  <Badge variant="outline" className="text-xs">
                                    {question.concept}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={retakeQuiz} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
              <Button onClick={resetQuiz} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Generate New Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              AI Quiz Challenge
            </h1>
            <div className="flex justify-center gap-4 text-sm text-gray-600">
              <Badge variant="outline">{config.difficulty} Level</Badge>
              <Badge variant="outline">{QUESTION_TYPES.find(t => t.value === config.questionType)?.label}</Badge>
              <Badge variant="outline">{quiz.length} Questions</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress: {Math.round(progress)}%</span>
              <span>{Object.keys(answers).length} of {quiz.length} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="space-y-6">
          {quiz.map((question, index) => {
            const userAnswer = answers[index]
            const isAnswered = userAnswer !== undefined
            
            return (
              <Card key={question.id || index} className={`shadow-md transition-all ${isAnswered ? 'ring-2 ring-blue-200' : ''}`}>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Question {index + 1}
                      </Badge>
                      {question.concept && (
                        <Badge variant="secondary" className="text-xs">
                          {question.concept}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {question.question}
                    </h3>
                  </div>
                  
                  <div className={`grid gap-3 ${question.choices.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {question.choices.map((choice, choiceIndex) => {
                      const isSelected = userAnswer === choice
                      
                      return (
                        <Button
                          key={choiceIndex}
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => handleAnswer(index, choice)}
                          className="h-auto p-4 text-left justify-start whitespace-normal hover:scale-[1.02] transition-transform"
                        >
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${isSelected ? 'border-white' : 'border-current'}`}>
                            {isSelected && <div className="w-3 h-3 rounded-full bg-white" />}
                          </span>
                          <span className="text-sm">{choice}</span>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <Button 
            onClick={submitQuiz} 
            size="lg" 
            className="px-12"
            disabled={Object.keys(answers).length === 0}
          >
            {Object.keys(answers).length === quiz.length 
              ? "Submit Quiz" 
              : `Submit Quiz (${quiz.length - Object.keys(answers).length} unanswered)`
            }
          </Button>
        </div>
      </div>
    </div>
  )
}