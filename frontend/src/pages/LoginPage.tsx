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
    <div style={{ maxWidth: 420, margin: "4rem auto", padding: "1rem" }}>
      <h2>Login</h2>
      <p>Use username admin for Admin role. Any non-empty password is accepted.</p>
      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: "100%" }}
      />
      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: "100%" }}
      />
      <button onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      <div style={{ marginTop: 8 }}>{message}</div>
    </div>
  );
}