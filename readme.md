
# Node.js Hackathon Template

### Express + MySQL + JWT Auth + HTML Frontend

## 🚀 Features

* User **registration** with hashed passwords (bcrypt)
* User **login** with JWT token generation
* **Protected API** routes using middleware
* Simple **HTML Frontend** (Login / Register / Home)
* Clean project structure ideal for a **24h hackathon**

---

## 📁 Project Structure

```
project/
│  app.js
│  index.js
│  package.json
│  README.md
│  .env.example
│
├─ config/
│    db.js
│
├─ controllers/
│    authController.js
│
├─ middleware/
│    auth.js
│    errorHandler.js
│
├─ models/
│    userModel.js
│
├─ routes/
│    auth.js
│    home.js
│
└─ public/
     login.html
     register.html
     home.html
     style.css
```

---

## 🔧 Installation

Install dependencies:

```bash
npm install
```

---

## ⚙️ Environment Setup

Create a `.env` file:

```
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=hackathon
JWT_SECRET=supersecret
```

---

## 🏁 Run the Server

```bash
node index.js
```

Server will run on:

```
http://localhost:4000
```

---

## 🧪 API Endpoints

### Register a user

```
POST /api/register
```

Body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "123456"
}
```

### Login

```
POST /api/login
```

Body:

```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

Returns:

```json
{
  "token": "JWT_TOKEN_HERE"
}
```

### Protected home route

```
GET /api/home
Authorization: Bearer <token>
```

---

## 🎨 Frontend

Open these files in the browser:

* `public/login.html`
* `public/register.html`
* `public/home.html`

They use basic HTML + Fetch API to interact with the backend.

---

Just tell me!
