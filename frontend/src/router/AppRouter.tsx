import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Questions from "../pages/Questions";
import Patterns from "../pages/Patterns";
import Revision from "../pages/Revision";
import AIChat from "../pages/AIChat";
import PDetails from "../pages/PDetails";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/patterns" element={<Patterns />} />
        <Route path="/revision-center" element={<Revision />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/pdetails" element={<PDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;