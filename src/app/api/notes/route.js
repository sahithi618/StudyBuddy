import { db } from "@/lib/database";
import { checkUser } from "@/lib/auth";

export async function GET() {
  const user = await checkUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const notes = await db.note.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return new Response(JSON.stringify(notes), { status: 200 });
  } catch (error) {
    console.error("GET /api/notes error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function POST(req) {
  const user = await checkUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title?.trim()) {
      return new Response(JSON.stringify({ error: "Title required" }), { status: 400 });
    }

    const note = await db.note.create({
      data: {
        title: body.title,
        userId: user.id, 
      },
    });

    return new Response(JSON.stringify(note), { status: 201 });
  } catch (error) {
    console.error("POST /api/notes error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
