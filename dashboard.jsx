import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

const STOCKS = [
  { symbol: "RELIANCE", name: "Reliance", sector: "Energy", base: 2800 },
  { symbol: "TCS", name: "TCS", sector: "IT", base: 3900 },
  { symbol: "INFY", name: "Infosys", sector: "IT", base: 1430 },
  { symbol: "HDFC", name: "HDFC Bank", sector: "Finance", base: 1700 },
];

function Dashboard() {
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [prices, setPrices] = useState({});
  const [toast, setToast] = useState("");

  const lineRef = useRef(null);
  const donutRef = useRef(null);

  // Generate prices
  const genPrices = () => {
    const newPrices = {};
    STOCKS.forEach((s) => {
      newPrices[s.symbol] = +(
        s.base *
        (0.92 + Math.random() * 0.16)
      ).toFixed(2);
    });
    setPrices(newPrices);
  };

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("sv_current_user"));

    if (!currentUser) {
      window.location.href = "/";
      return;
    }

    setUser(currentUser);
    setPortfolio(currentUser.portfolio || []);
    genPrices();
  }, []);

  useEffect(() => {
    if (portfolio.length) createCharts();
  }, [portfolio, prices]);

  const createCharts = () => {
    // Line chart
    new Chart(lineRef.current, {
      type: "line",
      data: {
        labels: portfolio.map((p) => p.symbol),
        datasets: [
          {
            data: portfolio.map(
              (p) => p.qty * (prices[p.symbol] || p.buyPrice)
            ),
            borderColor: "#00e5a0",
          },
        ],
      },
    });

    // Donut chart
    new Chart(donutRef.current, {
      type: "doughnut",
      data: {
        labels: portfolio.map((p) => p.symbol),
        datasets: [
          {
            data: portfolio.map(
              (p) => p.qty * (prices[p.symbol] || p.buyPrice)
            ),
            backgroundColor: ["#00e5a0", "#7c6aff", "#ff5470"],
          },
        ],
      },
    });
  };

  const addStock = () => {
    const newStock = {
      symbol: "TCS",
      name: "TCS",
      qty: 1,
      buyPrice: 3900,
    };

    const updated = [...portfolio, newStock];
    setPortfolio(updated);

    const updatedUser = { ...user, portfolio: updated };
    localStorage.setItem("sv_current_user", JSON.stringify(updatedUser));

    setToast("Stock added!");
    setTimeout(() => setToast(""), 2000);
  };

  const removeStock = (index) => {
    const updated = portfolio.filter((_, i) => i !== index);
    setPortfolio(updated);

    const updatedUser = { ...user, portfolio: updated };
    localStorage.setItem("sv_current_user", JSON.stringify(updatedUser));

    setToast("Stock removed!");
    setTimeout(() => setToast(""), 2000);
  };

  if (!user) return null;

  const totalValue = portfolio.reduce(
    (sum, p) => sum + p.qty * (prices[p.symbol] || p.buyPrice),
    0
  );

  return (
    <div style={{ display: "flex", background: "#0a0a0f", color: "white" }}>
      
      {/* Sidebar */}
      <div style={{ width: "220px", padding: "20px", background: "#111118" }}>
        <h2>StockVault</h2>
        <p>{user.name}</p>
        <button onClick={() => localStorage.removeItem("sv_current_user")}>
          Logout
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "30px" }}>
        <h1>Dashboard</h1>

        {/* Stats */}
        <h3>Total Value: ₹{Math.round(totalValue)}</h3>

        {/* Buttons */}
        <button onClick={genPrices}>Refresh Prices</button>
        <button onClick={addStock}>Add Stock</button>

        {/* Charts */}
        <div style={{ display: "flex", gap: "20px" }}>
          <canvas ref={lineRef}></canvas>
          <canvas ref={donutRef}></canvas>
        </div>

        {/* Holdings */}
        <table style={{ width: "100%", marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Stock</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((p, i) => (
              <tr key={i}>
                <td>{p.symbol}</td>
                <td>{p.qty}</td>
                <td>₹{prices[p.symbol] || p.buyPrice}</td>
                <td>
                  <button onClick={() => removeStock(i)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", bottom: 20, right: 20 }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
