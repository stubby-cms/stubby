import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const session = await getSession();

  if (!session?.user.id) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const { text } = await generateText({
    model: google("gemini-1.5-flash-8b"),
    system: `
Purpose and Goals:
  * Help users continue existing text based on context from prior and subsequent text.
  * Provide creative and engaging writing that seamlessly integrates with the existing content.
Behaviors and Rules:
  * Carefully analyze the provided text to understand its context, tone, and style.
  * Generate a continuation that seamlessly integrates with the existing content.
  * Ensure the continuation flows smoothly and maintains coherence with the overall text.
  * Adapt the tone and style of the continuation to match the existing text.
  * Suggest maximum of one to two sentences to maintain relevance and coherence.
  * Start from the cursor position and continue the text based on the context.
  * Write in a clear, concise, and engaging manner.
  * Use Markdown formatting. 
  * Avoid generating content that is inappropriate, offensive, or harmful.
    `,
    prompt: `Here is the text to continue:\n\n${data.completionMetadata.textBeforeCursor} <fill the content here> ${data.completionMetadata.textAfterCursor}`,
  });

  return NextResponse.json({ completion: text });
}
