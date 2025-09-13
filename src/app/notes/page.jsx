"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Trash2, Plus, FileText, Calendar, Search, Grid, List } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Loading from "../loading"

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [title, setTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const router = useRouter()

  useEffect(() => {
    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => {
        setNotes(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" })
      setNotes(notes.filter((note) => note.id !== id))
      router.push("/notes")
    } catch (err) {
      console.error("Error deleting note", err)
    }
  }

  const createNote = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })

      if (!res.ok) {
        console.error("Failed to create note")
        return
      }

      const note = await res.json()
      setNotes([note, ...notes]) 
      setTitle("")
      router.push(`/notes/${note.id}`)
    } finally {
      setSaving(false)
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <Loading/>
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">
                My Notes
              </h1>
              <p className="text-slate-600 text-lg">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'} in your collection
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-black shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-blue-800" />
                    Create New Note
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Give your note a memorable title. You'll be able to edit the content right after creating it.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your note title..."
                    className="text-lg h-12 border-2 focus:border-blue-600 focus:ring-blue-500/20"
                    onKeyDown={(e) => e.key === 'Enter' && createNote()}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={createNote}
                    disabled={saving || !title.trim()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Note
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Search your notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-2 bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-12 px-4"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-12 px-4"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            {notes.length === 0 ? (
              <>
                <h3 className="text-2xl font-semibold text-slate-700 mb-2">No notes yet</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Start your journey by creating your first note.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-slate-700 mb-2">No matching notes</h3>
                <p className="text-slate-500">
                  Try adjusting your search terms to find what you're looking for.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredNotes.map((note, index) => (
              <Card 
                key={note.id} 
                className={`group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4 ${viewMode === "list" ? "flex-row" : ""}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className={`pb-3 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/notes/${note.id}`}
                        className="block group-hover:text-blue-600 transition-colors duration-200"
                      >
                        <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {note.title}
                        </h3>
                      </Link>
                      <div className="flex items-center text-sm text-slate-500 space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                          Updated {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                      </div>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setNoteToDelete(note.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 hover:text-red-600 ml-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl">Delete Note?</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-600">
                            This action cannot be undone. <strong>"{note.title}"</strong> will be permanently deleted from your collection.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="hover:bg-slate-50">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            onClick={() => handleDelete(noteToDelete)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Note
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                
                {viewMode === "grid" && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <Link
                      href={`/notes/${note.id}`}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
                    >
                      Open note
                      <span className="ml-1 transform transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}