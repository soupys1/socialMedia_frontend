import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://socialmedia-backend-k1nf.onrender.com";

export default function Signup() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", firstName: "", lastName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Signup failed"); return; }
      navigate("/login");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "firstName",  label: "First name",  type: "text",     placeholder: "Alex",               half: true },
    { name: "lastName",   label: "Last name",   type: "text",     placeholder: "Chen",               half: true },
    { name: "username",   label: "Username",    type: "text",     placeholder: "alexchen",           half: false },
    { name: "email",      label: "Email",       type: "email",    placeholder: "alex@example.com",   half: false },
    { name: "password",   label: "Password",    type: "password", placeholder: "Min. 6 characters",  half: false },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--canvas-soft)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div className="card" style={{ width: "100%", maxWidth: 420 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/login" style={{ fontSize: 13, color: "var(--ink-subtle)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </Link>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Create account</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px", margin: 0 }}>Join JoinAHack</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* First + Last name on same row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            {fields.filter(f => f.half).map(f => (
              <div key={f.name} style={{ marginBottom: 14 }}>
                <label className="label" htmlFor={f.name}>{f.label}</label>
                <input id={f.name} name={f.name} type={f.type} className="input" value={formData[f.name]} onChange={handleChange} placeholder={f.placeholder} required />
              </div>
            ))}
          </div>
          {fields.filter(f => !f.half).map(f => (
            <div key={f.name} style={{ marginBottom: 14 }}>
              <label className="label" htmlFor={f.name}>{f.label}</label>
              <input id={f.name} name={f.name} type={f.type} className="input" value={formData[f.name]} onChange={handleChange} placeholder={f.placeholder} required autoComplete={f.name === "password" ? "new-password" : undefined} />
            </div>
          ))}

          <button type="submit" className="btn btn-primary btn-md btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-subtle)", marginTop: 20, marginBottom: 0 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
