import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Lock,
  Mail
} from "lucide-react";
import {
  signInWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../services/firebase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate("/");
    } catch (loginError) {
      if (
        loginError.code ===
        "auth/invalid-credential"
      ) {
        setError("Invalid email or password.");
      } else if (
        loginError.code ===
        "auth/too-many-requests"
      ) {
        setError(
          "Too many attempts. Please try again later."
        );
      } else {
        setError(
          "Unable to sign in. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-grid" />
        <div className="auth-orbit orbit-one" />
        <div className="auth-orbit orbit-two" />
      </div>

      <div className="auth-shell">
        <div className="auth-brand">
          <div className="auth-logo">
            E
          </div>

          <div>
            <strong>Qniverse</strong>
            <span>Universe of Questions</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-top">
            <div className="auth-icon">
              <Brain size={22} />
            </div>

            <span className="auth-label">
              EXAM INTELLIGENCE SYSTEM
            </span>
          </div>

          <h1>
            Welcome back.
          </h1>

          <p className="auth-description">
            Sign in to continue analyzing your
            previous-year papers.
          </p>

          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label>Email</label>

              <div className="auth-input">
                <Mail size={17} />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>

              <div className="auth-input">
                <Lock size={17} />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign In"}

              {!loading && (
                <ArrowRight size={17} />
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>
              Don't have an account?
            </span>

            <Link to="/signup">
              Create one
            </Link>
          </div>
        </div>

        <div className="auth-system-status">
          <span />
          SECURE AUTHENTICATION
        </div>
      </div>
    </div>
  );
}

export default Login;