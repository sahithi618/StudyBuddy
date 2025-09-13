"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { ChevronRight, Trash } from "lucide-react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import Flashcards from "@/components/Flashcards"
import Quiz from "@/components/Quiz"
import Mindmap from "@/components/Mindmap"
import Loading from "@/app/loading"

export default function NoteDetail() {
  const { id } = useParams()
  const [note, setNote] = useState(null)
  const [activeSummarization, setActiveSummarization] = useState(null)
  const [activeView, setActiveView] = useState("flashcards")
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then((res) => res.json())
      .then((noteData) => {
        setNote(noteData)
        if (noteData?.summarizations?.length > 0) {
          setActiveSummarization(noteData.summarizations[0])
        }
      })
      .catch((err) => console.error("Failed to fetch note:", err))
  }, [id])

  if (!note) return <Loading />

  async function deleteSummarization(sumId) {
    await fetch(`/api/summarizations/${sumId}`, {
      method: "DELETE",
    })
    router.refresh(`/notes/${id}`)
    const updatedSummarizations = note.summarizations.filter((s) => s.id !== Number(sumId))
    
    setNote((prev) => ({
      ...prev,
      summarizations: updatedSummarizations,
    }))

    if (activeSummarization?.id === sumId) {
      if (updatedSummarizations.length > 0) {
        setActiveSummarization(updatedSummarizations[0])
      } else {
        setActiveSummarization(null)
        setActiveView("flashcards")
      }
    }
  }

  const handleViewChange = (view) => {
    setActiveView((prev) => (prev === view ? null : view))
  }

  return (
    <div className="flex h-screen">
      <aside className="w-72 border-r bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex flex-col">
        <Link
          href={`/notes/${id}/summarize`}
          className="block mb-4 px-3 py-2 rounded-lg text-center font-medium bg-black text-white shadow-sm hover:bg-gray-800 transition-colors"
        >
          + Add Summarization
        </Link>

        {!note?.summarizations?.length && (
          <p className="text-gray-500 text-sm text-center">No summarizations yet.</p>
        )}

        <ScrollArea className="flex-1 pr-2">
          <ul className="space-y-3">
            {note?.summarizations?.map((sum) => (
              <li key={sum.id} className="flex items-center rounded-xl shadow-sm border bg-white">
                <button
                  onClick={() => {
                    setActiveSummarization(sum)
                    setActiveView("flashcards") // Always show flashcards when selecting a summarization
                  }}
                  className={`flex-1 px-4 py-3 flex flex-col items-start rounded-l-xl transition-colors ${
                    activeSummarization?.id === sum.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white hover:bg-blue-50"
                  }`}
                >
                  <span className="w-full text-left truncate text-sm font-medium">
                    {sum.inputText.slice(0, 23)}
                  </span>
                  <span
                    className={`text-xs mt-1 ${
                      activeSummarization?.id === sum.id
                        ? "text-blue-100"
                        : "text-gray-400"
                    }`}
                  >
                    {new Date(sum.createdAt).toLocaleDateString()}
                  </span>
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-r-xl rounded-l-none">
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Summarization?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the summarization.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => deleteSummarization(sum.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {!activeSummarization ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {note?.summarizations?.length === 0 
              ? "No summarizations available. Click '+ Add Summarization' to get started."
              : "Select a summarization from the left."
            }
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-800">
                  {note.title}
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Created: {new Date(activeSummarization.createdAt).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center gap-2 font-medium cursor-pointer hover:text-blue-600 transition-colors">
                    <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                    Input
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="text-gray-700 max-h-40 overflow-y-auto whitespace-pre-line border p-3 font-semibold text-base rounded bg-gray-50">
                      {activeSummarization.inputText}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 font-medium cursor-pointer hover:text-blue-600 transition-colors">
                    <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                    Summary
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="text-gray-800 text-base whitespace-pre-line border p-3 font-semibold rounded bg-white">
                      {activeSummarization.summary}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant={activeView === "flashcards" ? "default" : "outline"}
                onClick={() => handleViewChange("flashcards")}
                className="transition-all"
              >
                Flashcards
              </Button>
              <Button
                variant={activeView === "quizzes" ? "default" : "outline"}
                onClick={() => handleViewChange("quizzes")}
                className="transition-all"
              >
                Quizzes
              </Button>
              <Button
                variant={activeView === "mindmaps" ? "default" : "outline"}
                onClick={() => handleViewChange("mindmaps")}
                className="transition-all"
              >
                Mind Map
              </Button>
            </div>

            <div>
              {activeView === "flashcards" && (
                <Flashcards summarization={activeSummarization} />
              )}
              {activeView === "quizzes" && (
                <Quiz summarization={activeSummarization} />
              )}
              {activeView === "mindmaps" && (
                <Mindmap summarization={activeSummarization} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}