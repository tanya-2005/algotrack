import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { resetPassword, signIn, signUp } from "../services/auth";
import { enableDemoMode } from "../lib/demoMode";

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

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter your email above first, then click Forgot Password.");
      return;
    }

    const { error } = await resetPassword(email);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password reset email sent. Check your inbox.");
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
          type="button"
          className="forgot-password-link"
          onClick={handleForgotPassword}
        >
          Forgot Password?
        </button>

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
          onClick={() => {
            enableDemoMode();
            navigate("/dashboard");
          }}
        >
          🚀 Explore Demo
        </button>
      </div>
    </div>
  );
}