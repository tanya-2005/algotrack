import "../styles/login.css";
import { useState } from "react";
import { resetPassword, signIn, signUp } from "../services/auth";
import { disableDemoMode, enableDemoMode } from "../lib/demoMode";

export default function Login() {
  const [name, setName] = useState("");
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

    // Full navigation (not React Router's navigate) so MemoryProvider/App
    // remount fresh and correctly pick up the real session instead of
    // whatever stale demo/auth state was already in memory for this tab.
    disableDemoMode();
    window.location.href = "/dashboard";
  };

  const handleSignup = async () => {
    if (!name.trim()) {
      alert("Enter your name first.");
      return;
    }

    const { data, error } = await signUp(
      email,
      password,
      name.trim()
    );

    if (error) {
      alert(error.message);
      return;
    }

    disableDemoMode();

    // Email confirmation is off on this project, so signUp() already
    // returns an active session - take the user straight to their
    // dashboard instead of making them log in again immediately after.
    if (data.session) {
      window.location.href = "/dashboard";
      return;
    }

    alert("Account created! Check your email to confirm, then log in.");
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
          type="text"
          placeholder="Name"
          className="login-input"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

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
            window.location.href = "/dashboard";
          }}
        >
          🚀 Explore Demo
        </button>
      </div>
    </div>
  );
}