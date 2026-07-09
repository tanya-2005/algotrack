import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { isDemoMode } from "../../lib/demoMode";
import { getDisplayName } from "../../lib/userDisplay";

type HeroProps = {
  onLogQuestion: () => void;
};

function Hero({ onLogQuestion }: HeroProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const demoMode = isDemoMode();

  useEffect(() => {
    if (demoMode) return;

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setName(getDisplayName(session));
    });

    return () => {
      mounted = false;
    };
  }, [demoMode]);

  return (
    <div className="hero-card">
      <div className="hero-left">
        <h1 className="hero-title">
          Welcome back{name ? <>, <span>{name}</span></> : demoMode ? <>, <span>Explorer</span></> : ""}
        </h1>


      </div>

      <div className="hero-actions">
        <button
          className="primary-btn"
          onClick={() => navigate("/revision")}
        >
          Start Revision
        </button>

        <button
          className="secondary-btn"
          onClick={onLogQuestion}
        >
          Log Question
        </button>
      </div>
    </div>
  );
}

export default Hero;
