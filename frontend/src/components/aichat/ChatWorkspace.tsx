import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, UserRound } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";
import { isDemoMode } from "../../lib/demoMode";
import {
  getForgottenConcepts,
  getMemoryScore,
  getRecommendedRevision,
  getStrongestPattern,
  getWeakestPattern,
} from "../../lib/memoryEngine";
import { sendCoachMessage } from "../../services/aiService";

type Message = {
  id: number;
  role: "user" | "coach";
  text: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "coach",
    text: "Hey 👋 I'm your DSA Coach. I have access to your questions, reflections, patterns, quiz history, and mistakes. Ask me what to revise, where you're weak, or to quiz you on any pattern.",
  },
];

type Props = {
  suggestedPrompt: string;
};

function buildCoachContext(data: ReturnType<typeof useMemory>["data"]) {
  return {
    memoryScore: getMemoryScore(data),
    weakestPattern: getWeakestPattern(data),
    strongestPattern: getStrongestPattern(data),
    forgottenConcepts: getForgottenConcepts(data),
    recommended: getRecommendedRevision(data),
    totalQuestions: data.questions.length,
    patterns: data.patterns.map((p) => ({ name: p.name, status: p.status })),
    recentQuestions: data.questions.slice(0, 15).map((q) => ({
      name: q.name,
      pattern: q.pattern,
      difficulty: q.difficulty,
      confidence: q.confidence,
      reflection: q.reflection,
      mistakes: q.mistakes,
      trigger: q.trigger,
    })),
  };
}

// Used both as Demo Mode's coach (which never calls Supabase, so it never
// even attempts the real AI) and as a fallback if the real AI call fails
// for a logged-in user (e.g. an OpenRouter free-tier rate limit) - either
// way it stays grounded in the current data instead of showing an error.
function buildFallbackResponse(
  prompt: string,
  data: ReturnType<typeof useMemory>["data"],
  demoMode: boolean
) {
  const lower = prompt.toLowerCase();
  const recommended = getRecommendedRevision(data);
  const weakest = getWeakestPattern(data);
  const forgotten = getForgottenConcepts(data);

  if (lower.includes("revise today") || lower.includes("revision plan")) {
    return `Based on your queue and retention scores, start with ${recommended.pattern} (${recommended.duration}). You have ${data.revisionQueue.filter((i) => !i.completed).length} items due. Priority: ${forgotten.slice(0, 3).join(", ") || "maintain strong patterns"}.`;
  }
  if (lower.includes("weakest") || lower.includes("weak")) {
    return `Your weakest pattern right now is ${weakest}. Focus on questions with confidence <= 3 and mistakes around ${forgotten[0] ?? "core concepts"}.`;
  }
  if (lower.includes("quiz")) {
    return `Head to Revision → AI Quiz Arena for a full quiz session generated from your real mistakes and weak patterns.`;
  }
  const latest = data.questions.find((q) => q.reflection);
  if (lower.includes("reflection") && latest) {
    return `Latest reflection (${latest.name}): "${latest.reflection}". You often forget: ${latest.mistakes.join("; ") || "—"}.`;
  }
  const closing = demoMode
    ? "(This is Demo Mode - sign in to unlock the full AI coach grounded in your own questions.)"
    : "(The AI coach is momentarily busy — this is a quick offline summary of your real data.)";
  return `Memory score: ${getMemoryScore(data)}%. Weakest: ${weakest}. Recommended today: ${recommended.pattern}. ${closing}`;
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

  const sendMessage = async () => {
    if (!draft.trim() || isTyping) return;
    const userText = draft;
    const history = messages.map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: "user", text: userText },
    ]);
    setDraft("");
    setIsTyping(true);

    const demoMode = isDemoMode();
    let replyText: string;

    if (demoMode) {
      // Demo Mode never calls Supabase (including Edge Functions).
      replyText = buildFallbackResponse(userText, data, true);
    } else {
      try {
        replyText = await sendCoachMessage(
          userText,
          history,
          buildCoachContext(data)
        );
      } catch (err) {
        console.error("AI Coach request failed, using offline fallback:", err);
        replyText = buildFallbackResponse(userText, data, false);
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        id: nextId.current++,
        role: "coach",
        text: replyText,
      },
    ]);
    setIsTyping(false);
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
