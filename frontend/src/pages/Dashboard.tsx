import { useState } from "react";

import Hero from "../components/dashboard/Hero";
import AIMemoryCoach from "../components/dashboard/AIMemoryCoach";
import StatsCard from "../components/dashboard/StatsCard";
import PatternMastery from "../components/dashboard/PatternMastery";
import Recommendations from "../components/dashboard/Recommendations";
import Heatmap from "../components/dashboard/Heatmap";
import MemoryScoreTrend from "../components/dashboard/MemoryScoreTrend";
import MemoryPrediction from "../components/dashboard/MemoryPrediction";
import LearnerProfile from "../components/dashboard/LearnerProfile";
import RecentActivity from "../components/dashboard/RecentActivity";
import ReflectionPanel from "../components/questions/ReflectionPanel";
import "../styles/Questions.css";

import { supabase } from "../lib/supabase";

const testSupabase = async () => {
  const { data, error } = await supabase.auth.getSession();

  console.log("DATA:", data);
  console.log("ERROR:", error);
};

<button onClick={testSupabase}>
  Test Supabase
</button>

const emptyQuestion = {
  name: "",
  difficulty: "",
  pattern: "",
  confidence: 3,
  reflection: "",
  mistakes: "",
  trigger: "",
  timeTaken: "",
  isNew: true,
};

function Dashboard() {
  const [showLogModal, setShowLogModal] = useState(false);

  return (
    <>
      <Hero onLogQuestion={() => setShowLogModal(true)} />

      <AIMemoryCoach />

      <StatsCard />

      <div className="dashboard-middle">
        <PatternMastery />
        <Recommendations />
      </div>

      <Heatmap />

      <MemoryScoreTrend />

      <div className="insights-grid">
        <MemoryPrediction />
        <LearnerProfile />
      </div>

      <RecentActivity />

      {showLogModal && (
        <ReflectionPanel
          question={emptyQuestion}
          onClose={() => setShowLogModal(false)}
        />
      )}
    </>
  );
}

export default Dashboard;
