"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  X,
  Send,
  Loader2,
  Package,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { sendAIMessage } from "@/lib/actions/aiChat";
import { getProducts } from "@/lib/api/getProducts";
import type { getProduct } from "@/type/dashboard/Seller";
import Link from "next/link";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  products?: getProduct[];
};

const priceOf = (product: getProduct) =>
  product.salePrice > 0 && product.salePrice < product.regularPrice
    ? product.salePrice
    : product.regularPrice;

const discountOf = (product: getProduct) =>
  product.regularPrice > 0
    ? Math.round(((product.regularPrice - priceOf(product)) / product.regularPrice) * 100)
    : 0;

const findCatalogMatches = (query: string, products: getProduct[]) => {
  const normalized = query.toLowerCase();
  const underMatch = normalized.match(/(?:under|below|less than|max(?:imum)?|up to)\s*\$?([\d,]+)/);
  const overMatch = normalized.match(/(?:over|above|more than|min(?:imum)?|at least)\s*\$?([\d,]+)/);
  const priceLimit = underMatch ? Number(underMatch[1].replaceAll(",", "")) : null;
  const minimumPrice = overMatch ? Number(overMatch[1].replaceAll(",", "")) : null;
  const asksForDeals = /deal|discount|sale|offer|cheap|budget|best price/.test(normalized);
  const asksForBest = /best|top|popular|recommend|selling|worth/.test(normalized);
  const queryWords = normalized.split(/\s+/).filter((word) => word.length > 2);

  let matches = products.filter((product) => {
    const searchable = `${product.name} ${product.category} ${product.brand} ${product.shortDescription}`.toLowerCase();
    const categoryMatch = queryWords.some((word) => product.category.toLowerCase().includes(word));
    const nameMatch = queryWords.some((word) => searchable.includes(word));
    const price = priceOf(product);
    return (!priceLimit || price <= priceLimit) && (!minimumPrice || price >= minimumPrice) && (nameMatch || categoryMatch || asksForDeals || asksForBest || Boolean(priceLimit) || Boolean(minimumPrice));
  });

  if (asksForDeals) matches = matches.filter((product) => discountOf(product) > 0);
  if (asksForBest || asksForDeals) {
    matches = matches.sort((first, second) => (discountOf(second) - discountOf(first)) || (priceOf(first) - priceOf(second)));
  }

  return matches.slice(0, 8);
};

export default function ShoporaAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<getProduct[]>([]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hi! 👋 I'm Shopora Assistant. How can I help you today?",
    },
  ]);

  useEffect(() => {
    const openAssistant = () => setIsOpen(true);
    window.addEventListener("open-shopora-assistant", openAssistant);
    return () => window.removeEventListener("open-shopora-assistant", openAssistant);
  }, []);

  useEffect(() => {
    if (!isOpen || products.length > 0) return;
    void getProducts().then(setProducts).catch(() => undefined);
  }, [isOpen, products.length]);

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
      const catalogMatches = findCatalogMatches(message, products);
      const isCatalogQuestion = /product|category|under|below|over|above|price|deal|discount|sale|best|recommend|popular|selling|cheap|budget/.test(message.toLowerCase());

      if (catalogMatches.length > 0) {
        const priceText = /under|below|less than|up to/.test(message.toLowerCase())
          ? "under your requested price"
          : /over|above|more than|at least/.test(message.toLowerCase())
            ? "above your requested price"
            : "from the catalog";
        setMessages((prev) => [...prev, {
          id: Date.now() + 1,
          role: "assistant",
          text: `I found ${catalogMatches.length} product${catalogMatches.length === 1 ? "" : "s"} ${priceText}. Here are the best matches:`,
          products: catalogMatches,
        }]);
        return;
      }

      if (isCatalogQuestion && products.length > 0) {
        setMessages((prev) => [...prev, {
          id: Date.now() + 1,
          role: "assistant",
          text: "I could not find a matching product in the current catalog. Try a product name, category, or a price such as `under $50`.",
        }]);
        return;
      }

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
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#0F766E] text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#0B625B]"
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
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition hover:bg-white/10"
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

                    {message.products && message.products.length > 0 && (
                      <div className="mt-3 grid gap-2 border-t border-[#E5EEEE] pt-3">
                        {message.products.map((product) => (
                          <Link key={product.id} href={`/products/${product.id}`} onClick={() => setIsOpen(false)} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#E5EEEE] bg-[#FCFDFD] p-2 transition hover:border-[#0F766E]">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#E8F5F3] text-[#0F766E]"><Package size={18} /></div>
                            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#334155]">{product.name}</p><p className="truncate text-[11px] text-[#64748B]">{product.category || "Catalog item"}</p></div>
                            <div className="text-right"><p className="text-xs font-semibold text-[#0F766E]">${priceOf(product).toFixed(2)}</p>{discountOf(product) > 0 && <p className="text-[10px] text-[#65A30D]">-{discountOf(product)}%</p>}</div>
                          </Link>
                        ))}
                      </div>
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
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#0F766E] text-white transition hover:bg-[#0B625B] disabled:cursor-not-allowed disabled:opacity-50"
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