import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [tab, setTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("sv_current_user");
    if (user) navigate("/dashboard");
  }, []);

  // ===== LOGIN =====
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 🔥 MERN API call (replace later)
      // const res = await fetch("/api/auth/login", {...})

      const users = JSON.parse(localStorage.getItem("sv_users") || "[]");
      const user = users.find(
        (u) =>
          u.email === loginData.email &&
          u.password === loginData.password
      );

      if (!user) {
        setError("Invalid email or password");
        return;
      }

      localStorage.setItem("sv_current_user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err) {
      setError("Something went wrong");
    }
  };

  // ===== SIGNUP =====
  const handleSignup = async (e) => {
    e.preventDefault();

    let users = JSON.parse(localStorage.getItem("sv_users") || "[]");

    if (users.find((u) => u.email === signupData.email)) {
      setError("Email already registered");
      return;
    }

    const newUser = {
      ...signupData,
      portfolio: [],
      balance: 500000,
    };

    users.push(newUser);

    localStorage.setItem("sv_users", JSON.stringify(users));
    localStorage.setItem("sv_current_user", JSON.stringify(newUser));

    navigate("/dashboard");
  };

  // ===== DEMO LOGIN =====
  const demoLogin = () => {
    const demo = {
      name: "Demo User",
      email: "demo@stockvault.in",
      password: "demo123",
      balance: 500000,
      portfolio: [
        { symbol: "RELIANCE", qty: 10, buyPrice: 2600 },
        { symbol: "TCS", qty: 5, buyPrice: 3800 },
      ],
    };

    localStorage.setItem("sv_current_user", JSON.stringify(demo));
    navigate("/dashboard");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT PANEL */}
      <div style={{ flex: 1, background: "#111118", padding: "60px", color: "white" }}>
        <h1>
          Track your wealth, <span style={{ color: "#00e5a0" }}>visually</span>
        </h1>
        <p style={{ color: "#888" }}>
          Portfolio tracking with analytics & charts
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, padding: "60px" }}>
        
        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setTab("login")}>Login</button>
          <button onClick={() => setTab("signup")}>Signup</button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* LOGIN */}
        {tab === "login" && (
          <form onSubmit={handleLogin}>
            <h2>Welcome back</h2>

            <input
              type="email"
              placeholder="Email"
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              required
            />

            <button type="submit">Login</button>

            <p onClick={() => setTab("signup")}>
              No account? Signup
            </p>

            <p onClick={demoLogin} style={{ color: "blue" }}>
              Try Demo Account
            </p>
          </form>
        )}

        {/* SIGNUP */}
        {tab === "signup" && (
          <form onSubmit={handleSignup}>
            <h2>Create Account</h2>

            <input
              type="text"
              placeholder="Name"
              onChange={(e) =>
                setSignupData({ ...signupData, name: e.target.value })
              }
              required
            />

            <input
              type="email"
              placeholder="Email"
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
              required
            />

            <button type="submit">Signup</button>

            <p onClick={() => setTab("login")}>
              Already have an account?
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Auth;
