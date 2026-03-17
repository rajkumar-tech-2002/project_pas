# PAS — Principal Appointment System

A full-stack web application for scheduling and managing appointments with the Principal of an educational institution. Staff members can book time slots online, and Admins can manage availability, monitor activity, and generate reports — all from a clean, modern interface.

---

## 🎯 Objective

To digitize and streamline the manual appointment process between staff/students and the Principal, reducing scheduling conflicts and providing real-time administrative insight.

---

## 🚀 Key Features

### 👤 Role-Based Access

- **Admin** — Full control: manage availability, view all appointments, generate reports, reschedule and track meetings in real time.
- **Staff** — Book appointments, view personal booking history, and receive status notifications.

### 🗓️ Appointment Management

- Book appointments within admin-defined availability windows
- Automatic conflict detection — prevents double-booking
- Reschedule existing appointments (Admin only)
- Status lifecycle: `Active → InProgress → Completed / Cancelled`
- Real-time live timer for In-Progress meetings on the Admin Dashboard

### 📅 Availability & Slot Control

- Admin sets date-wise availability windows (start time – end time)
- Slot Management for fine-grained time-slot control
- Calendar view for date-based availability overview

### 📊 Admin Dashboard & Insights

- Live Activity Feed with the 8 most recent appointments
- KPI cards: Total Sessions, Pending Active, Fulfilled, Cancelled
- Strategic Insights panel: Staff Participation Rate, Portal Traffic (30-day load factor), Peak Hour detection with actionable System Tips

### 🔔 Notification System

- Automatic notifications on booking and status changes
- Admin notified on every new booking
- User notified on every status update
- Mark individual or all notifications as read

### 📄 Reports

- Filter reports by date range and status
- Export to Excel (XLSX) using the `xlsx` library

---

## 🛠️ Tech Stack

| Layer            | Technology                                                  |
| ---------------- | ----------------------------------------------------------- |
| **Frontend**     | React 19, React Router DOM v7, Vite 7                       |
| **UI & Styling** | Bootstrap 5, Lucide React (icons), custom CSS               |
| **State / UX**   | Sonner (toast notifications), date-fns                      |
| **HTTP Client**  | Axios                                                       |
| **Backend**      | Node.js, Express 4 (ES Modules)                             |
| **Database**     | MySQL, mysql2 (Promise-based)                               |
| **Dev Tools**    | Nodemon, dotenv                                             |
| **Deployment**   | IIS (via `web.config`), Vite static build served by Express |

---

## 📁 Project Structure

```
PAS/
├── client/                         # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx                  # Root component (BrowserRouter + Toaster)
│       ├── main.jsx
│       ├── index.css                # Global styles
│       ├── routes/
│       │   └── AppRoutes.jsx        # Route definitions + role-based PrivateRoute guard
│       ├── components/
│       │   ├── calendar/
│       │   │   ├── CalendarView.jsx
│       │   │   ├── TimeRangeSelector.jsx
│       │   │   ├── TimeSlotModal.jsx
│       │   │   └── TimeSlotSelector.jsx
│       │   ├── common/
│       │   │   ├── MainLayout.jsx   # Shared layout (Navbar + Sidebar + Outlet)
│       │   │   ├── Navbar.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   └── Footer.jsx
│       │   └── ui/
│       │       ├── Loader.jsx
│       │       └── sonnar.jsx       # Sonner Toaster wrapper
│       ├── pages/
│       │   ├── auth/
│       │   │   └── Login.jsx
│       │   ├── admin/
│       │   │   ├── AdminDashboard.jsx        # Stats, Live feed, Insights
│       │   │   ├── AllAppointments.jsx       # Full appointment list
│       │   │   ├── AvailabilityManagement.jsx
│       │   │   ├── SlotManagement.jsx
│       │   │   ├── Reports.jsx               # Filter + Excel export
│       │   │   └── RescheduleAppointment.jsx
│       │   └── user/
│       │       ├── UserDashboard.jsx
│       │       ├── BookAppointment.jsx       # Calendar + slot picker + conflict check
│       │       └── MyAppointments.jsx        # Personal appointment history
│       └── services/
│           ├── api.js                        # Axios base instance
│           ├── appointmentService.js         # Booking, status, reschedule, stats, report
│           ├── authService.js
│           ├── availabilityService.js
│           └── notificationService.js
│
├── server/                          # Node.js + Express backend
│   ├── index.js                     # App entry — middleware, routes, static serving
│   ├── db.js                        # MySQL2 connection pool
│   ├── schema.sql                   # Database schema + seed data
│   ├── package.json
│   ├── web.config                   # IIS deployment config
│   ├── routes/
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── availabilityRoutes.js
│   │   └── notificationRoutes.js
│   └── controllers/
│       ├── appointmentController.js
│       ├── authController.js
│       ├── availabilityController.js
│       └── notificationController.js
│
└── .gitignore
```

---

## 🗄️ Database Schema

Database name: **`PAS`**

| Table                  | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `users`                | Stores Admin / Staff accounts with roles                |
| `availability_windows` | Date-wise time windows the Principal is available       |
| `appointments`         | All bookings with status, actual start/end times        |
| `notifications`        | System messages triggered on booking and status changes |

### Appointment Status Flow

```
Active → InProgress → Completed
Active →             Cancelled
```

---

## 🔌 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description                            |
| ------ | -------- | -------------------------------------- |
| POST   | `/login` | Authenticate user; returns user object |

### Availability — `/api/availability`

| Method | Endpoint | Description                          |
| ------ | -------- | ------------------------------------ |
| GET    | `/`      | Get all availability windows         |
| GET    | `/:date` | Get availability for a specific date |
| POST   | `/`      | Create a new availability window     |
| PUT    | `/:id`   | Update a window                      |
| DELETE | `/:id`   | Delete a window                      |

### Appointments — `/api/appointments`

| Method | Endpoint          | Description                                                             |
| ------ | ----------------- | ----------------------------------------------------------------------- |
| GET    | `/`               | Get all appointments                                                    |
| GET    | `/stats`          | Get count stats (total, active, completed, cancelled)                   |
| GET    | `/insights`       | Get strategic insights (staff participation, portal traffic, peak hour) |
| GET    | `/report`         | Get filtered report data (`?startDate=&endDate=&status=`)               |
| GET    | `/date/:date`     | Get appointments for a specific date                                    |
| GET    | `/:id`            | Get a single appointment                                                |
| POST   | `/`               | Book a new appointment                                                  |
| PATCH  | `/:id/status`     | Update appointment status                                               |
| PATCH  | `/:id/reschedule` | Reschedule an appointment                                               |
| PATCH  | `/:id/start`      | Mark meeting as InProgress (records `actual_start_time`)                |
| PATCH  | `/:id/complete`   | Mark meeting as Completed (records duration in seconds)                 |
| DELETE | `/:id`            | Delete an appointment                                                   |

### Notifications — `/api/notifications`

| Method | Endpoint    | Description                                                  |
| ------ | ----------- | ------------------------------------------------------------ |
| GET    | `/`         | Get notifications (filter by `user_id` and `role` via query) |
| PUT    | `/:id/read` | Mark a notification as read                                  |
| PUT    | `/read-all` | Mark all notifications as read                               |

---

## ⚙️ Installation & Setup

### 1. Prerequisites

- **Node.js** v18 or higher
- **MySQL** Server (v8 recommended)

### 2. Database Setup

```sql
-- Run schema.sql in your MySQL client
source server/schema.sql;
```

This creates the `PAS` database, all four tables, and inserts three seed users.

### 3. Server Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=PAS
PORT=5001
```

Start the development server:

```bash
npm run dev        # uses nodemon for auto-reload
# or
npm start          # production start
```

### 4. Client Setup

```bash
cd client
npm install
npm run dev        # Vite dev server (usually http://localhost:5173)
```

### 5. Production Build

```bash
cd client
npm run build      # outputs to client/dist/
```

The Express server is configured to serve `client/dist` as static files and fall back to `index.html` for client-side routing. Run only `npm start` in the `server/` directory for production.

---

## 🔐 Default Login Credentials

> ⚠️ These are for initial testing only. Passwords are stored in plain text in the seed data — update them before production use.

| Username | Password   | Role  |
| -------- | ---------- | ----- |
| `admin`  | `admin123` | Admin |
| `staff1` | `staff123` | Staff |

---

## 🛡️ Security Notes

- **Environment Variables**: All database credentials are stored in `.env` (excluded from Git via `.gitignore`).
- **Role-Based Routing**: Client-side `PrivateRoute` restricts pages by role using `localStorage` session.
- **Auth**: Currently session-based via `localStorage`. For production, consider JWT with HTTP-only cookies.
- **Passwords**: Seed passwords are plain text — hash with `bcrypt` before going live.

---

## 🌐 Deployment (IIS)

The `server/web.config` is pre-configured for IIS hosting with iisnode. After building the client:

1. Build the client: `cd client && npm run build`
2. Configure IIS to point to the `server/` directory
3. Ensure `iisnode` module is installed on the IIS server
4. Set environment variables in IIS application settings or via `.env`

---

## 👨‍💻 Developer

**Rajkumar Anbazhagan**

---

## 📜 License

This project was developed as an academic/institutional tool. All rights reserved.
