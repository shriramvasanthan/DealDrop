# DealDrop — Hyperlocal Flash Sale Platform

A full-stack web app connecting local retailers with nearby customers via time-limited flash deals.

## Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, Framer Motion, React Leaflet
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth:** JWT + bcrypt

## Getting Started

### Backend
```bash
cd backend
npm install
# Set up your .env (see .env.example)
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables (`backend/.env`)
```
MONGO_URI=mongodb://localhost:27017/dealdrop
PORT=5001
JWT_SECRET=your_secret_here
NODE_ENV=development
```
