import { useState } from "react";
import CoachHeader from "../components/aichat/CoachHeader";
import QuickActions from "../components/aichat/QuickActions";
//import MemoryStatus from "../components/aichat/MemoryStatus";
import ChatWorkspace from "../components/aichat/ChatWorkspace";
import "../styles/aichat.css";

export default function AIChat() {
  const [suggestedPrompt, setSuggestedPrompt] = useState("");

  return (
    <div className="coach-page">
      <CoachHeader />
      
      <QuickActions onAction={setSuggestedPrompt} />
      <ChatWorkspace suggestedPrompt={suggestedPrompt} />
    </div>
  );
}
