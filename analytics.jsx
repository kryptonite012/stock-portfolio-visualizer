import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const STOCKS = [
  { symbol: "RELIANCE", sector: "Energy", base: 2800 },
  { symbol: "TCS", sector: "IT", base: 3900 },
  { symbol: "INFY", sector: "IT", base: 1430 },
  { symbol: "HDFC", sector: "Finance", base: 1700 },
  { symbol: "WIPRO", sector: "IT", base: 440 },
];

const COLORS = [
  "#00e5a0",
  "#7c6aff",
  "#ff5470",
  "#ffb547",
  "#38bdf8",
];

function Analytics() {
  const areaRef = useRef(null);
  const pieRef = useRef(null);
  const barRef = useRef(null);

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState([]);

  // Generate random price
  const genPrice = (base) =>
    +(base * (0.92 + Math.random() * 0.16)).toFixed(2);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("sv_current_user"));

    if (!currentUser) {
      window.location.href = "/";
      return;
    }

    setUser(currentUser);

    const portfolio = currentUser.portfolio || [];

    const prices = {};
    portfolio.forEach((h) => {
      const s = STOCKS.find((x) => x.symbol === h.symbol);
      prices[h.symbol] = genPrice(s ? s.base : h.buyPrice);
    });

    const holdingStats = portfolio.map((h) => {
      const cur = prices[h.symbol];
      const inv = h.qty * h.buyPrice;
      const val = h.qty * cur;
      const pnl = val - inv;
      const pct = (pnl / inv) * 100;

      return { ...h, cur, inv, val, pnl, pct };
    });

    setStats(holdingStats);

    createCharts(holdingStats);
  }, []);

  const createCharts = (holdingStats) => {
    if (!holdingStats.length) return;

    // AREA CHART
    new Chart(areaRef.current, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
          {
            data: holdingStats.map((h) => h.val),
            borderColor: "#00e5a0",
            fill: true,
          },
        ],
      },
    });

    // PIE CHART
    new Chart(pieRef.current, {
      type: "doughnut",
      data: {
        labels: holdingStats.map((h) => h.symbol),
        datasets: [
          {
            data: holdingStats.map((h) => h.val),
            backgroundColor: COLORS,
          },
        ],
      },
    });

    // BAR CHART
    new Chart(barRef.current, {
      type: "bar",
      data: {
        labels: holdingStats.map((h) => h.symbol),
        datasets: [
          {
            data: holdingStats.map((h) => h.pnl),
            backgroundColor: holdingStats.map((h) =>
              h.pnl >= 0 ? "#00e5a0" : "#ff5470"
            ),
          },
        ],
      },
    });
  };

  if (!user) return null;

  return (
    <div style={{ padding: "20px", color: "white", background: "#0a0a0f" }}>
      <h1>Analytics</h1>

      {stats.length === 0 ? (
        <p>No holdings yet</p>
      ) : (
        <>
          {/* Charts */}
          <div style={{ display: "flex", gap: "20px" }}>
            <canvas ref={areaRef}></canvas>
            <canvas ref={pieRef}></canvas>
          </div>

          <div style={{ marginTop: "20px" }}>
            <canvas ref={barRef}></canvas>
          </div>

          {/* Table */}
          <table style={{ width: "100%", marginTop: "20px" }}>
            <thead>
              <tr>
                <th>Stock</th>
                <th>Return %</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((h, i) => (
                <tr key={i}>
                  <td>{h.symbol}</td>
                  <td style={{ color: h.pct >= 0 ? "green" : "red" }}>
                    {h.pct.toFixed(2)}%
                  </td>
                  <td style={{ color: h.pnl >= 0 ? "green" : "red" }}>
                    ₹{Math.round(h.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Analytics;
