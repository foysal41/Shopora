"use client";

import { useState } from "react";
import {
  Bot,
  X,
  Send,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { sendAIMessage } from "@/lib/actions/aiChat";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

export default function ShoporaAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hi! 👋 I'm Shopora Assistant. How can I help you today?",
    },
  ]);

  // -------------------------------------------------------
  // CLEAN AI RESPONSE
  // -------------------------------------------------------

  const cleanAssistantText = (text: string) => {
    return text
      .replace(/\|/g, "")
      .replace(/-{3,}/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  // -------------------------------------------------------
  // SEND MESSAGE
  // -------------------------------------------------------

  const handleSend = async () => {
    const message = input.trim();

    if (!message || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendAIMessage(message);

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: response.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI CHAT ERROR:", error);

      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: "Sorry, something went wrong. Please try again.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------
  // ENTER KEY
  // -------------------------------------------------------

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* =====================================================
          FLOATING CHAT BUTTON
      ====================================================== */}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Shopora Assistant"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0F766E] text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#0B625B]"
        >
          <Bot
            size={26}
            strokeWidth={2}
          />
        </button>
      )}

      {/* =====================================================
          CHAT WINDOW
      ====================================================== */}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-150 w-95 max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-[#E5EEEE] bg-white shadow-2xl">

          {/* =================================================
              HEADER
          ================================================== */}

          <div className="flex shrink-0 items-center justify-between bg-[#0F766E] px-5 py-4 text-white">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <Bot size={22} />
              </div>

              <div>
                <h3 className="font-['Poppins'] text-[15px] font-semibold">
                  Shopora Assistant
                </h3>

                <div className="mt-0.5 flex items-center gap-1.5">

                  <span className="h-2 w-2 rounded-full bg-[#FF6B6B]" />

                  <span className="font-['Poppins'] text-[12px] text-white/80">
                    Online
                  </span>

                </div>
              </div>

            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
              className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
            >
              <X size={20} />
            </button>

          </div>

          {/* =================================================
              MESSAGES
          ================================================== */}

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#F8FAFA] p-4">

            <div className="space-y-4">

              {messages.map((message) => (

                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 font-['Poppins'] text-[14px] leading-6 ${
                      message.role === "user"
                        ? "rounded-br-md bg-[#0F766E] text-white"
                        : "rounded-bl-md border border-[#E5EEEE] bg-white text-[#1E293B]"
                    }`}
                  >

                    {message.role === "assistant" ? (

                      <ReactMarkdown
                        components={{

                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">
                              {children}
                            </p>
                          ),

                          strong: ({ children }) => (
                            <strong className="font-semibold text-[#0F766E]">
                              {children}
                            </strong>
                          ),

                          em: ({ children }) => (
                            <em className="italic">
                              {children}
                            </em>
                          ),

                          ul: ({ children }) => (
                            <ul className="my-2 list-disc space-y-1 pl-5">
                              {children}
                            </ul>
                          ),

                          ol: ({ children }) => (
                            <ol className="my-2 list-decimal space-y-1 pl-5">
                              {children}
                            </ol>
                          ),

                          li: ({ children }) => (
                            <li>{children}</li>
                          ),

                          h1: ({ children }) => (
                            <h1 className="mb-2 text-[16px] font-semibold">
                              {children}
                            </h1>
                          ),

                          h2: ({ children }) => (
                            <h2 className="mb-2 text-[15px] font-semibold">
                              {children}
                            </h2>
                          ),

                          h3: ({ children }) => (
                            <h3 className="mb-2 text-[14px] font-semibold">
                              {children}
                            </h3>
                          ),
                        }}
                      >
                        {cleanAssistantText(message.text)}
                      </ReactMarkdown>

                    ) : (

                      message.text

                    )}

                  </div>

                </div>

              ))}

              {/* =================================================
                  LOADING
              ================================================== */}

              {isLoading && (

                <div className="flex justify-start">

                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-[#E5EEEE] bg-white px-4 py-3">

                    <Loader2
                      size={16}
                      className="animate-spin text-[#0F766E]"
                    />

                    <span className="font-['Poppins'] text-[14px] text-[#64748B]">
                      Thinking...
                    </span>

                  </div>

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              INPUT
          ================================================== */}

          <div className="shrink-0 border-t border-[#E5EEEE] bg-white p-4">

            <div className="flex items-center gap-2 rounded-xl border border-[#DDE5E5] bg-[#FCFDFD] px-3 py-2 focus-within:border-[#0F766E]">

              <input
                type="text"
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="min-w-0 flex-1 bg-transparent font-['Poppins'] text-[14px] text-[#1E293B] outline-none placeholder:text-[#94A3B8] disabled:cursor-not-allowed"
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="flex cursor-pointer h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0F766E] text-white transition hover:bg-[#0B625B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}