# PAS: Principal Appointment Management System

A robust, full-stack solution designed to streamline the scheduling and management of appointments with educational principals. This system provides a seamless interface for users to book slots and for administrators to manage availability and gain strategic insights.

---

## 🚀 Key Features

- **🗓️ Dynamic Calendar View**: Interactive calendar for real-time availability tracking and date selection.
- **🕒 Smart Slot Management**: Automated time-slot generation and conflict prevention.
- **📊 Admin Dashboard**: Real-time statistics, participation rates, and system demand analysis.
- **🔔 Notification System**: Automated alerts for booking confirmations and status changes.
- **📄 Strategic Reporting**: Detailed appointment history with export capabilities and status tracking.
- **👤 User Management**: Role-based access for Admins, Staff, and Users.

---

## 🛠️ Tech Stack

**Frontend:**

- React (v19)
- Vite (Fast Build Tool)
- Lucide React (Icons)
- Bootstrap (Styling)
- Axios (API Communication)

**Backend:**

- Node.js & Express
- MySQL (Database)
- MySQL2 (Promise-based client)
- CORS & Dotenv (Security & Configuration)

---

## 📁 Project Structure

```text
PAS/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page-level components
│   │   ├── services/    # API service layers
│   │   └── utils/       # Helper functions
├── server/              # Node.js backend
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── models/          # Database schemas
│   └── config/          # Configurations
└── .gitignore           # Ignored files (node_modules, .env, etc.)
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites

- Node.js (v18+)
- MySQL Server

### 2. Database Setup

1. Create a database named `pas_db` (or as per your `.env`).
2. Run the provided SQL scripts in `server/schema.sql` to initialize tables.

### 3. Server Configuration

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=pas_db
PORT=5001
```

Start the server:

```bash
npm run dev
```

### 4. Client Configuration

```bash
cd client
npm install
npm run dev
```

---

## 🛡️ Security & Best Practices

- **Confidentiality**: Sensitive configurations are managed via `.env` and excluded from source control.
- **Performance**: Optimized rendering with React 19 patterns.
- **Scalability**: Decoupled architecture allowing independent scaling of frontend and backend.

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`.
2. Commit your changes: `git commit -m 'Add your feature'`.
3. Push to the branch: `git push origin feature/your-feature`.
4. Open a Pull Request.

---

## 📜 License

Developed by **Rajkumar Anbazhagan**.
