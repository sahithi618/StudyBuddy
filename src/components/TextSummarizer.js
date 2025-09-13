'use client'
import { useState, useEffect } from 'react'
import { FiCopy, FiDownload } from 'react-icons/fi'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { toast } from "react-hot-toast"
import { IoMdArrowRoundBack } from "react-icons/io"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import SummarizationInputPanel from './SummarizationInputPanel'
import SummarizationHistoryPanel from './SummarizationHistoryPanel'
import AgentPlanMonitor from './AgentPlanMonitor'

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable")
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

export default function TextSummarizer({ noteId }) {
  const router = useRouter()
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [previewSummary, setPreviewSummary] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [lastGeneratedSummary, setLastGeneratedSummary] = useState(null)

  const [planPreferences, setPlanPreferences] = useState({
    strategy: "balanced",
    priority: "accuracy",
    complexity: "medium"
  })

  const [file, setFile] = useState(null)
  const [isExtractingPdf, setIsExtractingPdf] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [currentLog, setCurrentLog] = useState('')

  const [summarizationOptions, setSummarizationOptions] = useState({
    length: 'medium',
    format: 'paragraph',
    focus: 'keyPoints'
  })

  useEffect(() => {
    const fetchSummarizations = async () => {
      try {
        const res = await fetch(`/api/notes/${noteId}/summarizations`)
        if (!res.ok) throw new Error("Failed to load summarizations")
        const data = await res.json()

        const loadedHistory = []
        data.forEach(item => {
          loadedHistory.push({
            role: "user",
            content: item.inputText,
            timestamp: new Date(item.createdAt).toLocaleTimeString()
          })
          loadedHistory.push({
            role: "assistant",
            content: "Summary generated. Click below to view or copy.",
            summary: item.summary,
            timestamp: new Date(item.createdAt).toLocaleTimeString()
          })
        })

        setChatHistory(loadedHistory)
      } catch (err) {
        console.error("Error fetching summarizations:", err)
      }
    }

    if (noteId) {
      fetchSummarizations()
    }
  }, [noteId])

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      toast.error('Please enter some text to summarize or upload a PDF');
      return
    }

    const userMessage = { 
      role: 'user', 
      content: userInput,
      timestamp: new Date().toLocaleTimeString()
    }
    
    setChatHistory(prev => [...prev, userMessage])
    setUserInput('')
    setFile(null)
    setIsLoading(true)

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      
      const lengthMap = {
        short: 'very concise (1-2 sentences)',
        medium: 'concise (1 paragraph)',
        long: 'detailed but still summarized (2-3 paragraphs)'
      }
      
      const formatMap = {
        paragraph: 'a coherent paragraph',
        bullet: 'bullet points',
        numbered: 'numbered list'
      }
      
      const focusMap = {
        keyPoints: 'focus on the key points and main ideas',
        detailed: 'include important details along with main ideas',
        actionItems: 'focus on action items and conclusions'
      }

      const strategyInstruction = planPreferences.strategy === 'fast' ? 
        'Prioritize speed and efficiency.' : 
        planPreferences.strategy === 'thorough' ? 
        'Be comprehensive and detailed in analysis.' : 
        'Balance speed and thoroughness.'

      const priorityInstruction = planPreferences.priority === 'speed' ?
        'Generate quickly with good quality.' :
        planPreferences.priority === 'creativity' ?
        'Use creative and engaging language.' :
        'Ensure maximum accuracy and precision.'
      
      const prompt = `
        Please summarize the following text according to these specifications:
        - Length: ${lengthMap[summarizationOptions.length]}
        - Format: ${formatMap[summarizationOptions.format]}
        - Focus: ${focusMap[summarizationOptions.focus]}
        - Strategy: ${strategyInstruction}
        - Priority: ${priorityInstruction}
        
        Text to summarize:
        "${userInput}"

        Format the summary with clear, concise points using simple dashes (-) instead of asterisks.
        Make each point well-structured and easily readable. Avoid using *** or ** or * for formatting or highlighting.
        If the format is bullet points or numbered list, ensure each item is a complete sentence without the asterisks.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const summary = response.text()

      
      setLastGeneratedSummary({
        inputText: userInput,
        summary: summary
      })

      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Summary generated. Click below to view or copy.',
        summary: summary,
        timestamp: new Date().toLocaleTimeString()
      }])

      toast.success('Summary generated successfully')

    } catch (error) {
      console.error(error)
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Error generating summary. Please try again.',
        isError: true
      }])
      toast.error('Failed to generate summary')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!lastGeneratedSummary) {
      toast.error('No summary to save');
      return;
    }

    try {
      await fetch(`/api/notes/${noteId}/summarizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastGeneratedSummary),
      });
      
      toast.success('Summary saved successfully');
      setLastGeneratedSummary(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save summary');
    }
  }

  const handleDownload = (summary) => {
    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'summary.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Summary downloaded')
  }

  const handlePlanUpdate = (newPreferences) => {
    setPlanPreferences(newPreferences)
    toast.success('Plan preferences updated')
  }

  return (
    <div className="flex flex-col bg-muted/40">
      <div className="flex justify-between items-center p-4 bg-blue-600 text-primary-foreground shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
        >
          <IoMdArrowRoundBack className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-right">AI Summarizer</h1>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <div className="flex flex-col lg:grid lg:gap-6 h-full lg:grid-cols-12">
          <div className="lg:col-span-3 order-2 lg:order-1 mb-4 lg:mb-0">
            <SummarizationInputPanel
              userInput={userInput}
              setUserInput={setUserInput}
              summarizationOptions={summarizationOptions}
              setSummarizationOptions={setSummarizationOptions}
              file={file}
              setFile={setFile}
              isLoading={isLoading}
              isExtractingPdf={isExtractingPdf}
              pdfError={pdfError}
              currentLog={currentLog}
              onSubmit={handleSubmit}
              onSave={handleSave}
              lastGeneratedSummary={lastGeneratedSummary}
            />
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col mb-4 lg:mb-0">
            <SummarizationHistoryPanel
              chatHistory={chatHistory}
              isLoading={isLoading}
              currentLog={currentLog}
              onPreviewSummary={setPreviewSummary}
            />
          </div>
          <div className="lg:col-span-4 order-3 lg:order-3">
            <AgentPlanMonitor
              isProcessing={isLoading}
              onPlanUpdate={handlePlanUpdate}
              currentInput={userInput}
              summarizationOptions={summarizationOptions}
            />
          </div>
        </div>
      </div>

      <Dialog open={!!previewSummary} onOpenChange={() => setPreviewSummary('')}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Summary Preview</DialogTitle>
            <DialogDescription>
              This is the generated summary based on your input text and selected options
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="preview" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="raw">Raw Text</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="flex-1 overflow-auto mt-0">
                <ScrollArea className="h-full pr-4">
                  <div className="prose max-w-none p-2 sm:p-4 text-sm sm:text-base">
                    {previewSummary.split('\n').map((paragraph, index) => (
                      paragraph.trim() ? <p key={index} className="mb-4">{paragraph}</p> : null
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="raw" className="flex-1 overflow-auto mt-0">
                <ScrollArea className="h-full">
                  <pre className="whitespace-pre-wrap p-2 sm:p-4 text-xs sm:text-sm">{previewSummary}</pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => handleDownload(previewSummary)}
              className="flex-1 sm:flex-none"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <Button
              onClick={() => {
                navigator.clipboard.writeText(previewSummary)
                toast.success('Summary copied to clipboard!')
              }}
              className="flex-1 sm:flex-none"
            >
              <FiCopy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}