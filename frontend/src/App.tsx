import { Routes, Route, useLocation } from "react-router-dom";

import Sidebar from "./layouts/Sidebar";
import QuickRecall from "./components/common/QuickRecall";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Questions from "./pages/Questions";
import Patterns from "./pages/Patterns";
import Revision from "./pages/Revision";
import AIChat from "./pages/AIChat";
import PDetails from "./pages/PDetails";

function App() {
  const location = useLocation();

  if (location.pathname === "/") {
    return <Login />;
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/patterns" element={<Patterns />} />
          <Route path="/revision" element={<Revision />} />
          <Route path="/aichat" element={<AIChat />} />
          <Route path="/pdetails" element={<PDetails />} />
        </Routes>
      </main>

      <QuickRecall />
    </div>
  );
}

export default App;