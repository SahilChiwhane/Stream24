# 🎬 Stream24

**Stream24** is a full-stack **OTT streaming platform** that allows users to watch movies, anime, and TV series with subscription-based access.

The project simulates the core experience of modern streaming platforms such as Netflix or Crunchyroll, including authentication, subscriptions, personalized browsing, and watch history tracking.

🔗 **Live Demo:**
https://stream24-b91w.vercel.app/

---

# 🚀 Tech Stack

| Layer              | Technologies                                  |
| ------------------ | --------------------------------------------- |
| **Frontend**       | React, Tailwind CSS, React Router, Axios      |
| **Backend**        | Node.js, Express                              |
| **Database**       | Firebase Firestore                            |
| **Authentication** | Firebase Auth (Email/Password)                |
| **Payments**       | Razorpay                                      |
| **Caching**        | Node-Cache                                    |
| **Security**       | Helmet, Rate Limiting, CORS                   |
| **Deployment**     | Vercel                                        |

---

# ✨ Features

### 🎥 Content Discovery

* Browse trending movies, anime, and TV series
* Content data fetched from **TMDB API**
* Backend caching to reduce API calls

### 🔐 Authentication

* Email / Password login
* Google OAuth login
* Firebase token verification on backend

### 💳 Subscription & Payments

* Subscription plan selection
* Razorpay checkout integration
* Secure server-side payment verification

### ▶️ Video Playback

* Embedded video player
* Trailer previews and media playback

### ⏱ Watch History

* Tracks playback progress
* **Continue Watching** section on home page

### 🔎 Search

* Debounced multi-category search
* Movies, anime, and TV series

### ❤️ Wishlist

* Users can save content for later viewing

---

# 🏗 Architecture

The backend follows a **modular architecture** with clear separation of responsibilities.

```
Routes → Controller → Service
```

Each feature is organized into its own module (auth, content, payments, search, watch-history, etc.), making the codebase easier to maintain and extend.

---

# 📁 Project Structure

```
Stream24
│
├── backend
│   └── src
│       ├── app.js
│       ├── server.js
│       ├── config
│       ├── middlewares
│       ├── modules
│       └── utils
│
├── frontend
│   └── src
│       ├── App.js
│       ├── features
│       ├── layouts
│       ├── pages
│       ├── routes
│       ├── services
│       └── shared
```

The frontend uses a **feature-based structure**, where each major UI capability (auth, browse, player, search, etc.) is implemented as a separate module.

---

# ⚙️ Running Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on:

```
http://localhost:5051
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs on:

```
http://localhost:3000
```

---

# 🌐 Deployment

Both the frontend and backend are deployed on **Vercel**.

🔗 **Live Application:**
https://stream24-b91w.vercel.app/

---

# 👨‍💻 Author

**Sahil Chiwhane**

Built as part of learning full-stack development and exploring how modern OTT platforms are architected.

