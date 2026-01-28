# Pastebin Lite

Pastebin Lite is a lightweight Pastebin-style application built with **Node.js**, **Express**, and **MongoDB**.  
It allows users to create text pastes, generate shareable links, and view pastes via a browser or API with optional expiration rules.

---

## Features

- Create a paste via UI or API
- View a paste via a shareable HTML link
- Fetch paste content via API
- Optional expiration rules:
  - Time-to-live (TTL)
  - Maximum view count
- Clear error handling for invalid input and expired pastes
- Deterministic time support for automated testing
- Persistent storage using MongoDB Atlas
- Safe HTML rendering (no script execution)

---

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **ID Generation:** nanoid
- **Environment Variables:** dotenv
- **CORS:** enabled for API testing

---

## Running Locally

### 1. Clone repository
```bash
git clone [Pastebin-Lite](https://github.com/Prabzzz/pastebin-lite.git)
cd pastebin-lite
```

### 2. Install dependencies
npm install

### 3. Create .env file
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/pastebin-lite
BASE_URL=http://localhost:3000
TEST_MODE=0

### 4. Start server
node src/index.js
