# 💊 PharmaLite

A modern, full-stack **Pharmacy Management System** built with React + Node.js/Express + MongoDB Atlas.

---

## ✨ Features

- **Dashboard** — Live KPIs (revenue, stock, expiry alerts, low-stock counts)
- **Inventory** — Full CRUD for medicines with search, filter, sort, and stock tracking
- **Sales & Reports** — Record sales with live medicine search + cart, revenue charts, payment breakdown
- **Expiry Alerts** — Visual timeline of medicines expiring within 30 / 60 / 90 days
- **Settings** — Profile update, password change, notification preferences, theme & accent color
- **Auth** — JWT-based login/register with auto-logout on stale token
- **Theme** — Dark / Light mode toggle with animated pill button
- **Notifications** — Bell icon with live expiry + low-stock alerts

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router v6, Vite, Vanilla CSS |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | express-validator |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/pharmalite.git
cd pharmalite
```

### 2. Set up the backend
```bash
cd backend
cp .env.example .env
# Edit .env and fill in your MONGO_URI and JWT_SECRET
npm install
node server.js
```

### 3. Set up the frontend
```bash
cd ..          # back to project root
npm install
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📁 Project Structure

```
pharmalite/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose models (User, Medicine, Sale)
│   │   ├── routes/          # Express route handlers
│   │   ├── middleware/       # Auth middleware
│   │   └── app.js           # Express app setup
│   ├── server.js
│   └── .env.example
├── src/
│   ├── api/                 # Centralized API client
│   ├── context/             # React context (Auth, Theme)
│   ├── dashboard/           # Layout, Sidebar, TopBar
│   └── pages/               # All page components
├── index.html
└── vite.config.js
```

---

## 🔒 Environment Variables

See [`backend/.env.example`](backend/.env.example) for the full list.

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (default: `7d`) |
| `PORT` | Backend port (default: `3000`) |
| `CORS_ORIGIN` | Allowed frontend origin |

---

## 📄 License

MIT
