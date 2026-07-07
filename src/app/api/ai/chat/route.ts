import { NextResponse } from "next/server";
import { requireManager } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Uses Groq (free tier) via its OpenAI-compatible API. Get a free key at
// https://console.groq.com/keys and set GROQ_API_KEY in .env. No SDK dependency.
const GROQ_MODEL = "llama-3.3-70b-versatile";
const SYSTEM_PROMPT =
  "You are a concise assistant for an engineering manager. Answer using only the weekly report data provided. If the data does not contain the answer, say so.";

const UNAVAILABLE = {
  error: "AI assistant is unavailable. Ensure GROQ_API_KEY is configured.",
};

export async function POST(req: Request) {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }
  const { question } = (await req.json().catch(() => ({}))) as { question?: string };
  if (!question) return NextResponse.json({ error: "Question required" }, { status: 400 });

  // Context-stuffing rather than embeddings/RAG: report volume is small enough
  // to fit the most recent 50 directly in the prompt, so no vector store is needed.
  const reports = await prisma.weeklyReport.findMany({
    orderBy: { weekStartDate: "desc" },
    take: 50,
    include: { user: { select: { name: true } }, project: { select: { name: true } } },
  });

  const context = reports
    .map(
      (r) =>
        `- ${r.user.name} | ${r.project.name} | ${new Date(r.weekStartDate).toLocaleDateString()} | status:${r.status} | done:${r.tasksCompleted} | blockers:${r.blockers ?? "none"}`,
    )
    .join("\n");

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json(UNAVAILABLE, { status: 503 });

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 1024,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Weekly reports:\n${context}\n\nQuestion: ${question}`,
          },
        ],
      }),
    });

    if (!res.ok) return NextResponse.json(UNAVAILABLE, { status: 503 });

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const answer = data.choices?.[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ answer: answer || "No answer returned." });
  } catch {
    return NextResponse.json(UNAVAILABLE, { status: 503 });
  }
}
