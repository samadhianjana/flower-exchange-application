import React, { useState } from "react";
import { apiClient } from "../services/apiClient";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async () => {
    const response = await apiClient.login(username, password);
    setMessage(response.ok ? `Logged in as ${response.role}` : (response.message ?? "Login failed"));
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={onSubmit}>Sign in</button>
      <div>{message}</div>
    </div>
  );
}