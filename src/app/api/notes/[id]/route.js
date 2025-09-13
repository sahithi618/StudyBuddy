import { db } from "@/lib/database"

export async function GET(_req, { params }) {
  const {id}=await(params);
  const note = await db.note.findUnique({
    where: { id: id },
    include: { summarizations: true }
  })
  return Response.json(note)
}

export async function PUT(req, { params }) {
  const { title } = await req.json()
  const {id}=await(params);
  const updated = await db.note.update({
    where: { id: id },
    data: { title }
  })
  return Response.json(updated)
}

export async function DELETE(_req, { params }) {
  const {id}=await(params);
  await db.note.delete({ where: { id:id } })
  return Response.json({ message: "Note deleted" })
}
