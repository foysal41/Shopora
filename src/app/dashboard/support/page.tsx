"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  ChevronDown,
  Clock3,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { sendAIMessage, type AIChatMessage } from "@/lib/actions/aiChat";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const quickAnswers = [
  {
    question: "Where is my order?",
    answer: "You can follow your order from My Orders in your dashboard. Open the order to see its latest status and tracking details.",
  },
  {
    question: "How do returns work?",
    answer: "Check the seller's return policy on the product or order details page. Contact support with your order number if you need help starting a return.",
  },
  {
    question: "How can I update my account?",
    answer: "Use Account Settings in the dashboard to update your profile and security information.",
  },
  {
    question: "What payment methods are supported?",
    answer: "Your saved payment methods are managed from Payment Methods in the customer dashboard. Checkout will show the methods available for your order.",
  },
];

export default function CustomerSupportPage() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hi! I am Shopora Assistant. Ask me about orders, returns, payments, or your account.",
    },
  ]);

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || sending) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: message },
    ]);
    setInput("");
    setSending(true);

    try {
      const history: AIChatMessage[] = messages.map((item) => ({
        role: item.role,
        content: item.text,
      }));
      const response = await sendAIMessage(message, history);
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", text: response.message },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "I could not connect right now. Please email support@shopora.com and include your order number.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-2xl bg-[#0F766E] px-5 py-7 text-white shadow-sm sm:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <MessageCircle size={25} />
            </div>
            <div>
              <p className="font-['Poppins'] text-sm font-semibold uppercase tracking-[0.12em] text-[#BFE7E1]">Customer care</p>
              <h1 className="mt-1 font-['Poppins'] text-2xl font-semibold sm:text-3xl">How can we help?</h1>
              <p className="mt-2 max-w-2xl font-['Poppins'] text-sm text-[#D9F2EE]">Find a quick answer or chat with Shopora Assistant about your order and account.</p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
          <div className="space-y-6">
            <section className="rounded-xl border border-[#E8EEEE] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-['Poppins'] text-lg font-semibold text-[#1E293B]">Quick answers</h2>
                  <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">Common questions from Shopora customers.</p>
                </div>
                <Link href="/faqs" className="flex items-center gap-1 font-['Poppins'] text-sm font-semibold text-[#0F766E]">All FAQs <ArrowUpRight size={15} /></Link>
              </div>

              <div className="mt-5 divide-y divide-[#E8EEEE]">
                {quickAnswers.map((item) => {
                  const isOpen = openQuestion === item.question;

                  return (
                    <div key={item.question}>
                      <button type="button" onClick={() => setOpenQuestion(isOpen ? null : item.question)} className="flex cursor-pointer w-full items-center justify-between gap-4 py-4 text-left font-['Poppins'] text-sm font-medium text-[#334155]">
                        {item.question}
                        <ChevronDown size={17} className={`shrink-0 text-[#64748B] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && <p className="pb-4 pr-6 font-['Poppins'] text-sm leading-6 text-[#64748B]">{item.answer}</p>}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <Link href="mailto:support@shopora.com" className="rounded-xl border border-[#E8EEEE] bg-white p-5 shadow-sm transition hover:border-[#0F766E]">
                <Mail className="text-[#0F766E]" size={21} />
                <h2 className="mt-3 font-['Poppins'] text-sm font-semibold text-[#1E293B]">Email support</h2>
                <p className="mt-1 font-['Poppins'] text-xs text-[#64748B]">support@shopora.com</p>
              </Link>
              <Link href="/contact" className="rounded-xl border border-[#E8EEEE] bg-white p-5 shadow-sm transition hover:border-[#0F766E]">
                <MessageCircle className="text-[#0F766E]" size={21} />
                <h2 className="mt-3 font-['Poppins'] text-sm font-semibold text-[#1E293B]">Contact team</h2>
                <p className="mt-1 font-['Poppins'] text-xs text-[#64748B]">Send us a detailed request</p>
              </Link>
            </section>
          </div>

          <section className="flex min-h-140 flex-col overflow-hidden rounded-xl border border-[#E8EEEE] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#E8EEEE] px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F5F3] text-[#0F766E]"><Bot size={21} /></div>
              <div>
                <h2 className="font-['Poppins'] text-sm font-semibold text-[#1E293B]">Shopora Assistant</h2>
                <div className="mt-0.5 flex items-center gap-1.5 font-['Poppins'] text-xs text-[#64748B]"><span className="h-2 w-2 rounded-full bg-[#22C55E]" />Ready to help</div>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#F8FAFA] p-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 font-['Poppins'] text-sm leading-6 ${message.role === "user" ? "rounded-br-sm bg-[#0F766E] text-white" : "rounded-bl-sm border border-[#E8EEEE] bg-white text-[#475569]"}`}>
                    {message.text}
                  </div>
                </div>
              ))}
              {sending && <p className="font-['Poppins'] text-xs text-[#64748B]">Assistant is typing...</p>}
            </div>

            <div className="border-t border-[#E8EEEE] p-4">
              <div className="flex items-end gap-2">
                <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={2} placeholder="Ask a question..." className="min-h-11 flex-1 resize-none rounded-lg border border-[#E2E8F0] px-3 py-2.5 font-['Poppins'] text-sm text-[#334155] outline-none focus:border-[#0F766E]" />
                <button type="button" onClick={() => void sendMessage()} disabled={sending || !input.trim()} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0F766E] text-white transition hover:bg-[#0B625B] disabled:cursor-not-allowed disabled:opacity-50"><Send size={17} /></button>
              </div>
              <p className="mt-2 font-['Poppins'] text-[11px] text-[#94A3B8]">Press Enter to send. Use Shift + Enter for a new line.</p>
            </div>
          </section>
        </div>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-[#E8EEEE] bg-white p-4"><Truck className="text-[#0F766E]" size={20} /><span className="font-['Poppins'] text-xs text-[#475569]">Order and delivery help</span></div>
          <div className="flex items-center gap-3 rounded-xl border border-[#E8EEEE] bg-white p-4"><ShieldCheck className="text-[#0F766E]" size={20} /><span className="font-['Poppins'] text-xs text-[#475569]">Secure payment support</span></div>
          <div className="flex items-center gap-3 rounded-xl border border-[#E8EEEE] bg-white p-4"><Clock3 className="text-[#0F766E]" size={20} /><span className="font-['Poppins'] text-xs text-[#475569]">Support: Sun-Thu, 9AM-6PM</span></div>
        </section>
      </div>
    </main>
  );
}