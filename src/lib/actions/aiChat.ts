export type AIChatResponse = {
  success: boolean;
  message: string;
};

export type AIChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export const sendAIMessage = async (
  message: string,
  history: AIChatMessage[] = []
): Promise<AIChatResponse> => {
  const response = await fetch("/api/ai/support", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [...history, { role: "user", content: message }],
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Support agent request failed");
  }

  return result;
};