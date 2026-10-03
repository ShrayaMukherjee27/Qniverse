
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Lock,
  Mail,
  User
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import universe from "../assets/universe.jpg";
import { auth } from "../services/firebase";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(credential.user, {
        displayName: name.trim()
      });

      navigate("/dashboard");
    } catch (signupError) {
      if (signupError.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (signupError.code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else if (signupError.code === "auth/weak-password") {
        setError("Please choose a stronger password.");
      } else {
        setError("Unable to create your account.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div
        className="auth-background"
        style={{
          backgroundImage: `url(${universe})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />

      <div className="auth-shell">
        <div className="auth-brand">
          <div className="auth-logo">Q</div>
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
            <span className="auth-label">CREATE YOUR WORKSPACE</span>
          </div>

          <h1>Start analyzing.</h1>

          <p className="auth-description">
            Create your Qniverse account and turn your PYQs into exam intelligence.
          </p>

          <form onSubmit={handleSignup}>
            <div className="auth-field">
              <label>Name</label>
              <div className="auth-input">
                <User size={17} />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Email</label>
              <div className="auth-input">
                <Mail size={17} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Confirm Password</label>
              <div className="auth-input">
                <Lock size={17} />
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login">Sign in</Link>
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

export default Signup;