import { NextResponse } from "next/server";

type SupportMessage = {
  role: "user" | "assistant";
  content: string;
};

const systemPrompt = `You are Shopora's customer support AI agent.

Help customers with orders, delivery, returns, payments, account settings, products, and using the Shopora website. Be concise, friendly, and practical. Never claim to have accessed an order, account, payment, refund, or shipment unless that information is present in the conversation. You cannot perform account changes, cancel orders, issue refunds, or access private customer data. When an action requires a human agent, explain the next step and direct the customer to support@shopora.com. Ask for an order number when it is needed, but never ask for passwords, card numbers, authentication codes, or other secrets.

If a question is unrelated to Shopora support, briefly say what you can help with and redirect the customer to Shopora topics.`;

const getLastUserMessage = (messages: SupportMessage[]) =>
  messages.filter((message) => message.role === "user").at(-1)?.content ?? "";

const forwardToBackendAgent = async (messages: SupportMessage[]) => {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!backendUrl) return null;

  const response = await fetch(`${backendUrl}/api/v1/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: getLastUserMessage(messages) }),
  });
  const result = await response.json();

  if (!response.ok || !result?.message) {
    throw new Error(result?.message || "The support backend is unavailable");
  }

  return NextResponse.json({ success: true, message: result.message });
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = body?.messages as SupportMessage[] | undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one message is required" },
        { status: 400 }
      );
    }

    const validMessages = messages
      .filter(
        (message) =>
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.trim().length > 0
      )
      .slice(-12)
      .map((message) => ({
        role: message.role,
        content: message.content.trim().slice(0, 4000),
      }));

    if (!validMessages.some((message) => message.role === "user")) {
      return NextResponse.json(
        { success: false, message: "A user message is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      try {
        const backendResponse = await forwardToBackendAgent(validMessages);

        if (backendResponse) return backendResponse;
      } catch (error) {
        console.error("BACKEND SUPPORT AI ERROR:", error);
      }

      return NextResponse.json(
        {
          success: false,
          message: "The support agent is not configured. Add OPENROUTER_API_KEY or start the AI backend.",
        },
        { status: 503 }
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Shopora Customer Support",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            { role: "system", content: systemPrompt },
            ...validMessages,
          ],
          temperature: 0.3,
          max_tokens: 700,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result?.error?.message || "The support agent is unavailable",
        },
        { status: 502 }
      );
    }

    const message = result?.choices?.[0]?.message?.content;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "The support agent returned no response" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: message.trim() });
  } catch (error) {
    console.error("SUPPORT AI ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to reach the support agent" },
      { status: 500 }
    );
  }
}