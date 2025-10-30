import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import Header from "./components/Header";
import Viewer from "./components/Viewer";
import Creator from "./components/Creator";
import Admin from "./components/Admin";
import UploadVideo from "./components/UploadVideo";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("user"));
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  // Keep state synced with localStorage (optional, handles multiple tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("user"));
      setRole(localStorage.getItem("role") || "");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <Header
        isLoggedIn={isLoggedIn}
        role={role}
        setIsLoggedIn={setIsLoggedIn}
        setRole={setRole}
      />
      <Routes>
        <Route
          path="/"
          element={<Login setIsLoggedIn={setIsLoggedIn} setRole={setRole} />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/viewerhome" element={<Viewer />} />
        <Route path="/creatorhome" element={<Creator />} />
        <Route path="/adminhome" element={<Admin />} />
        <Route path='/uploadVideo' element={<UploadVideo/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
