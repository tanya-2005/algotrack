import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, UserRound } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";
import {
  getForgottenConcepts,
  getRecommendedRevision,
  getWeakestPattern,
} from "../../lib/memoryEngine";

type Message = {
  id: number;
  role: "user" | "coach";
  text: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "coach",
    text: "Hey Tanya 👋 I'm your DSA Coach. I have access to your questions, reflections, patterns, quiz history, and mistakes. Ask me what to revise, where you're weak, or to quiz you on any pattern.",
  },
];

type Props = {
  suggestedPrompt: string;
};

function buildCoachResponse(prompt: string, data: ReturnType<typeof useMemory>["data"]) {
  const lower = prompt.toLowerCase();
  const recommended = getRecommendedRevision(data);
  const weakest = getWeakestPattern(data);
  const forgotten = getForgottenConcepts(data);

  if (lower.includes("revise today") || lower.includes("revision plan")) {
    return `Based on your queue and retention scores, start with **${recommended.pattern}** (${recommended.duration}). You have ${data.revisionQueue.filter((i) => !i.completed).length} items due. Priority: ${forgotten.slice(0, 3).join(", ") || "maintain strong patterns"}.`;
  }
  if (lower.includes("weakest") || lower.includes("weak")) {
    return `Your weakest pattern right now is **${weakest}**. Focus on questions with confidence ≤ 3 and mistakes around ${forgotten[0] ?? "core concepts"}.`;
  }
  if (lower.includes("quiz")) {
    return `I'll generate a quiz from your mistakes. Try: window shrinking (${data.questions.filter((q) => q.pattern === "Sliding Window").length} SW questions), BFS visited state, and DP state definition. Head to **Revision → AI Quiz Arena** for the full session.`;
  }
  if (lower.includes("sliding window")) {
    const sw = data.questions.filter((q) => q.pattern === "Sliding Window");
    return `Sliding Window — from your log: ${sw.map((q) => q.name).join(", ")}. Key trigger you wrote: "${sw[0]?.trigger ?? "expand/shrink window"}". Review shrinking conditions before your next session.`;
  }
  if (lower.includes("reflection")) {
    const latest = data.questions.find((q) => q.reflection);
    return `Latest reflection (${latest?.name}): "${latest?.reflection}". You often forget: ${latest?.mistakes.join("; ") ?? "—"}. Revisit this in Memory Flashback on the Revision page.`;
  }
  if (lower.includes("interview")) {
    return `Interview set from your weak areas: 1) Implement Trie with your noted isEnd bug. 2) Course Schedule topo sort cycle detection. 3) Minimum Window Substring shrink logic. 4) Multi-source BFS (Rotting Oranges). 5) House Robber state transition.`;
  }
  return `I analyzed your memory graph. Memory score: ${data.questions.length ? Math.round(data.questions.reduce((s, q) => s + q.confidence, 0) / data.questions.length / 5 * 100) : 0}%. Weakest: ${weakest}. Recommended today: ${recommended.pattern}. Ask me to quiz you or explain any pattern.`;
}

export default function ChatWorkspace({ suggestedPrompt }: Props) {
  const { data } = useMemory();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const nextId = useRef(2);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (suggestedPrompt) {
      setDraft(suggestedPrompt);
    }
  }, [suggestedPrompt]);

  const sendMessage = () => {
    if (!draft.trim() || isTyping) return;
    const userText = draft;
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: "user", text: userText },
    ]);
    setDraft("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "coach",
          text: buildCoachResponse(userText, data),
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="chat-page">
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-row ${
              message.role === "user" ? "user-row" : "coach-row"
            }`}
          >
            <div className="message-avatar">
              {message.role === "user" ? (
                <UserRound size={18} />
              ) : (
                <Bot size={18} />
              )}
            </div>
            <div className="message-bubble">{message.text}</div>
          </div>
        ))}

        {isTyping && (
          <div className="message-row coach-row">
            <div className="message-avatar">
              <Bot size={18} />
            </div>
            <div className="message-bubble">Analyzing your memory...</div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="chat-input-wrapper">
        <div className="suggestions">
          <button
            type="button"
            onClick={() =>
              setDraft("What should I revise today?")
            }
          >
            Revision Plan
          </button>
          <button
            type="button"
            onClick={() =>
              setDraft("Which pattern am I weakest at?")
            }
          >
            Weak Areas
          </button>
          <button
            type="button"
            onClick={() => setDraft("Quiz me on Sliding Window")}
          >
            Quiz Me
          </button>
          <button
            type="button"
            onClick={() => setDraft("Explain Pattern Sliding Window")}
          >
            Explain Pattern
          </button>
        </div>

        <div className="chat-input">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask anything about DSA..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button type="button" onClick={sendMessage} disabled={!draft.trim()}>
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
