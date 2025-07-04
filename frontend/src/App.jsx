import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./Theme/ThemeContext"; // Import the ThemeProvider
import Welcome from "./Welcome";
import Register from "./Authenticate/Register";
import Login from './Authenticate/Login';
import Chats from './chat_screens/Chats'
import Setting from './settings/Setting'
import ErrorBoundary from "./ErrorBoundary";
import NotFound from "./NotFound";
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/settings" element={<Setting />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
