import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signIn, signUp } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await signIn(
      email,
      password
    );

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/dashboard");
  };

  const handleSignup = async () => {
    const { error } = await signUp(
      email,
      password
    );

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account Created!");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">
          DSA Memory OS
        </h1>

        <p className="login-subtitle">
          Track. Reflect. Remember.
        </p>

        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          className="login-btn"
          onClick={handleLogin}
        >
          Login
        </button>

        <button
          className="signup-btn"
          onClick={handleSignup}
        >
          Create Account
        </button>

        <div className="divider"></div>

        <button
          className="demo-btn"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          🚀 Explore Demo
        </button>
      </div>
    </div>
  );
}