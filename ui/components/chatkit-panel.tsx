"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type ChatKitPanelProps = {
  initialThreadId?: string | null;
  selectedAgentName?: string | null;
  onThreadChange?: (threadId: string | null) => void;
  onResponseEnd?: () => void;
  onRunnerUpdate?: () => void;
  onRunnerEventDelta?: (events: any[]) => void;
  onRunnerBindThread?: (threadId: string) => void;
  onChatKitError?: (message: string) => void;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export function ChatKitPanel({
  initialThreadId,
  selectedAgentName,
  onThreadChange,
  onResponseEnd,
  onRunnerUpdate,
  onRunnerEventDelta,
  onRunnerBindThread,
  onChatKitError,
}: ChatKitPanelProps) {
  const [threadId, setThreadId] = useState<string | null>(initialThreadId ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const previousSelectedAgentRef = useRef<string | null>(selectedAgentName ?? null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [dotCount, setDotCount] = useState(1);

  const loadingStatuses = useMemo(
    () => ["Thinking", "Debating options", "Checking details", "Deciding next step"],
    []
  );

  function formatAssistantMarkdown(text: string): string {
    return text
      .replace(/\s-\s\*\*/g, "\n- **")
      .replace(/\s(\d+\.)\s\*\*/g, "\n$1 **")
      .replace(/\.\s(\d+\.)\s/g, ".\n$1 ")
      .trim();
  }

  useEffect(() => {
    if (initialThreadId) {
      setThreadId(initialThreadId);
      onThreadChange?.(initialThreadId);
      onRunnerBindThread?.(initialThreadId);
    }
  }, [initialThreadId, onRunnerBindThread, onThreadChange]);

  useEffect(() => {
    const previousSelectedAgent = previousSelectedAgentRef.current;
    previousSelectedAgentRef.current = selectedAgentName ?? null;

    if (!selectedAgentName || selectedAgentName === previousSelectedAgent) return;

    let isCancelled = false;

    async function resetConversationForAgentSwitch() {
      setInput("");
      setMessages([]);
      setIsSending(false);

      const boot = await fetch("/chatkit/bootstrap");
      const bootJson = await boot.json();
      const newThreadId = bootJson?.thread_id ?? null;
      if (isCancelled || !newThreadId) return;

      setThreadId(newThreadId);
      onThreadChange?.(newThreadId);
      onRunnerBindThread?.(newThreadId);
    }

    void resetConversationForAgentSwitch();

    return () => {
      isCancelled = true;
    };
  }, [selectedAgentName, onRunnerBindThread, onThreadChange]);

  useEffect(() => {
    if (!isSending) {
      setStatusIndex(0);
      setDotCount(1);
      return;
    }

    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % loadingStatuses.length);
    }, 1400);

    const dotsTimer = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 350);

    return () => {
      clearInterval(statusTimer);
      clearInterval(dotsTimer);
    };
  }, [isSending, loadingStatuses.length]);

  const starterPrompts = useMemo(
    () => [
      "Can you move me to seat 14C?",
      "What's the status of flight FLT-123?",
      "My flight from Paris to New York was delayed and I missed my connection to Austin. Also, my checked bag is missing and I need to spend the night in New York. Can you help me?",
    ],
    []
  );

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || isSending) return;
    setIsSending(true);
    setMessages((m) => [...m, { role: "user", text: content }]);
    setInput("");

    try {
      let activeThreadId = threadId;
      if (!activeThreadId) {
        const boot = await fetch("/chatkit/bootstrap");
        const bootJson = await boot.json();
        activeThreadId = bootJson?.thread_id ?? null;
        if (activeThreadId) {
          setThreadId(activeThreadId);
          onThreadChange?.(activeThreadId);
          onRunnerBindThread?.(activeThreadId);
        }
      }

      const res = await fetch(`/chatkit?thread_id=${encodeURIComponent(activeThreadId ?? "")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferred_agent: selectedAgentName,
          input: [
            {
              role: "user",
              content: [{ type: "input_text", text: content }],
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat request failed: ${res.status}`);
      }

      const data = await res.json();
      const assistantText =
        data?.output?.[0]?.content?.[0]?.text ??
        data?.output_text ??
        "Done.";

      setMessages((m) => [...m, { role: "assistant", text: String(assistantText) }]);
      onRunnerUpdate?.();
      onRunnerEventDelta?.([]);
      onResponseEnd?.();
    } catch (err: any) {
      const msg = err?.message ?? "Unknown send error";
      onChatKitError?.(msg);
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Sorry, I hit an error sending your message." },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex h-14 items-center border-b border-slate-200 bg-white px-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Customer View</h2>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-5">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Customer Support Desk
                </p>
                <h3 className="max-w-2xl text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                  Plan changes, delays, and baggage support in one chat.
                </h3>
                <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
                  Ask naturally and I’ll route your request to the right specialist agent.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {starterPrompts.map((p, index) => (
                  <button
                    key={p}
                    className="group rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white disabled:opacity-60"
                    onClick={() => sendMessage(p)}
                    disabled={isSending}
                  >
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Prompt 0{index + 1}
                    </p>
                    <p className="text-sm font-medium leading-snug text-slate-800 group-hover:text-slate-900">
                      {p}
                    </p>
                  </button>
                ))}
              </div>

              <p className="text-xs text-slate-500">
                Tip: you can switch the active agent in Agent View before sending.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={
                  m.role === "user"
                    ? "inline-block max-w-[80%] rounded-2xl bg-slate-900 px-4 py-2.5 text-white"
                    : "inline-block max-w-[80%] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-zinc-900"
                }
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-slate-900 prose-headings:text-slate-900">
                    <ReactMarkdown>{formatAssistantMarkdown(m.text)}</ReactMarkdown>
                  </div>
                ) : (
                  m.text
                )}
              </div>
            </div>
          ))
        )}
        {isSending && (
          <div className="text-left">
            <div className="inline-flex max-w-[80%] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-slate-500" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300 [animation-delay:240ms]" />
              </div>
              <span className="text-sm font-medium">
                {loadingStatuses[statusIndex]}
                {".".repeat(dotCount)}
              </span>
            </div>
          </div>
        )}
      </div>

      <form
        className="border-t border-slate-200 bg-white p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage(input);
        }}
      >
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
            className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:bg-white focus:outline-none"
            disabled={isSending}
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isSending || !input.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
