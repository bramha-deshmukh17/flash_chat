<p align="center">
  <img src="https://firebasestorage.googleapis.com/v0/b/flash-chat-e08f7.firebasestorage.app/o/logo.png?alt=media&token=083e8077-4533-4ed7-99fa-b500efd06572" alt="Flash Chat Logo" />
</p>
<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</p>
# ⚡ Flash Chat

A real-time chat web application built using the **MERN stack** that allows users to communicate instantly, share media/documents, and authenticate securely.

---

## 🌐 Live Demo

👉 [Flash Chat on Render](https://flash-chat-9dt7.onrender.com)

## 📂 GitHub Repository

🔗 [View Source Code](https://github.com/bramha-deshmukh17/flash_chat)

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Socket.IO Client  
- **Backend**: Node.js, Express.js, Socket.IO Server  
- **Database**: MongoDB Atlas  
- **Authentication**: JWT (JSON Web Tokens)  
- **File Storage**: Firebase Cloud Storage

---

## ✨ Features

- ⚡ Real-time communication using WebSockets
- 🔐 Secure authentication with JWT
- 🖼️ Share documents, images, and media files
- 🧑‍🤝‍🧑 Manage and switch between different chat conversations
- 📲 Responsive and mobile-friendly UI
- 🧾 Backend file size limit handling with proper error messaging

---

## 🔒 Authentication

- Users sign up and log in securely using JWT-based authentication.
- Tokens are stored securely to persist sessions.

---

## 📁 File Upload

- Users can share media and documents directly in the chat.
- Files are uploaded to **Firebase Storage** and shared as downloadable URLs.
- Files >5MB are restricted for performance and bandwidth control.

---

## 🧪 Installation

### 1. **Clone the Repository**

```bash
git clone https://github.com/bramha-deshmukh17/flash_chat.git
cd flash_chat
```

### 2. **Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

- Create a `.env` file in the `frontend` folder with the following (example values):

```env
VITE_API_URL=http://your.ip.address:backend_port/
VITE_APP_NAME=FlashChat
VITE_NODE_ENV=development
VITE_FB_API_KEY=your_fb_api_key
VITE_FB_AUTH_DOMAIN=your_fb_auth_domain
VITE_FB_PROJECT_ID=your_fb_project_id
VITE_FB_STORAGE=your_fb_storage_bucket
VITE_FB_MESSAGE_SENDERID=your_fb_sender_id
VITE_FB_APP_ID=your_fb_app_id
```

### 3. **Backend Setup**

```bash
cd backend
npm install
npm run dev
```

- Create a `.env` file in the `backend` folder with the following (example values):

```env
MONGO_URI=your_mongodb_connection_string
PORT=3001
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://your.ip.address:3000
NODE_ENV=development

FB_API_KEY=your_fb_api_key
FB_AUTH_DOMAIN=your_fb_auth_domain
FB_PROJECT_ID=your_fb_project_id
FB_STORAGE=your_fb_storage_bucket
FB_MESSAGE_SENDERID=your_fb_sender_id
FB_APP_ID=your_fb_app_id
```

---

## 🖥️ Usage

- Register a new account or log in.
- Start chatting, sharing files, and switching between conversations.

---

## ⚙️ Deployment

- The backend serves the production React build from the `/dist` folder.
- For deployment, build the frontend with `npm run build` and copy the output to the backend's `dist` directory.
- Environment variables must be set on your deployment platform.

---

## 🌐 References

- [React](https://react.dev/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Firebase](https://firebase.google.com/)

---
