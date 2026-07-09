import "../styles/login.css";
import { useState } from "react";
import { BrainCircuit, Lock, Mail, User, Sparkles } from "lucide-react";
import { resetPassword, signIn, signUp } from "../services/auth";
import { disableDemoMode, enableDemoMode } from "../lib/demoMode";

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (submitting) return;

    if (!email.trim() || !password) {
      alert("Enter your email and password first.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signIn(email, password);

      if (error) {
        alert(error.message);
        return;
      }

      // Full navigation (not React Router's navigate) so MemoryProvider/App
      // remount fresh and correctly pick up the real session instead of
      // whatever stale demo/auth state was already in memory for this tab.
      disableDemoMode();
      window.location.href = "/dashboard";
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async () => {
    if (submitting) return;

    if (!name.trim()) {
      alert("Enter your name first.");
      return;
    }

    if (!email.trim() || !password) {
      alert("Enter your email and password first.");
      return;
    }

    setSubmitting(true);
    try {
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (submitting) return;

    if (!email) {
      alert("Enter your email above first, then click Forgot Password.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await resetPassword(email);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Password reset email sent. Check your inbox.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-mark">
            <BrainCircuit size={26} />
          </span>
        </div>

        <h1 className="login-title">
          AlgoTrack
        </h1>

        <p className="login-subtitle">
          Track. Reflect. Remember.
        </p>

        <div className="login-field">
          <User size={17} className="login-field-icon" />
          <input
            type="text"
            placeholder="Name"
            className="login-input"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        </div>

        <div className="login-field">
          <Mail size={17} className="login-field-icon" />
          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <div className="login-field">
          <Lock size={17} className="login-field-icon" />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </div>

        <button
          type="button"
          className="forgot-password-link"
          onClick={handleForgotPassword}
          disabled={submitting}
        >
          Forgot Password?
        </button>

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={submitting}
        >
          {submitting ? "Please wait..." : "Login"}
        </button>

        <button
          className="signup-btn"
          onClick={handleSignup}
          disabled={submitting}
        >
          {submitting ? "Please wait..." : "Create Account"}
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          className="demo-btn"
          onClick={() => {
            enableDemoMode();
            window.location.href = "/dashboard";
          }}
          disabled={submitting}
        >
          <Sparkles size={16} /> Explore Demo
        </button>
      </div>
    </div>
  );
}