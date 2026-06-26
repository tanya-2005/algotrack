import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";

type HeroProps = {
  onLogQuestion: () => void;
};

function Hero({ onLogQuestion }: HeroProps) {
  const navigate = useNavigate();

  return (
    <div className="hero-card">
      <div className="hero-left">
        <h1 className="hero-title">
          Welcome back, <span>Tanya</span>
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
