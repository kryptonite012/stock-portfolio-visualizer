import React, { useEffect, useState } from "react";

function Contact() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("OPEN");

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("sv_current_user"));

    if (!currentUser) {
      window.location.href = "/";
      return;
    }

    setUser(currentUser);

    setForm((prev) => ({
      ...prev,
      name: currentUser.name,
      email: currentUser.email,
    }));

    checkStatus();
  }, []);

  const checkStatus = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    let isOpen = false;

    if (day >= 1 && day <= 5 && hour >= 9 && hour < 21) isOpen = true;
    if (day === 6 && hour >= 10 && hour < 18) isOpen = true;

    setStatus(isOpen ? "OPEN" : "CLOSED");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      setForm({
        name: user.name,
        email: user.email,
        category: "",
        subject: "",
        message: "",
      });

      setTimeout(() => setSuccess(false), 4000);
    }, 1500);
  };

  const logout = () => {
    localStorage.removeItem("sv_current_user");
    window.location.href = "/";
  };

  if (!user) return null;

  return (
    <div style={{ display: "flex", background: "#0a0a0f", color: "white" }}>
      {/* Sidebar */}
      <div style={{ width: "220px", padding: "20px", background: "#111118" }}>
        <h2>StockVault</h2>
        <p>{user.name}</p>
        <p style={{ fontSize: "12px", color: "#888" }}>{user.email}</p>
        <button onClick={logout}>Logout</button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "30px" }}>
        <h1>Contact Us</h1>
        <p style={{ color: "#888" }}>
          Get in touch with our support team
        </p>

        <div style={{ display: "flex", gap: "30px", marginTop: "20px" }}>
          
          {/* LEFT INFO */}
          <div>
            <h3>Reach us</h3>
            <p>Email: support@stockvault.in</p>
            <p>Phone: +91 98765 43210</p>
            <p>Status: 
              <span style={{ color: status === "OPEN" ? "green" : "red" }}>
                {" "} {status}
              </span>
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} style={{ width: "400px" }}>
            <input
              id="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              required
            />

            <input
              id="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />

            <select id="category" value={form.category} onChange={handleChange}>
              <option value="">Select</option>
              <option value="portfolio">Portfolio</option>
              <option value="bug">Bug</option>
            </select>

            <input
              id="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Subject"
              required
            />

            <textarea
              id="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Message"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>

            {success && (
              <p style={{ color: "green" }}>
                Message sent successfully!
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
