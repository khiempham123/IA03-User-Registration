# IA03 Backend (Nest + Mongoose)

Features:
- POST /user/register endpoint
- Mongoose user schema: email (unique), password (hashed), createdAt
- Uses environment variable MONGO_URI

Quick start (Windows PowerShell):

1. Install dependencies

   npm install

2. Create a .env file (or set environment variables). Example in .env.example

3. Run (development)

   npm run start

Notes:
- The project expects a running MongoDB instance at MONGO_URI (default in .env.example).
- For production or CI, run `npm run build` and `node dist/main.js`.
