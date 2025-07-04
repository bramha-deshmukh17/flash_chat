<p align="center">
  <img src="./frontend/public/logo.png" alt="Flash Chat Logo" />
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


## Table of Contents

- [🌐 Live Demo](#live-demo)
- [📂 GitHub Repository](#github-repository)
- [🛠️ Tech Stack](#tech-stack)
- [✨ Features](#features)
- [🔒 Authentication](#authentication)
- [📁 File Upload](#file-upload)
- [🧪 Installation](#installation)
- [🖥️ Usage](#usage)
- [⚙️ Deployment](#deployment)
- [🌐 References](#references)
- [🧑 Author](#author)
- [📬 Contact](#contact)

---

## <a id="live-demo"></a>🌐 Live Demo

👉 [Flash Chat on Render](https://flash-chat-9dt7.onrender.com)

## <a id="github-repository"></a>📂 GitHub Repository

🔗 [View Source Code](https://github.com/bramha-deshmukh17/flash_chat)

---

## <a id="tech-stack"></a>🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Socket.IO Client  
- **Backend**: Node.js, Express.js, Socket.IO Server  
- **Database**: MongoDB Atlas  
- **Authentication**: JWT (JSON Web Tokens)  
- **File Storage**: Firebase Cloud Storage

---

## <a id="features"></a>✨ Features

- ⚡ Real-time communication using WebSockets
- 🔐 Secure authentication with JWT
- 🖼️ Share documents, images, and media files
- 🧑‍🤝‍🧑 Manage and switch between different chat conversations
- 📲 Responsive and mobile-friendly UI
- 🧾 Backend file size limit handling with proper error messaging

---

## <a id="authentication"></a>🔒 Authentication

- Users sign up and log in securely using JWT-based authentication.
- Tokens are stored securely to persist sessions.

---

## <a id="file-upload"></a>📁 File Upload

- Users can share media and documents directly in the chat.
- Files are uploaded to **Firebase Storage** and shared as downloadable URLs.
- Files >5MB are restricted for performance and bandwidth control.

---

## <a id="installation"></a>🧪 Installation

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

> ⚠️ **Warning:**  
> <span style="color:red; font-weight:bold;">Every time you run the server, you must update the API URL in both the frontend and backend `.env` files with your current IP address.</span>  
>  
> 💡 **Frontend:**  
> Set `VITE_API_URL` in `frontend/.env` to your backend server URL (e.g., `http://your.ip.address:backend_port/`).  
>  
> 💡 **Backend:**  
> Set `FRONTEND_URL` in `backend/.env` to your frontend server URL (e.g., `http://your.ip.address:3000`).  
>  
> This is necessary because your local IP address may change between sessions. Failing to update these variables can cause connection issues between the frontend and backend.

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

## <a id="usage"></a>🖥️ Usage

- Register a new account or log in.
- Start chatting, sharing files, and switching between conversations.

---

## <a id="deployment"></a>⚙️ Deployment

- The backend serves the production React build from the `/dist` folder.
- For deployment, build the frontend with `npm run build` and copy the output to the backend's `dist` directory.
- Environment variables must be set on your deployment platform.

---

## <a id="author"></a>🧑‍💻 Author

- **Bramha Deshmukh**
- [GitHub](https://github.com/bramha-deshmukh17)

---

## <a id="references"></a>🌐 References

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Firebase](https://firebase.google.com/)

---

## <a id="contact"></a>📬 Contact

For any inquiries or feedback, please contact me at [bramha.deshmukh17@gmail.com](mailto:bramha.deshmukh17@gmail.com).

---
