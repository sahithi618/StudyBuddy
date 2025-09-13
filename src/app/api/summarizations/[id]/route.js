import { db } from '@/lib/database'


export async function POST(req) {
  const { noteId, inputText, summary } = await req.json()
  const summarization = await db.summarization.create({
    data: { noteId, inputText, summary }
  })
  return Response.json(summarization)
}


export async function DELETE(_req, { params }) {
  const {id} = await(params)
  const summarization = await db.summarization.delete({
    where: { id: id },
  })
  return Response.json(summarization)
}


