import { useState } from "react";
import { Link } from "react-router-dom";
import AuthService from "../../services/AuthService";

const genericMessage = "If an account exists for this email, a password reset link has been sent.";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); setError(""); setMessage("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return setError("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return setError("Enter a valid email address");
    setLoading(true);
    try { await AuthService.forgotPassword({ email: normalizedEmail }); setMessage(genericMessage); setEmail(""); }
    catch (reason) { setError(reason.response?.data?.message || "Unable to send reset email. Please try again later."); }
    finally { setLoading(false); }
  };

  return <main className="container py-5" style={{ maxWidth: "520px" }}>
    <h1>Forgot Password</h1><p>Enter your email and we'll send you a password reset link.</p>
    <form onSubmit={submit} noValidate><label className="form-label" htmlFor="reset-email">Email</label><input id="reset-email" className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading} autoComplete="email" />
      {error && <div className="text-danger mt-2">{error}</div>}{message && <div className="text-success mt-2">{message}</div>}
      <button className="btn btn-primary mt-3" type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</button>
    </form><p className="mt-3"><Link to="/login">Back to Login</Link></p>
  </main>;
}
