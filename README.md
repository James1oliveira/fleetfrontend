# Fleet Management System — Frontend

A role-based fleet management web application built with React and Material UI. It lets a transport/logistics team track vehicles, drivers, delivery orders, maintenance schedules, and operating costs, and includes a real-time messaging module for dispatchers, admins, and drivers to communicate.

**Live app:** https://fleetfrontend-9fus.onrender.com/login

**Backend repo:** https://github.com/James1oliveira/fleetbackend

**Frontend repo:** https://github.com/James1oliveira/fleetfrontend

> This README documents the frontend only. It requires the companion Node/Express backend (linked above) to function, since all pages fetch data from a REST API and one module (Communication) uses a WebSocket connection.

---

## Features

- **Authentication** — Login and Registration screens backed by a shared `AuthContext`, with role selection (Admin / Dispatcher / Driver) at sign-up.
- **Dashboard** — At-a-glance stats: total and active vehicles, total and active drivers, pending and in-progress orders, and total operating costs, pulled from the vehicles, drivers, orders, and costs endpoints in parallel.
- **Vehicles** — Fleet inventory management.
- **Drivers** — Driver directory with license details, experience, rating, trip count, distance driven, and current vehicle assignment. Admins/dispatchers can edit driver records or remove a driver.
- **Orders** — Delivery/job order tracking.
- **Maintenance** — Schedule and track preventive, corrective, inspection, and repair work per vehicle, with status (scheduled / in-progress / completed / cancelled) and priority (low → urgent) tracking, plus cost logging.
- **Costs** — Log fuel, maintenance, insurance, tax, toll, and parking expenses per vehicle, with automatic amount calculation from quantity × unit price, a running total, and a breakdown by cost type.
- **Communication** — Real-time direct messaging between users via Socket.IO, with a contact list, conversation history, and message deletion.
- **Role-based UI** — Admin/dispatcher-only actions (create, edit, delete) are hidden from other roles at the component level.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| UI Components | Material UI (`@mui/material`, `@mui/icons-material`), Emotion |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Real-time | Socket.IO Client |
| Maps | Leaflet / React-Leaflet |
| Charts | Recharts |
| Build Tooling | Create React App (`react-scripts` 5) |
| Testing (scaffolded) | React Testing Library / Jest |
| Deployment | Render (static hosting) |

---

## Project Structure

```
src/
├── components/
│   ├── Login.js
│   ├── Register.js
│   ├── Dashboard.js
│   ├── Vehicles.js
│   ├── Drivers.js
│   ├── Orders.js
│   ├── Maintenance.js
│   ├── Costs.js
│   └── Communication.js
├── context/
│   └── AuthContext.js       # login/register/session state, current user + role
├── services/
│   ├── api.js                # Axios instance (REST calls to the backend)
│   └── socket.js              # Socket.IO client connection
└── App.js                     # Route definitions
```

## Deployment

The production build is deployed as a static site on [Render](https://render.com), live at:
https://fleetfrontend-9fus.onrender.com/login

---

## License

No license specified yet — add one (e.g. MIT) if this project will be shared or open-sourced.
