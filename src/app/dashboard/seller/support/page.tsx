"use client";

import { useState } from "react";
import { Bot, ChevronDown, Mail, MessageCircle, Send } from "lucide-react";
import { sendAIMessage, type AIChatMessage } from "@/lib/actions/aiChat";

type ChatMessage = { id: number; role: "user" | "assistant"; text: string };

const questions = [
  ["How do I add a product?", "Open Products, choose Add New Product, complete the listing details, and submit it for review."],
  ["How can I manage an order?", "Open Orders from the seller dashboard to review order details, update fulfillment status, and contact the customer when needed."],
  ["Where can I get account help?", "Email support@shopora.com with your seller account email and a short description of the issue. Never include your password or payment details."],
];

export default function SellerSupportPage() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "assistant", text: "Hi! I can help with products, orders, inventory, coupons, and seller account questions." },
  ]);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || sending) return;

    const history: AIChatMessage[] = messages.map((item) => ({ role: item.role, content: item.text }));
    setMessages((current) => [...current, { id: Date.now(), role: "user", text: message }]);
    setInput("");
    setSending(true);

    try {
      const response = await sendAIMessage(message, history);
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", text: response.message }]);
    } catch {
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", text: "I could not connect right now. Please email support@shopora.com for seller support." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-2xl bg-[#0F766E] px-5 py-7 text-white shadow-sm sm:px-8">
          <p className="font-['Poppins'] text-sm font-semibold uppercase tracking-[0.12em] text-[#BFE7E1]">Seller support</p>
          <h1 className="mt-1 font-['Poppins'] text-2xl font-semibold sm:text-3xl">Keep your shop moving</h1>
          <p className="mt-2 max-w-2xl font-['Poppins'] text-sm text-[#D9F2EE]">Get quick guidance for listings, orders, inventory, and your seller account.</p>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-xl border border-[#E8EEEE] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3"><MessageCircle className="text-[#0F766E]" size={21} /><div><h2 className="font-['Poppins'] text-lg font-semibold text-[#1E293B]">Common seller questions</h2><p className="font-['Poppins'] text-sm text-[#64748B]">Useful answers for daily shop tasks.</p></div></div>
            <div className="mt-5 divide-y divide-[#E8EEEE]">
              {questions.map(([question, answer]) => { const isOpen = openQuestion === question; return <div key={question}><button type="button" onClick={() => setOpenQuestion(isOpen ? null : question)} className="flex w-full items-center justify-between gap-4 py-4 text-left font-['Poppins'] text-sm font-medium text-[#334155]">{question}<ChevronDown size={17} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} /></button>{isOpen && <p className="pb-4 font-['Poppins'] text-sm leading-6 text-[#64748B]">{answer}</p>}</div>; })}
            </div>
            <a href="mailto:support@shopora.com" className="mt-5 flex items-center gap-3 rounded-lg border border-[#E8EEEE] p-4 hover:border-[#0F766E]"><Mail className="text-[#0F766E]" size={20} /><span><strong className="block font-['Poppins'] text-sm text-[#1E293B]">Email support</strong><span className="font-['Poppins'] text-xs text-[#64748B]">support@shopora.com</span></span></a>
          </section>

          <section className="flex min-h-[34rem] flex-col overflow-hidden rounded-xl border border-[#E8EEEE] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#E8EEEE] px-5 py-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F5F3] text-[#0F766E]"><Bot size={21} /></div><div><h2 className="font-['Poppins'] text-sm font-semibold text-[#1E293B]">Seller support assistant</h2><p className="font-['Poppins'] text-xs text-[#64748B]">Ask a Shopora question</p></div></div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#F8FAFA] p-4">{messages.map((message) => <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 font-['Poppins'] text-sm leading-6 ${message.role === "user" ? "rounded-br-sm bg-[#0F766E] text-white" : "rounded-bl-sm border border-[#E8EEEE] bg-white text-[#475569]"}`}>{message.text}</div></div>)}{sending && <p className="font-['Poppins'] text-xs text-[#64748B]">Assistant is typing...</p>}</div>
            <div className="border-t border-[#E8EEEE] p-4"><div className="flex items-end gap-2"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={2} placeholder="Ask about your shop..." className="min-h-11 flex-1 resize-none rounded-lg border border-[#E2E8F0] px-3 py-2.5 font-['Poppins'] text-sm text-[#334155] outline-none focus:border-[#0F766E]" /><button type="button" onClick={() => void sendMessage()} disabled={sending || !input.trim()} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0F766E] text-white disabled:opacity-50"><Send size={17} /></button></div></div>
          </section>
        </div>
      </div>
    </main>
  );
}