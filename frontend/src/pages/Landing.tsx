import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="landing">
      <div className="hero">
        <h1>DSA Memory OS</h1>

        <p>
          Stop forgetting coding patterns. Track questions, store mistakes,
          build confidence, and revise intelligently.
        </p>

        <div className="buttons">
          <Link to="/dashboard" className="primary-btn">
            Enter Dashboard
          </Link>

          <button className="secondary-btn">
            Connect LeetCode
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;