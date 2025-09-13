'use client'
import { useState, useRef } from 'react'
import { FiFile, FiUpload } from 'react-icons/fi'
import { RiAiGenerate } from "react-icons/ri"
import { FaSave } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Upload, AlertCircle, X } from 'lucide-react'
import { toast } from "react-hot-toast"

export default function SummarizationInputPanel({
  userInput,
  setUserInput,
  summarizationOptions,
  setSummarizationOptions,
  file,
  setFile,
  isLoading,
  isExtractingPdf,
  pdfError,
  onSubmit,
  onSave,
  lastGeneratedSummary
}) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile)
      extractTextFromPdf(droppedFile)
    } else {
      toast.error('Please upload a PDF file')
    }
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      extractTextFromPdf(selectedFile)
    } else {
      toast.error('Please select a PDF file')
    }
  }

  const extractTextFromPdf = async (pdfFile) => {
    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await pdfFile.arrayBuffer()
      
      // Load PDF.js from CDN
      if (!window.pdfjsLib) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
        document.head.appendChild(script)
        
        await new Promise((resolve) => {
          script.onload = resolve
        })
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      }
      
      // Load the PDF document
      const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise
      let fullText = ''
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
        
        if (pageText) {
          fullText += `${pageText}\n\n`
        }
      }
      
      if (fullText.trim()) {
        setUserInput(fullText.trim())
        toast.success('Text extracted from PDF successfully')
      } else {
        toast.error('No text found in PDF')
      }
      
    } catch (error) {
      console.error('Error extracting text:', error)
      toast.error('Failed to extract text from PDF')
    }
  }

  const handleClearFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Create New Summary</CardTitle>
        <CardDescription>Enter text or upload a PDF</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 mb-4">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Summarization Options</CardTitle>
              <CardDescription>Customize your content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium mb-2">Length</label>
                  <Select 
                    value={summarizationOptions.length} 
                    onValueChange={(value) => setSummarizationOptions(prev => ({ ...prev, length: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2 flex-1 mt-2">
                  <label className="text-sm font-medium mb-2">Format</label>
                  <Select 
                    value={summarizationOptions.format} 
                    onValueChange={(value) => setSummarizationOptions(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paragraph">Paragraph</SelectItem>
                      <SelectItem value="bullet">Bullet Points</SelectItem>
                      <SelectItem value="numbered">Numbered List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              <div className="space-y-2 flex-1 mt-2">
                <label className="text-sm font-medium mb-2">Focus</label>
                <Select 
                  value={summarizationOptions.focus} 
                  onValueChange={(value) => setSummarizationOptions(prev => ({ ...prev, focus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Focus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyPoints">Key Points</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="actionItems">Action Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload PDF
              </CardTitle>
              <CardDescription>Extract text from PDF files</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {isDragging ? 'Drop PDF here' : 'Click or drag PDF'}
                    </p>
                    <p className="text-xs text-gray-500">PDF files only</p>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf"
                  className="hidden"
                />
              </div>

              {file && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <FiFile className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium truncate">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFile}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {isExtractingPdf && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-blue-700">Extracting text from PDF...</span>
                </div>
              )}

              {pdfError && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-800 font-medium">Error</p>
                      <p className="text-sm text-red-700">{pdfError}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="input-text" className="text-sm font-medium">
                Text to summarize {userInput.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({userInput.length.toLocaleString()} characters)
                  </span>
                )}
              </label>
              <Textarea
                id="input-text"
                value={userInput.length > 100 ? userInput.substring(0, 100) + '...' : userInput}
                onChange={(e) => {
                  if (userInput.length <= 100) {
                    setUserInput(e.target.value)
                  }
                }}
                placeholder="Paste or type text to summarize, or upload a PDF above..."
                className="min-h-[120px]"
                readOnly={userInput.length > 100}
              />
              {userInput.length > 100 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  <span>Showing first 100 characters of {userInput.length.toLocaleString()} total</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setUserInput('')}
                  >
                    Clear Text
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={onSubmit}
                disabled={isLoading || (!userInput.trim() && !file) || isExtractingPdf}
                className="flex-1 min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <div className="flex items-center gap-2 mr-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
                      </div>
                      <span>Generating...</span>
                    </div>
                  </>
                ) : (
                  <>
                    <RiAiGenerate className="h-4 w-4 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onSave}
                      disabled={!lastGeneratedSummary}
                      className="flex-shrink-0"
                    >
                      <FaSave className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save summary</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}