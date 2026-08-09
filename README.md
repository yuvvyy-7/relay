# RELAY

RELAY is a resilient task application. This first foundation includes:

- React + Vite frontend
- Tailwind CSS styling
- Node.js + Express backend
- MongoDB connection through Mongoose
- Basic task CRUD

Fallback, degraded mode, and recovery sync are intentionally not implemented yet.

## Run

Server:

```bash
cd server
npm install
npm run dev
```

Client:

```bash
cd client
npm install
npm run dev
```

Default URLs:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://localhost:4000`

Set `MONGO_URI` in `server/.env` if your MongoDB is not running at `mongodb://127.0.0.1:27017/relay`.
