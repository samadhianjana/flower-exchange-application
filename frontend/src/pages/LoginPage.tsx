import React, { useContext, useState } from "react";
import { AuthContext } from "../auth/authContext";

export function LoginPage() {
  const auth = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await auth.login(username, password);
      setMessage(response.ok ? "Login successful" : response.message ?? "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="mx-auto mt-16 max-w-md panel">
        <div className="panel-header">
          <h2 className="text-xl">Login</h2>
          <p className="page-subtitle mt-1">Use username admin for Admin role. Any non-empty password is accepted.</p>
        </div>
        <div className="panel-body space-y-3">
          <div className="field">
            <label className="field-label" htmlFor="username">Username</label>
            <input
              id="username"
              className="input-field"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input-field"
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn-primary w-full justify-center" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
          <div className="helper-text">{message}</div>
        </div>
      </div>
    </div>
  );
}