import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(req, { params }) {
  try {
    const {id}=await(params);
    const body = await req.json()
    const { inputText, summary } = body

    if (!inputText || !summary) {
      return NextResponse.json({ error: "Missing inputText or summary" }, { status: 400 })
    }

    const newSummarization = await db.summarization.create({
      data: {
        inputText,
        summary,
        noteId: id,
      },
    })

    return NextResponse.json(newSummarization, { status: 201 })
  } catch (err) {
    console.error("Error saving summarization:", err)
    return NextResponse.json({ error: "Failed to save summarization" }, { status: 500 })
  }
}

export async function GET(_req, { params }) {
  try {
    const {id}=await(params); 
    const summarizations = await db.summarization.findMany({
      where: { noteId: id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(summarizations)
  } catch (err) {
    console.error("Error fetching summarizations:", err)
    return NextResponse.json({ error: "Failed to fetch summarizations" }, { status: 500 })
  }
}
