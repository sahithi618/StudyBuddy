'use client'
import { useRef, useEffect } from 'react'
import { IoMdDocument } from 'react-icons/io'
import { FiCopy } from 'react-icons/fi'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "react-hot-toast"

export default function SummarizationHistoryPanel({
  chatHistory,
  isLoading,
  onPreviewSummary
}) {
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isLoading])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <IoMdDocument className="h-5 w-5" />
          Summarization History
        </CardTitle>
        <CardDescription>Previous summaries you've generated</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-2 lg:pr-4">
          <div className="space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <IoMdDocument className="h-10 w-10 mx-auto mb-3 text-muted-foreground/60" />
                <p className="text-sm">Enter text to summarize or upload a PDF to get started</p>
              </div>
            )}
            
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2 lg:gap-3`}>
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 hidden sm:block">
                    <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <IoMdDocument className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                    </div>
                  </div>
                )}
                
                <div className={`max-w-[85%] lg:max-w-3xl p-3 lg:p-4 rounded-xl ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card border'}`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="relative">
                      <div className="flex flex-wrap items-center gap-1 lg:gap-2 text-xs lg:text-sm text-muted-foreground mb-2">
                        <span>{msg.timestamp}</span>
                        {msg.summary && <Badge variant="outline" className="text-xs">{msg.summary.length} chars</Badge>}
                      </div>
                      <p className="text-card-foreground text-sm lg:text-base">{msg.content}</p>
                      
                      {msg.summary && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => onPreviewSummary(msg.summary)}
                          >
                            👁️ View
                          </Button>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.summary)
                                    toast.success('Summary copied to clipboard!')
                                  }}
                                >
                                  <FiCopy className="h-3 w-3 lg:h-4 lg:w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy summary</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-primary-foreground/80 mb-1">{msg.timestamp}</div>
                      <p className="whitespace-pre-wrap text-sm lg:text-base line-clamp-3">{msg.content}</p>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="flex-shrink-0 hidden sm:block">
                    <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium text-sm">👤</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && chatHistory.length > 0 && !chatHistory[chatHistory.length - 1]?.isLoading && (
              <div className="flex justify-start gap-3">
                <div className="bg-card p-4 rounded-xl border w-full max-w-2xl">
                  <div className="flex items-center gap-3 text-muted-foreground text-sm lg:text-base">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                    <span>Generating summary...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}