import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthService from "../../services/AuthService";
import "./ResetPassword.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); setError(""); setSuccess("");
    if (!token) return setError("Invalid or expired password reset link.");
    if (password.length < 8) return setError("Password must be at least 8 characters long");
    if (password !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try { const response = await AuthService.resetPassword({ token, password, confirmPassword }); setSuccess(response.data.message || "Password reset successfully."); setPassword(""); setConfirmPassword(""); }
    catch (reason) { setError(reason.response?.data?.message || "Invalid or expired password reset link."); }
    finally { setLoading(false); }
  };

  return <main className="reset-password-page"><section className="reset-password-panel"><h1>Reset Password</h1><form onSubmit={submit} noValidate>
    <label htmlFor="new-password">New Password</label><input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} autoComplete="new-password" />
    <label htmlFor="confirm-password">Confirm Password</label><input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={loading} autoComplete="new-password" />
    {error && <div className="reset-error">{error}</div>}{success && <div className="reset-success">{success}</div>}
    {success ? <button type="button" className="btn btn-primary" onClick={() => navigate("/login", { replace: true })}>Go to Login</button> : <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>}
  </form><Link to="/login">Back to Login</Link></section></main>;
}
