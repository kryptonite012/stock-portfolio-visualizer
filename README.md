📈 StockVault — Stock Portfolio Visualizer

StockVault is a fully frontend-powered Stock Portfolio Visualizer that simulates a real-world stock trading experience. It allows users to manage a virtual investment portfolio, analyze performance, and understand financial metrics — all without requiring any backend or paid APIs.

🚀 Key Highlights
💼 Virtual portfolio with ₹5,00,000 starting balance
📊 Interactive charts & analytics (6+ chart types)
🔐 Authentication system using localStorage
📈 Real-time price simulation (auto-refresh)
📱 Fully responsive design
⚡ Zero backend — runs entirely in browser
🎯 What Problem It Solves

StockVault helps beginners:

Understand how stock portfolios work
Visualize gains/losses in real-time
Learn diversification & risk concepts
Practice trading without real money
🧱 Project Structure
stock-portfolio/
├── index.html        # Login & Signup page
├── dashboard.html    # Portfolio overview
├── search.html       # Stock browsing & buying
├── analytics.html  # Advanced analytics
├── react.js  # react for app
└── README.md         # Documentation
🛠 Tech Stack
Tech	Usage
HTML5	Structure
CSS3	UI, animations, responsiveness
JavaScript (Vanilla)	Core logic & state
Chart.js	Data visualization
localStorage	Database simulation
Google Fonts	Typography
⚙️ System Architecture
🔹 Frontend Modules
Page	Description
index.html	User authentication
dashboard.html	Portfolio summary & charts
search.html	Stock discovery & trading
analytics.html	Deep insights & metrics
🔹 Data Layer (localStorage)

Acts as a mock database:

sv_users → Stores all users
sv_current_user → Active session
Sample User Object:
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123",
  "balance": 500000,
  "portfolio": [
    {
      "symbol": "TCS",
      "name": "Tata Consultancy Services",
      "sector": "IT",
      "qty": 5,
      "buyPrice": 3800
    }
  ]
}
📊 Features Breakdown
🏠 Dashboard
Portfolio value, invested amount, P&L
📈 Line chart → performance over time
🍩 Donut chart → stock allocation
📊 Sector exposure (bar chart)
📋 Holdings table with live profit/loss
🔄 Auto-refresh every 15 seconds
🔍 Stock Search & Trading
Browse top Indian stocks (NSE-based)
🔎 Search by name or symbol
🎯 Filter by sector
📉 Mini sparkline charts
💸 Buy stocks with custom quantity
📊 Advanced Analytics
📈 Total return %
🥇 Best & worst performers
📅 12-month simulated growth chart
📊 Profit/Loss bar visualization
🧭 Sector distribution (polar chart)
⚠️ Risk metrics:
Concentration risk
Diversification score
Cash ratio
💡 Core Concepts Implemented
🔐 Authentication (Login/Signup system)
🧠 State management using localStorage
🔄 CRUD operations (portfolio management)
📊 Financial calculations:
Profit & Loss
Return %
Portfolio weight
Sector exposure
📱 Responsive UI design
📉 Stock Price Simulation

Since no external API is used:

Prices are generated dynamically
Fluctuate within ±8% range
Simulates real market movement
Updates every session
▶️ How to Run
Download or clone the project
Open index.html in a browser
Choose:
👉 “Try Demo Account”
OR create a new account

✅ No installation required
✅ No backend needed
✅ Works offline (except fonts)

🎨 UI/UX Features
Smooth animations & transitions

Clean dashboard layout
Minimal, modern design
Mobile-friendly interface
Color-coded profit/loss indicators

🔮 Future Improvements
🔗 Integration with real stock APIs (e.g., NSE, Yahoo Finance)
📊 More advanced indicators (moving averages, RSI)
🌙 Dark mode support
📥 Export portfolio as PDF/CSV
👥 Multi-user cloud database (Firebase / MongoDB)
🤝 Contribution

Feel free to fork this project and enhance it:

Add new features
Improve UI/UX
Optimize performance
